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

    @RepeatedTest(3)
    void onlyOneAgentCanAcceptTheSameOrderConcurrently() throws Exception {
        CyclicBarrier start = new CyclicBarrier(2);
        ExecutorService executor = Executors.newFixedThreadPool(2);
        Claim first;
        Claim second;
        try {
            Future<Claim> a = executor.submit(() -> claim(agentA, start));
            Future<Claim> b = executor.submit(() -> claim(agentB, start));
            first = a.get(30, TimeUnit.SECONDS);
            second = b.get(30, TimeUnit.SECONDS);
        } finally {
            executor.shutdownNow();
            assertTrue(executor.awaitTermination(15, TimeUnit.SECONDS), "Claim workers did not terminate");
        }
        assertNotEquals(first.accepted(), second.accepted(), "Exactly one agent must succeed");
        Claim winner = first.accepted() ? first : second;
        Claim loser = first.accepted() ? second : first;
        assertEquals(409, loser.status());
        assertEquals(Notifications.DELIVERY_ALREADY_TAKEN.getDisplayName(), loser.message());
        List<Delivery> persisted = assignments();
        assertEquals(1, persisted.size());
        assertEquals(winner.userId(), persisted.getFirst().getAgent().getUser().getId());
        assertEquals(List.of(orderId), service.mine(winner.userId()).stream().map(DeliveryAssignmentDTO::getOrderId).toList());
        assertTrue(service.mine(loser.userId()).isEmpty());
        assertFalse(availableIds().contains(orderId));
    }

    private Claim claim(UUID userId, CyclicBarrier start) throws Exception {
        // A distinct EntityManager per thread bypasses the service's synchronized(em) monitor.
        try (EntityManager worker = emf.createEntityManager()) {
            DeliveryAssignmentService workerService = new DeliveryAssignmentService(worker);
            start.await(10, TimeUnit.SECONDS);
            try {
                workerService.accept(orderId, userId);
                return new Claim(userId, true, 0, null);
            } catch (ApiException exception) {
                return new Claim(userId, false, exception.getStatus(), exception.getMessage());
            }
        }
    }

    private record Claim(UUID userId, boolean accepted, int status, String message) {}

    @Test
    void mineReturnsOnlyOwnActiveDeliveriesWithTheirStatus() {
        service.accept(orderId, agentA);
        em.getTransaction().begin();
        Order other = newOrder(OrderStatus.READY_FOR_PICKUP);
        Order completed = newOrder(OrderStatus.READY_FOR_PICKUP);
        Order pickedUp = newOrder(OrderStatus.READY_FOR_PICKUP);
        em.persist(pickedUp);
        em.persist(other);
        em.persist(completed);
        em.getTransaction().commit();
        service.accept(other.getId(), agentB);
        DeliveryAssignmentDTO completedAssignment = service.accept(completed.getId(), agentA);
        DeliveryAssignmentDTO pickedUpAssignment = service.accept(pickedUp.getId(), agentA);
        em.getTransaction().begin();
        em.find(Delivery.class, completedAssignment.getDeliveryId()).setStatus(DeliveryStatus.DELIVERED);
        em.find(Order.class, completed.getId()).setStatus(OrderStatus.DELIVERED);
        em.find(Delivery.class, pickedUpAssignment.getDeliveryId()).setStatus(DeliveryStatus.PICKED_UP);
        em.find(Order.class, pickedUp.getId()).setStatus(OrderStatus.OUT_FOR_DELIVERY);
        em.getTransaction().commit();
        em.clear();
        List<DeliveryAssignmentDTO> mine = service.mine(agentA);
        assertEquals(2, mine.size());
        DeliveryAssignmentDTO assigned = mine.stream().filter(d -> orderId.equals(d.getOrderId())).findFirst().orElseThrow();
        DeliveryAssignmentDTO picked = mine.stream().filter(d -> pickedUp.getId().equals(d.getOrderId())).findFirst().orElseThrow();
        assertEquals(DeliveryStatus.ASSIGNED, assigned.getDeliveryStatus());
        assertEquals(OrderStatus.READY_FOR_PICKUP, assigned.getOrderStatus());
        assertEquals(DeliveryStatus.PICKED_UP, picked.getDeliveryStatus());
        assertEquals(OrderStatus.OUT_FOR_DELIVERY, picked.getOrderStatus());
        assertEquals(List.of(other.getId()), service.mine(agentB).stream().map(DeliveryAssignmentDTO::getOrderId).toList());
    }

    @ParameterizedTest
    @EnumSource(value = OrderStatus.class, mode = EnumSource.Mode.EXCLUDE, names = "READY_FOR_PICKUP")
    void rejectsOrderThatIsNotReadyForPickup(OrderStatus status) {
        em.getTransaction().begin();
        em.find(Order.class, orderId).setStatus(status);
        em.getTransaction().commit();
        ApiException exception = assertThrows(ApiException.class, () -> service.accept(orderId, agentA));
        assertEquals(409, exception.getStatus());
        assertEquals(Notifications.DELIVERY_ALREADY_TAKEN.getDisplayName(), exception.getMessage());
        assertTrue(assignments().isEmpty());
    }

    @Test
    void rejectsInactiveAgentWithoutChangingAvailability() {
        em.getTransaction().begin();
        DeliveryAgent agent = em.createQuery("SELECT a FROM DeliveryAgent a WHERE a.user.id = :id", DeliveryAgent.class)
                .setParameter("id", agentA).getSingleResult();
        agent.setActive(false);
        em.getTransaction().commit();
        ApiException exception = assertThrows(ApiException.class, () -> service.accept(orderId, agentA));
        assertEquals(403, exception.getStatus());
        assertEquals(Notifications.DELIVERY_AGENT_NOT_ACTIVE.getDisplayName(), exception.getMessage());
        assertFalse(em.getTransaction().isActive());
        assertTrue(assignments().isEmpty());
        assertTrue(availableIds().contains(orderId));
        assertEquals(orderId, service.accept(orderId, agentB).getOrderId());
    }

    @Test
    void rejectsMissingOrderAndAllowsNextValidClaim() {
        UUID missingId = UUID.randomUUID();
        ApiException exception = assertThrows(ApiException.class, () -> service.accept(missingId, agentA));
        assertEquals(404, exception.getStatus());
        assertEquals(Notifications.ORDER_NOT_FOUND.getDisplayName(), exception.getMessage());
        assertFalse(em.getTransaction().isActive());
        assertTrue(assignments().isEmpty());
        assertTrue(availableIds().contains(orderId));
        assertEquals(orderId, service.accept(orderId, agentA).getOrderId());
    }

    @Test
    void rejectsDuplicateClaimBySameAgent() {
        DeliveryAssignmentDTO accepted = service.accept(orderId, agentA);
        ApiException exception = assertThrows(ApiException.class, () -> service.accept(orderId, agentA));
        assertEquals(409, exception.getStatus());
        assertEquals(Notifications.DELIVERY_ALREADY_TAKEN.getDisplayName(), exception.getMessage());
        assertEquals(1, assignments().size());
        assertEquals(accepted.getDeliveryId(), assignments().getFirst().getId());
    }
