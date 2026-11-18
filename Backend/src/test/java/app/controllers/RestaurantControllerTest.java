package app.controllers;

import app.configs.TestHibernateConfig;
import app.entities.MenuCategory;
import app.entities.MenuItem;
import app.entities.Restaurant;
import app.entities.User;
import app.enums.Role;
import app.server.Setup;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class RestaurantControllerTest {

    private static final HttpClient CLIENT = HttpClient.newHttpClient();
    private static final ObjectMapper JSON = new ObjectMapper();

    private static EntityManagerFactory emf;
    private static Setup setup;
    private static String baseUrl;

    private static Restaurant activeRestaurant;

    // ________________________________________________________

    @BeforeAll
    static void startServer() {
        emf = TestHibernateConfig.getTestEmf();
        EntityManager em = emf.createEntityManager();

        setup = new Setup(em, 0);
        setup.initialize();
        baseUrl = "http://localhost:" + setup.getApp().port() + "/api";

        seed(em);
    }

    // ________________________________________________________

    @AfterAll
    static void stopServer() {
        setup.endSession();
        emf.close();
    }

    // ________________________________________________________

    private static void seed(EntityManager em) {
        em.getTransaction().begin();

        User owner = User.builder()
                .email(UUID.randomUUID() + "@test.dk")
                .roles(Set.of(Role.RESTAURANT_OWNER))
                .build();
        em.persist(owner);

        activeRestaurant = Restaurant.builder().name("Burger Barn").description("Smash burgers").owner(owner).build();

        MenuCategory burgers = MenuCategory.builder().name("Burgers").sortOrder(1).build();
        burgers.addItem(MenuItem.builder().name("Classic Burger").description("Beef, cheddar").price(new BigDecimal("95.00")).build());
        burgers.addItem(MenuItem.builder().name("Veggie Burger").price(new BigDecimal("99.00")).available(false).build());
        activeRestaurant.addCategory(burgers);

        MenuCategory sides = MenuCategory.builder().name("Sides").sortOrder(2).build();
        sides.addItem(MenuItem.builder().name("Fries").price(new BigDecimal("35.00")).build());
        activeRestaurant.addCategory(sides);

        em.persist(activeRestaurant);

        em.persist(Restaurant.builder().name("Closed Diner").owner(owner).active(false).build());

        em.getTransaction().commit();
    }

    // ________________________________________________________

    private static HttpResponse<String> get(String path) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder(URI.create(baseUrl + path)).GET().build();
        return CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
    }

    // ________________________________________________________

    private static List<String> names(JsonNode array) {
        List<String> names = new ArrayList<>();
        array.forEach(node -> names.add(node.get("name").asText()));
        return names;
    }

    // ________________________________________________________

    private static JsonNode findItem(JsonNode body, String itemName) {
        for (JsonNode category : body.get("data")) {
            for (JsonNode item : category.get("items")) {
                if (item.get("name").asText().equals(itemName)) {
                    return item;
                }
            }
        }
        throw new AssertionError("Menu item not found: " + itemName);
    }

    // ________________________________________________________

    @Test
    void getRestaurantsReturnsActiveRestaurants() throws Exception {
        HttpResponse<String> response = get("/restaurants");

        assertEquals(200, response.statusCode());
        JsonNode restaurants = JSON.readTree(response.body()).get("data").get("data");
        assertTrue(names(restaurants).contains("Burger Barn"));
    }

    // ________________________________________________________

    @Test
    void getRestaurantsHidesInactiveRestaurants() throws Exception {
        HttpResponse<String> response = get("/restaurants");

        JsonNode restaurants = JSON.readTree(response.body()).get("data").get("data");
        assertFalse(names(restaurants).contains("Closed Diner"));
    }

    // ________________________________________________________

    @Test
    void getMenuReturnsCategoriesInSortOrder() throws Exception {
        HttpResponse<String> response = get("/restaurant/menu/" + activeRestaurant.getId());

        assertEquals(200, response.statusCode());
        JsonNode menu = JSON.readTree(response.body()).get("data");
        assertEquals(List.of("Burgers", "Sides"), names(menu));
    }

    // ________________________________________________________

    @Test
    void getMenuItemsHaveNameDescriptionAndPrice() throws Exception {
        HttpResponse<String> response = get("/restaurant/menu/" + activeRestaurant.getId());

        JsonNode classic = findItem(JSON.readTree(response.body()), "Classic Burger");
        assertEquals("Classic Burger", classic.get("name").asText());
        assertEquals("Beef, cheddar", classic.get("description").asText());
        assertEquals(0, new BigDecimal("95.00").compareTo(classic.get("price").decimalValue()));
    }

    // ________________________________________________________

    @Test
    void getMenuMarksUnavailableItems() throws Exception {
        HttpResponse<String> response = get("/restaurant/menu/" + activeRestaurant.getId());

        JsonNode body = JSON.readTree(response.body());
        assertTrue(findItem(body, "Classic Burger").get("available").asBoolean());
        assertFalse(findItem(body, "Veggie Burger").get("available").asBoolean());
    }

    // ________________________________________________________

    @Test
    void getMenuForUnknownRestaurantReturns404() throws Exception {
        HttpResponse<String> response = get("/restaurant/menu/" + UUID.randomUUID());

        assertEquals(404, response.statusCode());
    }

    // ________________________________________________________

    @Test
    void getMenuWithInvalidIdReturns400() throws Exception {
        HttpResponse<String> response = get("/restaurant/menu/not-a-uuid");

        assertEquals(400, response.statusCode());
    }
}
