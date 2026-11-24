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
import java.util.List;
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

    private MenuCategory findCategory(List<MenuCategory> menu, String name) {
        return menu.stream().filter(category -> category.getName().equals(name)).findFirst().orElseThrow();
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
    void getMyRestaurantsOnlyReturnsOwnRestaurants() {
        Restaurant mine = service.createRestaurant(owner.getId(), restaurantDTO("Pizzeria"));
        service.createRestaurant(otherUser.getId(), restaurantDTO("Burgerbar"));

        List<Restaurant> result = service.getMyRestaurants(owner.getId());

        assertEquals(1, result.size());
        assertEquals(mine.getId(), result.get(0).getId());
    }

    // ________________________________________________________

    @Test
    void getMyRestaurantReturnsRestaurantForOwner() {
        Restaurant restaurant = service.createRestaurant(owner.getId(), restaurantDTO("Pizzeria"));

        assertEquals(restaurant.getId(), service.getMyRestaurant(owner.getId(), restaurant.getId()).getId());
    }

    // ________________________________________________________

    @Test
    void getMyRestaurantByOtherUserThrows403() {
        Restaurant restaurant = service.createRestaurant(owner.getId(), restaurantDTO("Pizzeria"));

        ApiException exception = assertThrows(ApiException.class, () -> service.getMyRestaurant(otherUser.getId(), restaurant.getId()));

        assertEquals(403, exception.getStatus());
    }

    // ________________________________________________________

    @Test
    void addItemToCategoryOfOtherRestaurantThrows403() {
        MenuCategory category = createCategory();
        service.createRestaurant(otherUser.getId(), restaurantDTO("Burgerbar"));

        ApiException exception = assertThrows(ApiException.class, () -> service.addItem(otherUser.getId(), category.getId(), itemDTO("Margherita", new BigDecimal("79"))));

        assertEquals(403, exception.getStatus());
    }

    // ________________________________________________________

    @Test
    void addCategoryByOtherUserThrows403() {
        Restaurant restaurant = service.createRestaurant(owner.getId(), restaurantDTO("Pizzeria"));

        ApiException exception = assertThrows(ApiException.class, () -> service.addCategory(otherUser.getId(), restaurant.getId(), categoryDTO("Pizza")));

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

    // ________________________________________________________

    @Test
    void getMenuReturnsCategoriesWithTheirItems() {
        Restaurant restaurant = service.createRestaurant(owner.getId(), restaurantDTO("Pizzeria"));
        MenuCategory pizzas = service.addCategory(owner.getId(), restaurant.getId(), categoryDTO("Pizza"));
        MenuCategory drinks = service.addCategory(owner.getId(), restaurant.getId(), categoryDTO("Drinks"));
        service.addItem(owner.getId(), pizzas.getId(), itemDTO("Margherita", new BigDecimal("89.00")));
        service.addItem(owner.getId(), drinks.getId(), itemDTO("Cola", new BigDecimal("25.00")));

        List<MenuCategory> menu = service.getMenu(restaurant.getId());

        assertEquals(2, menu.size());
        assertEquals("Margherita", findCategory(menu, "Pizza").getItems().get(0).getName());
        assertEquals("Cola", findCategory(menu, "Drinks").getItems().get(0).getName());
    }

    // ________________________________________________________

    @Test
    void getMenuForUnknownRestaurantThrows404() {
        ApiException exception = assertThrows(ApiException.class, () -> service.getMenu(UUID.randomUUID()));

        assertEquals(404, exception.getStatus());
    }

    // ________________________________________________________

    @Test
    void setVisibilityByOwnerHidesAndShowsRestaurant() {
        Restaurant restaurant = service.createRestaurant(owner.getId(), restaurantDTO("Pizzeria"));

        service.setVisibility(owner.getId(), restaurant.getId(), false);
        assertFalse(service.getActiveRestaurants().stream().anyMatch(r -> r.getId().equals(restaurant.getId())));

        service.setVisibility(owner.getId(), restaurant.getId(), true);
        assertTrue(service.getActiveRestaurants().stream().anyMatch(r -> r.getId().equals(restaurant.getId())));
    }

    // ________________________________________________________

    @Test
    void setVisibilityOnlyChangesThatRestaurant() {
        Restaurant first = service.createRestaurant(owner.getId(), restaurantDTO("Pizzeria"));
        Restaurant second = service.createRestaurant(owner.getId(), restaurantDTO("Sushi Bar"));

        service.setVisibility(owner.getId(), first.getId(), false);

        assertFalse(service.getRestaurant(first.getId()).isActive());
        assertTrue(service.getRestaurant(second.getId()).isActive());
    }

    // ________________________________________________________

    @Test
    void setVisibilityByOtherUserThrows403AndKeepsRestaurantVisible() {
        Restaurant restaurant = service.createRestaurant(owner.getId(), restaurantDTO("Pizzeria"));

        ApiException exception = assertThrows(ApiException.class, () -> service.setVisibility(otherUser.getId(), restaurant.getId(), false));

        assertEquals(403, exception.getStatus());
        assertTrue(service.getRestaurant(restaurant.getId()).isActive());
    }

    // ________________________________________________________

    @Test
    void hiddenRestaurantAndMenuAreNotPublic() {
        Restaurant restaurant = service.createRestaurant(owner.getId(), restaurantDTO("Pizzeria"));
        service.setVisibility(owner.getId(), restaurant.getId(), false);

        assertEquals(404, assertThrows(ApiException.class, () -> service.getVisibleRestaurant(restaurant.getId())).getStatus());
        assertEquals(404, assertThrows(ApiException.class, () -> service.getMenu(restaurant.getId())).getStatus());
        assertEquals(restaurant.getId(), service.getMyRestaurant(owner.getId(), restaurant.getId()).getId());
    }

    // ________________________________________________________

    @Test
    void getActiveRestaurantsListsCreatedRestaurants() {
        Restaurant first = service.createRestaurant(owner.getId(), restaurantDTO("Pizzeria"));
        Restaurant second = service.createRestaurant(owner.getId(), restaurantDTO("Sushi Bar"));

        List<UUID> ids = service.getActiveRestaurants().stream().map(Restaurant::getId).toList();

        assertTrue(ids.contains(first.getId()));
        assertTrue(ids.contains(second.getId()));
    }

    // ________________________________________________________

    @Test
    void getActiveRestaurantsAreSortedByName() {
        Restaurant zeta = service.createRestaurant(owner.getId(), restaurantDTO("Zeta Kitchen"));
        Restaurant alpha = service.createRestaurant(owner.getId(), restaurantDTO("Alpha Kitchen"));

        List<UUID> ids = service.getActiveRestaurants().stream().map(Restaurant::getId).toList();

        assertTrue(ids.indexOf(alpha.getId()) < ids.indexOf(zeta.getId()));
    }

    // ________________________________________________________

    @Test
    void getActiveRestaurantsHidesInactiveRestaurants() {
        Restaurant restaurant = service.createRestaurant(owner.getId(), restaurantDTO("Closed Pizzeria"));
        restaurant.setActive(false);
        new RestaurantDAO(em).update(restaurant);

        List<UUID> ids = service.getActiveRestaurants().stream().map(Restaurant::getId).toList();

        assertFalse(ids.contains(restaurant.getId()));
    }

    // ________________________________________________________

    private MenuItem createItem() {
        return service.addItem(owner.getId(), createCategory().getId(), itemDTO("Margherita", new BigDecimal("89.00")));
    }

    // ________________________________________________________

    @Test
    void updateItemByOwnerChangesPriceAndDescription() {
        MenuItem item = createItem();
        MenuItemDTO changes = MenuItemDTO.builder()
                .price(new BigDecimal("99.00"))
                .description("Tomat, mozzarella og basilikum")
                .build();

        MenuItem updated = service.updateItem(owner.getId(), item.getId(), changes);

        assertEquals(0, new BigDecimal("99.00").compareTo(updated.getPrice()));
        assertEquals("Tomat, mozzarella og basilikum", updated.getDescription());
        assertEquals("Margherita", updated.getName());
        assertTrue(updated.isAvailable());
    }

    // ________________________________________________________

    @Test
    void updatedItemIsShownOnTheMenu() {
        MenuItem item = createItem();
        UUID restaurantId = item.getCategory().getRestaurant().getId();

        service.updateItem(owner.getId(), item.getId(), MenuItemDTO.builder().price(new BigDecimal("95.00")).build());

        MenuItem shown = findCategory(service.getMenu(restaurantId), "Pizza").getItems().get(0);
        assertEquals(0, new BigDecimal("95.00").compareTo(shown.getPrice()));
    }

    // ________________________________________________________

    @Test
    void markItemUnavailableKeepsItOnTheMenuAsUnavailable() {
        MenuItem item = createItem();
        UUID restaurantId = item.getCategory().getRestaurant().getId();

        service.updateItem(owner.getId(), item.getId(), MenuItemDTO.builder().available(false).build());

        MenuItem shown = findCategory(service.getMenu(restaurantId), "Pizza").getItems().get(0);
        assertFalse(shown.isAvailable());
        assertEquals(0, new BigDecimal("89.00").compareTo(shown.getPrice()));
    }

    // ________________________________________________________

    @Test
    void updateItemByOtherUserThrows403AndKeepsPrice() {
        MenuItem item = createItem();
        MenuItemDTO changes = MenuItemDTO.builder().price(new BigDecimal("1.00")).build();

        ApiException exception = assertThrows(ApiException.class,
                () -> service.updateItem(otherUser.getId(), item.getId(), changes));

        assertEquals(403, exception.getStatus());
        assertEquals(0, new BigDecimal("89.00").compareTo(item.getPrice()));
    }

    // ________________________________________________________

    @Test
    void updateItemWithInvalidPriceThrows400() {
        MenuItem item = createItem();
        MenuItemDTO changes = MenuItemDTO.builder().price(new BigDecimal("0")).build();

        ApiException exception = assertThrows(ApiException.class,
                () -> service.updateItem(owner.getId(), item.getId(), changes));

        assertEquals(400, exception.getStatus());
        assertEquals(0, new BigDecimal("89.00").compareTo(item.getPrice()));
    }

    // ________________________________________________________

    @Test
    void updateItemWithBlankNameThrows400() {
        MenuItem item = createItem();
        MenuItemDTO changes = MenuItemDTO.builder().name(" ").build();

        ApiException exception = assertThrows(ApiException.class,
                () -> service.updateItem(owner.getId(), item.getId(), changes));

        assertEquals(400, exception.getStatus());
        assertEquals("Margherita", item.getName());
    }

    // ________________________________________________________

    @Test
    void updateUnknownItemThrows404() {
        MenuItemDTO changes = MenuItemDTO.builder().price(new BigDecimal("50.00")).build();

        ApiException exception = assertThrows(ApiException.class,
                () -> service.updateItem(owner.getId(), UUID.randomUUID(), changes));

        assertEquals(404, exception.getStatus());
    }
}
