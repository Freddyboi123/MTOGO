package app.services;

import app.configs.TestHibernateConfig;
import app.daos.OrderDAO;
import app.dtos.AvailableDeliveryDTO;
import app.entities.Address;
import app.entities.Delivery;
import app.entities.DeliveryAgent;
import app.entities.Order;
import app.entities.Payment;
import app.entities.Restaurant;
import app.entities.User;
import app.enums.OrderStatus;
import app.enums.PaymentStatus;
import app.mappers.AvailableDeliveryMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class DeliveryOverviewServiceTest {

    private EntityManagerFactory emf;
    private EntityManager em;
    private OrderDAO orderDAO;
    private DeliveryOverviewService service;
    private User customer;
    private Restaurant restaurant;

    @BeforeEach
    void setUp() {
        emf = TestHibernateConfig.getTestEmf();
        em = emf.createEntityManager();
        orderDAO = new OrderDAO(em);
        service = new DeliveryOverviewService(orderDAO);

        em.getTransaction().begin();
        customer = User.builder().email(UUID.randomUUID() + "@test.dk").build();
        User owner = User.builder().email(UUID.randomUUID() + "@test.dk").build();
        em.persist(customer);
        em.persist(owner);
        restaurant = Restaurant.builder()
                .name("Test Pizza")
                .owner(owner)
                .address(Address.builder()
                        .street("Pickup Street 3")
                        .postalCode("2100")
                        .city("Copenhagen")
                        .build())
                .build();
        em.persist(restaurant);
        em.getTransaction().commit();
    }

    @AfterEach
    void tearDown() {
        em.close();
        emf.close();
    }

    private Order createOrder(OrderStatus status, LocalDateTime expectedPickupAt) {
        return orderDAO.create(Order.builder()
                .customer(customer)
                .restaurant(restaurant)
                .deliveryAddress(Address.builder()
                        .street("Customer Street 7")
                        .postalCode("2200")
                        .city("Copenhagen")
                        .build())
                .status(status)
                .expectedPickupAt(expectedPickupAt)
                .createdAt(LocalDateTime.now())
                .build());
    }

    @Test
    void onlyReadyUnassignedOrdersAreVisibleWithCorrectDetails() {
        LocalDateTime pickupTime = LocalDateTime.of(2026, 11, 23, 17, 45);
        Order available = createOrder(OrderStatus.READY_FOR_PICKUP, pickupTime);
        createOrder(OrderStatus.RECEIVED, pickupTime);
        createOrder(OrderStatus.PREPARING, pickupTime);
        createOrder(OrderStatus.CANCELLED, pickupTime);
        createOrder(OrderStatus.DELIVERED, pickupTime);
        Order alreadyAssigned = createOrder(OrderStatus.READY_FOR_PICKUP, pickupTime);

        em.getTransaction().begin();
        User driver = User.builder().email(UUID.randomUUID() + "@test.dk").build();
        em.persist(driver);
        DeliveryAgent agent = DeliveryAgent.builder().user(driver).build();
        em.persist(agent);
        em.persist(Delivery.builder().order(alreadyAssigned).agent(agent).build());
        em.getTransaction().commit();
        em.clear();

        List<AvailableDeliveryDTO> result = service.getAvailableDeliveries();

        assertEquals(1, result.size());
        AvailableDeliveryDTO dto = result.getFirst();
        assertEquals(available.getId(), dto.orderId());
        assertEquals("Test Pizza", dto.restaurantName());
        assertEquals("Pickup Street 3", dto.pickupStreet());
        assertEquals("2100", dto.pickupPostalCode());
        assertEquals("Customer Street 7", dto.deliveryStreet());
        assertEquals("2200", dto.deliveryPostalCode());
        assertEquals(pickupTime.toString(), dto.expectedPickupAt());
    }

    @Test
    void emptyListWhenNoReadyUnassignedOrdersExist() {
        createOrder(OrderStatus.RECEIVED, null);
        assertTrue(service.getAvailableDeliveries().isEmpty());
    }

    @Test
    void deliveryDetailsNeverExposePaymentInformation() throws Exception {
        Order order = createOrder(OrderStatus.READY_FOR_PICKUP, null);
        order.setPayment(Payment.builder()
                .amount(new BigDecimal("199.00"))
                .status(PaymentStatus.COMPLETED)
                .build());

        AvailableDeliveryDTO dto = new AvailableDeliveryMapper().toDTO(order);
        String json = new ObjectMapper().writeValueAsString(dto);

        assertFalse(json.contains("payment"));
        assertFalse(json.contains("Payment"));
        assertFalse(json.contains("total"));
        assertFalse(json.contains("199.00"));
        assertNull(dto.expectedPickupAt());
    }
}
