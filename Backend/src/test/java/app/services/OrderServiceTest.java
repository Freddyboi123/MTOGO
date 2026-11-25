package app.services;

import app.configs.TestHibernateConfig;
import app.daos.MenuCategoryDAO;
import app.daos.MenuItemDAO;
import app.daos.OrderDAO;
import app.daos.RestaurantDAO;
import app.daos.UserDAO;
import app.dtos.MenuCategoryDTO;
import app.dtos.MenuItemDTO;
import app.dtos.OrderDTO;
import app.dtos.OrderLineDTO;
import app.dtos.RestaurantDTO;
import app.entities.MenuCategory;
import app.entities.MenuItem;
import app.entities.Order;
import app.entities.Restaurant;
import app.entities.User;
import app.enums.OrderStatus;
import app.enums.PaymentStatus;
import app.enums.Role;
import app.exceptions.ApiException;
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

class OrderServiceTest {

    private static EntityManagerFactory emf;
    private static EntityManager em;

    private UserDAO userDAO;
    private OrderDAO orderDAO;
    private MenuItemDAO itemDAO;
    private RestaurantService restaurantService;
    private OrderService orderService;
    private User customer;
    private User owner;
    private Restaurant restaurant;
    private MenuItem margherita;
    private MenuItem burrata;

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
        orderDAO = new OrderDAO(em);
        itemDAO = new MenuItemDAO(em);
        RestaurantDAO restaurantDAO = new RestaurantDAO(em);

        restaurantService = new RestaurantService(restaurantDAO, new MenuCategoryDAO(em), itemDAO, userDAO);
        orderService = new OrderService(orderDAO, restaurantDAO, itemDAO, userDAO, new MockPaymentService());

        customer = createUser(Role.CUSTOMER);
        owner = createUser(Role.RESTAURANT_OWNER);

