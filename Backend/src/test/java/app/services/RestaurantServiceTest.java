package app.services;

import app.configs.TestHibernateConfig;
import app.daos.MenuCategoryDAO;
import app.daos.MenuItemDAO;
import app.daos.RestaurantDAO;
import app.daos.UserDAO;
import app.dtos.MenuCategoryDTO;
import app.dtos.MenuItemDTO;
import app.dtos.RestaurantDTO;
import app.entities.MenuCategory;
import app.entities.MenuItem;
import app.entities.Restaurant;
import app.entities.User;
import app.enums.Role;
import app.exceptions.ApiException;
import app.mappers.RestaurantMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class RestaurantServiceTest {

    private static EntityManagerFactory emf;
    private static EntityManager em;

    private UserDAO userDAO;
    private RestaurantService service;
    private User owner;
    private User otherUser;

    // ________________________________________________________

    @BeforeAll
    static void setUpDatabase() {
        emf = TestHibernateConfig.getTestEmf();
        em = emf.createEntityManager();
    }

    // ________________________________________________________

    @AfterAll
    static void closeDatabase() {
        em.close();
        emf.close();
    }

    // ________________________________________________________

    @BeforeEach
    void setUp() {
        userDAO = new UserDAO(em);
        service = new RestaurantService(
                new RestaurantDAO(em),
                new MenuCategoryDAO(em),
                new MenuItemDAO(em),
                userDAO
        );
        owner = createUser();
        otherUser = createUser();
    }

    // ________________________________________________________

    private User createUser() {
        return userDAO.create(User.builder()
                .email(UUID.randomUUID() + "@test.dk")
                .roles(Set.of(Role.RESTAURANT_OWNER))
                .build());
    }

    // ________________________________________________________

    private RestaurantDTO restaurantDTO(String name) {
        return RestaurantDTO.builder()
                .name(name)
                .street("Testvej 1")
                .postalCode("2800")
                .city("Kongens Lyngby")
                .build();
    }

    // ________________________________________________________

    private MenuCategoryDTO categoryDTO(String name) {
        return MenuCategoryDTO.builder()
                .name(name)
                .sortOrder(1)
                .build();
    }

    // ________________________________________________________

    private MenuItemDTO itemDTO(String name, BigDecimal price) {
        return MenuItemDTO.builder()
                .name(name)
                .price(price)
                .build();
    }

    // ________________________________________________________

    private MenuCategory createCategory() {
        Restaurant restaurant = service.createRestaurant(owner.getId(), restaurantDTO("Pizzeria"));
        return service.addCategory(owner.getId(), restaurant.getId(), categoryDTO("Pizza"));
    }

    // ________________________________________________________

    @Test
    void createRestaurantSavesRestaurantWithOwner() {
        Restaurant restaurant = service.createRestaurant(owner.getId(), restaurantDTO("Pizzeria"));

        assertNotNull(restaurant.getId());
        assertEquals("Pizzeria", restaurant.getName());
        assertEquals(owner.getId(), restaurant.getOwner().getId());
    }

    // ________________________________________________________

    @Test
    void createRestaurantWithoutNameThrows400() {
        ApiException exception = assertThrows(ApiException.class,
                () -> service.createRestaurant(owner.getId(), restaurantDTO(" ")));

        assertEquals(400, exception.getStatus());
    }

    // ________________________________________________________

    @Test
    void createRestaurantWithUnknownOwnerThrows404() {
        ApiException exception = assertThrows(ApiException.class,
                () -> service.createRestaurant(UUID.randomUUID(), restaurantDTO("Pizzeria")));

        assertEquals(404, exception.getStatus());
    }

    // ________________________________________________________

    @Test
    void getRestaurantWithUnknownIdThrows404() {
        ApiException exception = assertThrows(ApiException.class,
                () -> service.getRestaurant(UUID.randomUUID()));

        assertEquals(404, exception.getStatus());
    }

    // ________________________________________________________

    @Test
    void addCategoryByOwnerAddsCategoryToRestaurant() {
        Restaurant restaurant = service.createRestaurant(owner.getId(), restaurantDTO("Pizzeria"));

        MenuCategory category = service.addCategory(owner.getId(), restaurant.getId(), categoryDTO("Pizza"));

        assertNotNull(category.getId());
        assertEquals(1, service.getRestaurant(restaurant.getId()).getCategories().size());
    }

    // ________________________________________________________

    @Test
    void addCategoryByOtherUserThrows403() {
        Restaurant restaurant = service.createRestaurant(owner.getId(), restaurantDTO("Pizzeria"));

        ApiException exception = assertThrows(ApiException.class,
                () -> service.addCategory(otherUser.getId(), restaurant.getId(), categoryDTO("Pizza")));

        assertEquals(403, exception.getStatus());
    }

    // ________________________________________________________

    @Test
    void addCategoryToUnknownRestaurantThrows404() {
        ApiException exception = assertThrows(ApiException.class,
                () -> service.addCategory(owner.getId(), UUID.randomUUID(), categoryDTO("Pizza")));

        assertEquals(404, exception.getStatus());
    }

    // ________________________________________________________

    @Test
    void addItemByOwnerSavesItemWithPrice() {
        MenuCategory category = createCategory();

        MenuItem item = service.addItem(owner.getId(), category.getId(), itemDTO("Margherita", new BigDecimal("89.00")));

        assertNotNull(item.getId());
        assertEquals(0, new BigDecimal("89.00").compareTo(item.getPrice()));
        assertTrue(item.isAvailable());
    }

    // ________________________________________________________

    @Test
    void addItemByOtherUserThrows403() {
        MenuCategory category = createCategory();

        ApiException exception = assertThrows(ApiException.class,
                () -> service.addItem(otherUser.getId(), category.getId(), itemDTO("Margherita", new BigDecimal("89.00"))));

        assertEquals(403, exception.getStatus());
    }

    // ________________________________________________________

    @Test
    void addItemWithNegativePriceThrows400() {
        MenuCategory category = createCategory();

        ApiException exception = assertThrows(ApiException.class,
                () -> service.addItem(owner.getId(), category.getId(), itemDTO("Margherita", new BigDecimal("-1"))));

        assertEquals(400, exception.getStatus());
    }

    // ________________________________________________________

    @Test
    void addItemWithoutPriceThrows400() {
        MenuCategory category = createCategory();

        ApiException exception = assertThrows(ApiException.class,
                () -> service.addItem(owner.getId(), category.getId(), itemDTO("Margherita", null)));

        assertEquals(400, exception.getStatus());
    }

    // ________________________________________________________

    @Test
    void addItemToUnknownCategoryThrows404() {
        ApiException exception = assertThrows(ApiException.class,
                () -> service.addItem(owner.getId(), UUID.randomUUID(), itemDTO("Margherita", new BigDecimal("89.00"))));

        assertEquals(404, exception.getStatus());
    }

    // ________________________________________________________

    @Test
    void menuShowsCategoriesItemsAndPrices() {
        Restaurant restaurant = service.createRestaurant(owner.getId(), restaurantDTO("Pizzeria"));
        MenuCategory category = service.addCategory(owner.getId(), restaurant.getId(), categoryDTO("Pizza"));
        service.addItem(owner.getId(), category.getId(), itemDTO("Margherita", new BigDecimal("89.00")));

        RestaurantDTO dto = new RestaurantMapper().toDTO(service.getRestaurant(restaurant.getId()));

        assertEquals(1, dto.getCategories().size());
        MenuItemDTO item = dto.getCategories().get(0).getItems().get(0);
        assertEquals("Margherita", item.getName());
        assertEquals(0, new BigDecimal("89.00").compareTo(item.getPrice()));
    }
}
