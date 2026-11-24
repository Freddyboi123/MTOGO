package app.services;

import app.configs.TestHibernateConfig;
import app.daos.OrderDAO;
import app.dtos.DeliveryAssignmentDTO;
import app.entities.Delivery;
import app.entities.DeliveryAgent;
import app.entities.Order;
import app.entities.Restaurant;
import app.entities.User;
import app.enums.DeliveryStatus;
import app.enums.OrderStatus;
import app.enums.Notifications;
import app.enums.Role;
import app.exceptions.ApiException;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.LockModeType;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.RepeatedTest;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import static org.junit.jupiter.api.Assertions.*;

class DeliveryAssignmentServiceTest {
    private EntityManagerFactory emf;
    private EntityManager em;
    private DeliveryAssignmentService service;
    private UUID agentA;
    private UUID agentB;
    private UUID orderId;
    private UUID customerId;
    private UUID restaurantId;

    @BeforeEach
    void setUp() {
        emf = TestHibernateConfig.getTestEmf();
        em = emf.createEntityManager();
        service = new DeliveryAssignmentService(em);
        em.getTransaction().begin();
        User customer = createUser();
        User owner = createUser();
        User driverA = createUser();
        User driverB = createUser();
        driverA.setRoles(Set.of(Role.DELIVERY_AGENT));
        driverB.setRoles(Set.of(Role.DELIVERY_AGENT));
        em.persist(DeliveryAgent.builder().user(driverA).build());
        em.persist(DeliveryAgent.builder().user(driverB).build());
        Restaurant restaurant = Restaurant.builder().name("Test Pizza").owner(owner).build();
        em.persist(restaurant);
        customerId = customer.getId();
        restaurantId = restaurant.getId();
        agentA = driverA.getId();
        agentB = driverB.getId();
        Order order = newOrder(OrderStatus.READY_FOR_PICKUP);
        em.persist(order);
        em.getTransaction().commit();
        orderId = order.getId();
        em.clear();
    }

    @AfterEach
    void tearDown() {
        if (em != null && em.isOpen()) {
            if (em.getTransaction().isActive()) em.getTransaction().rollback();
            em.close();
        }
        if (emf != null && emf.isOpen()) emf.close();
    }

    private User createUser() {
        User user = User.builder().email(UUID.randomUUID() + "@test.dk").build();
        em.persist(user);
        return user;
    }

    private Order newOrder(OrderStatus status) {
        return Order.builder()
                .customer(em.getReference(User.class, customerId))
                .restaurant(em.getReference(Restaurant.class, restaurantId))
                .status(status)
                .expectedPickupAt(LocalDateTime.of(2026, 11, 24, 18, 0))
                .build();
    }

    private List<UUID> availableIds() {
        // Use the same overview service as the existing available-deliveries endpoint.
        return new DeliveryOverviewService(new OrderDAO(em)).getAvailableDeliveries()
                .stream().map(dto -> dto.orderId()).toList();
    }

    private List<Delivery> assignments() {
        em.clear();
        return em.createQuery("SELECT d FROM Delivery d JOIN FETCH d.agent a JOIN FETCH a.user WHERE d.order.id = :id", Delivery.class)
                .setParameter("id", orderId).getResultList();
    }



    @Test
    void acceptsOrderAndRemovesItFromAvailableDeliveries() {
        assertTrue(availableIds().contains(orderId));
        DeliveryAssignmentDTO result = service.accept(orderId, agentA);
        assertEquals(orderId, result.getOrderId());
        assertNotNull(result.getDeliveryId());
        assertNotNull(result.getAssignedAt());
        assertEquals(DeliveryStatus.ASSIGNED, result.getDeliveryStatus());
        assertEquals(OrderStatus.READY_FOR_PICKUP, result.getOrderStatus());
        List<Delivery> persisted = assignments();
        assertEquals(1, persisted.size());
        assertEquals(result.getDeliveryId(), persisted.getFirst().getId());
        assertEquals(agentA, persisted.getFirst().getAgent().getUser().getId());
        assertFalse(availableIds().contains(orderId));
    }
    @Test
    void rejectsAnOrderThatHasAlreadyBeenAccepted() {
        service.accept(orderId, agentA);
        ApiException exception = assertThrows(ApiException.class, () -> service.accept(orderId, agentB));
        assertEquals(409, exception.getStatus());
        assertEquals(Notifications.DELIVERY_ALREADY_TAKEN.getDisplayName(), exception.getMessage());
        assertFalse(em.getTransaction().isActive());
        List<Delivery> persisted = assignments();
        assertEquals(1, persisted.size());
        assertEquals(agentA, persisted.getFirst().getAgent().getUser().getId());
    }