        restaurant = restaurantService.createRestaurant(owner.getId(), restaurantDTO("Pizzeria"));
        MenuCategory pizza = restaurantService.addCategory(owner.getId(), restaurant.getId(), categoryDTO("Pizza"));
        margherita = restaurantService.addItem(owner.getId(), pizza.getId(), itemDTO("Margherita", "119.00", true));
        burrata = restaurantService.addItem(owner.getId(), pizza.getId(), itemDTO("Burrata", "129.00", true));
    }

    // ________________________________________________________

    private User createUser(Role role) {
        return userDAO.create(User.builder()
                .email(UUID.randomUUID() + "@test.dk")
                .roles(Set.of(role))
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

    private MenuItemDTO itemDTO(String name, String price, boolean available) {
        return MenuItemDTO.builder()
                .name(name)
                .price(new BigDecimal(price))
                .available(available)
                .build();
    }

    // ________________________________________________________

    private OrderLineDTO line(MenuItem item, int quantity) {
        return OrderLineDTO.builder()
                .menuItemId(item.getId())
                .quantity(quantity)
                .build();
    }

    // ________________________________________________________

    private OrderDTO orderDTO(List<OrderLineDTO> lines) {
        return OrderDTO.builder()
                .restaurantId(restaurant.getId())
                .street("Nørrebrogade 18")
                .postalCode("2200")
                .city("København N")
                .lines(lines)
                .build();
    }

    // ________________________________________________________

    private long countOrders() {
        return orderDAO.getAll().size();
    }

    // ________________________________________________________

    @Test
    void placeOrderCreatesReceivedOrderWithTotal() {
        Order order = orderService.placeOrder(customer.getId(), orderDTO(List.of(line(margherita, 2), line(burrata, 1))));

        assertNotNull(order.getId());
        assertEquals(OrderStatus.RECEIVED, order.getStatus());
        assertEquals(0, new BigDecimal("367.00").compareTo(order.getTotalInclVat()));
        assertEquals(0, new BigDecimal("293.60").compareTo(order.getTotalExclVat()));
        assertEquals(2, order.getLines().size());
        assertEquals(customer.getId(), order.getCustomer().getId());
        assertEquals("Nørrebrogade 18", order.getDeliveryAddress().getStreet());
    }

    // ________________________________________________________

    @Test
    void placeOrderRegistersCompletedPaymentAndStatusHistory() {
        Order order = orderService.placeOrder(customer.getId(), orderDTO(List.of(line(margherita, 1))));

        assertEquals(PaymentStatus.COMPLETED, order.getPayment().getStatus());
        assertEquals(0, new BigDecimal("119.00").compareTo(order.getPayment().getAmount()));
        assertEquals(1, order.getStatusHistory().size());
        assertEquals(OrderStatus.RECEIVED, order.getStatusHistory().get(0).getStatus());
    }

    // ________________________________________________________

    @Test
    void failedPaymentCreatesNoOrder() {
        OrderService failingPayment = new OrderService(orderDAO, new RestaurantDAO(em), itemDAO, userDAO, (customerId, amount) -> false);
        long before = countOrders();

        ApiException exception = assertThrows(ApiException.class,
                () -> failingPayment.placeOrder(customer.getId(), orderDTO(List.of(line(margherita, 1)))));

        assertEquals(402, exception.getStatus());
        assertEquals(before, countOrders());
    }

    // ________________________________________________________

    @Test
    void priceIsLockedWhenTheRestaurantChangesIt() {
        Order order = orderService.placeOrder(customer.getId(), orderDTO(List.of(line(margherita, 1))));

        margherita.setPrice(new BigDecimal("150.00"));
        itemDAO.update(margherita);
        em.clear();

        Order saved = orderDAO.getById(order.getId());

        assertEquals(0, new BigDecimal("119.00").compareTo(saved.getLines().get(0).getUnitPrice()));
        assertEquals(0, new BigDecimal("119.00").compareTo(saved.getTotalInclVat()));
    }

    // ________________________________________________________

    @Test
    void itemFromAnotherRestaurantThrows400() {
        User otherOwner = createUser(Role.RESTAURANT_OWNER);
        Restaurant other = restaurantService.createRestaurant(otherOwner.getId(), restaurantDTO("Burger Barn"));
        MenuCategory burgers = restaurantService.addCategory(otherOwner.getId(), other.getId(), categoryDTO("Burgers"));
        MenuItem burger = restaurantService.addItem(otherOwner.getId(), burgers.getId(), itemDTO("Cheeseburger", "99.00", true));

        ApiException exception = assertThrows(ApiException.class,
                () -> orderService.placeOrder(customer.getId(), orderDTO(List.of(line(margherita, 1), line(burger, 1)))));

        assertEquals(400, exception.getStatus());
    }

    // ________________________________________________________

    @Test
    void unavailableItemThrows400() {
        margherita.setAvailable(false);
        itemDAO.update(margherita);

        ApiException exception = assertThrows(ApiException.class,
                () -> orderService.placeOrder(customer.getId(), orderDTO(List.of(line(margherita, 1)))));

        assertEquals(400, exception.getStatus());
    }

    // ________________________________________________________

    @Test
    void emptyBasketThrows400() {
        ApiException exception = assertThrows(ApiException.class,
                () -> orderService.placeOrder(customer.getId(), orderDTO(List.of())));

        assertEquals(400, exception.getStatus());
    }

    // ________________________________________________________

    @Test
    void quantityBelowOneThrows400() {
        ApiException exception = assertThrows(ApiException.class,
                () -> orderService.placeOrder(customer.getId(), orderDTO(List.of(line(margherita, 0)))));

        assertEquals(400, exception.getStatus());
    }

    // ________________________________________________________

    @Test
    void missingAddressThrows400() {
        OrderDTO dto = orderDTO(List.of(line(margherita, 1)));
        dto.setStreet(" ");

        ApiException exception = assertThrows(ApiException.class,
                () -> orderService.placeOrder(customer.getId(), dto));

        assertEquals(400, exception.getStatus());
    }

    // ________________________________________________________

    @Test
    void unknownMenuItemThrows404() {
        OrderLineDTO unknown = OrderLineDTO.builder().menuItemId(UUID.randomUUID()).quantity(1).build();

        ApiException exception = assertThrows(ApiException.class,
                () -> orderService.placeOrder(customer.getId(), orderDTO(List.of(unknown))));

        assertEquals(404, exception.getStatus());
    }

    // ________________________________________________________

    @Test
    void unknownRestaurantThrows404() {
        OrderDTO dto = orderDTO(List.of(line(margherita, 1)));
        dto.setRestaurantId(UUID.randomUUID());

        ApiException exception = assertThrows(ApiException.class,
                () -> orderService.placeOrder(customer.getId(), dto));

        assertEquals(404, exception.getStatus());
    }

    // ________________________________________________________

    @Test
    void ownerSeesTheOrdersOfTheirRestaurant() {
        Order first = orderService.placeOrder(customer.getId(), orderDTO(List.of(line(margherita, 1))));
        Order second = orderService.placeOrder(customer.getId(), orderDTO(List.of(line(burrata, 2))));

        List<Order> orders = orderService.getRestaurantOrders(owner.getId(), restaurant.getId());

        assertEquals(2, orders.size());
        assertTrue(orders.stream().anyMatch(o -> o.getId().equals(first.getId())));
        assertTrue(orders.stream().anyMatch(o -> o.getId().equals(second.getId())));
        assertEquals("Nørrebrogade 18", orders.get(0).getDeliveryAddress().getStreet());
    }

    // ________________________________________________________

    @Test
    void ownerOnlySeesOrdersFromTheirOwnRestaurant() {
        User otherOwner = createUser(Role.RESTAURANT_OWNER);
        Restaurant other = restaurantService.createRestaurant(otherOwner.getId(), restaurantDTO("Burger Barn"));
        MenuCategory burgers = restaurantService.addCategory(otherOwner.getId(), other.getId(), categoryDTO("Burgers"));
        MenuItem burger = restaurantService.addItem(otherOwner.getId(), burgers.getId(), itemDTO("Cheeseburger", "99.00", true));
        OrderDTO otherOrder = orderDTO(List.of(line(burger, 1)));
        otherOrder.setRestaurantId(other.getId());

        orderService.placeOrder(customer.getId(), orderDTO(List.of(line(margherita, 1))));
        orderService.placeOrder(customer.getId(), otherOrder);

        List<Order> orders = orderService.getRestaurantOrders(owner.getId(), restaurant.getId());

        assertEquals(1, orders.size());
        assertEquals(restaurant.getId(), orders.get(0).getRestaurant().getId());
    }

    // ________________________________________________________

    @Test
    void anotherOwnerCanNotSeeTheOrdersThrows403() {
        User otherOwner = createUser(Role.RESTAURANT_OWNER);

        ApiException exception = assertThrows(ApiException.class,
                () -> orderService.getRestaurantOrders(otherOwner.getId(), restaurant.getId()));

        assertEquals(403, exception.getStatus());
    }

    // ________________________________________________________

    @Test
    void restaurantWithoutOrdersReturnsEmptyList() {
        assertTrue(orderService.getRestaurantOrders(owner.getId(), restaurant.getId()).isEmpty());
    }

    // ________________________________________________________

    @Test
    void ordersForUnknownRestaurantThrows404() {
        ApiException exception = assertThrows(ApiException.class,
                () -> orderService.getRestaurantOrders(owner.getId(), UUID.randomUUID()));

        assertEquals(404, exception.getStatus());
    }

    // ________________________________________________________

    @Test
    void customerSeesTheirOwnOrderHistory() {
        Order first = orderService.placeOrder(customer.getId(), orderDTO(List.of(line(margherita, 1))));
        Order second = orderService.placeOrder(customer.getId(), orderDTO(List.of(line(burrata, 2))));

        List<Order> orders = orderService.getMyOrders(customer.getId());

        assertEquals(2, orders.size());
        assertTrue(orders.stream().anyMatch(o -> o.getId().equals(first.getId())));
        assertTrue(orders.stream().anyMatch(o -> o.getId().equals(second.getId())));
        assertEquals("Pizzeria", orders.get(0).getRestaurant().getName());
    }

    // ________________________________________________________

    @Test
    void customerDoesNotSeeOtherCustomersOrders() {
        User otherCustomer = createUser(Role.CUSTOMER);
        orderService.placeOrder(otherCustomer.getId(), orderDTO(List.of(line(margherita, 1))));

        assertTrue(orderService.getMyOrders(customer.getId()).isEmpty());
    }

    // ________________________________________________________

    @Test
    void placedOrderGetsCommissionFromTheSlidingScale() {
        Order order = orderService.placeOrder(customer.getId(), orderDTO(List.of(line(margherita, 2), line(burrata, 1))));

        assertEquals(0, new BigDecimal("15.68").compareTo(order.getCommissionAmount()));
    }
}
