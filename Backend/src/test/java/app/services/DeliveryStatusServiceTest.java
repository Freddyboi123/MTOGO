package app.services;

import app.configs.TestHibernateConfig;
import app.dtos.DeliveryAssignmentDTO;
import app.entities.*;
import app.enums.DeliveryStatus;
import app.enums.Notifications;
import app.enums.OrderStatus;
import app.exceptions.ApiException;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.PersistenceException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.RepeatedTest;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.*;

import static org.junit.jupiter.api.Assertions.*;

class DeliveryStatusServiceTest {
    private EntityManagerFactory emf;
    private EntityManager em;
    private DeliveryAssignmentService service;
    private UUID orderId;
    private UUID ownerId;
    private UUID otherId;
    private UUID deliveryId;

    @BeforeEach
    void setUp() {
        emf = TestHibernateConfig.getTestEmf();
        em = emf.createEntityManager();
        service = new DeliveryAssignmentService(em);
        em.getTransaction().begin();
        User customer = user();
        User restaurantOwner = user();
        User driver = user();
        User other = user();
        em.persist(DeliveryAgent.builder().user(driver).build());
        em.persist(DeliveryAgent.builder().user(other).build());
        Restaurant restaurant = Restaurant.builder().name("Test Pizza").owner(restaurantOwner).build();
        em.persist(restaurant);
        Order order = Order.builder().customer(customer).restaurant(restaurant)
                .status(OrderStatus.READY_FOR_PICKUP).build();
        order.addStatusHistory(OrderStatusHistory.builder().status(OrderStatus.READY_FOR_PICKUP).build());
        em.persist(order);
        em.getTransaction().commit();
        orderId = order.getId();
        ownerId = driver.getId();
        otherId = other.getId();
        em.clear();
        deliveryId = service.accept(orderId, ownerId).getDeliveryId();
        em.clear();
    }

    private User user() {
        User user = User.builder().email(UUID.randomUUID() + "@test.dk").build();
        em.persist(user);
        return user;
    }

    @AfterEach
    void tearDown() {
        if (em != null && em.isOpen()) {
            if (em.getTransaction().isActive()) em.getTransaction().rollback();
            em.close();
        }
        if (emf != null && emf.isOpen()) emf.close();
    }

    private record State(OrderStatus order, DeliveryStatus delivery, LocalDateTime pickedUpAt,
                         LocalDateTime deliveredAt, UUID owner, List<OrderStatus> history) {}

    private State state() {
        try (EntityManager reader = emf.createEntityManager()) {
            Delivery delivery = reader.find(Delivery.class, deliveryId);
            Order order = reader.find(Order.class, orderId);
            return new State(order.getStatus(), delivery.getStatus(), delivery.getPickedUpAt(),
                    delivery.getDeliveredAt(), delivery.getAgent().getUser().getId(),
                    order.getStatusHistory().stream().map(OrderStatusHistory::getStatus).toList());
        }
    }

    private void rejected(int code, Notifications notification, Runnable call) {
        State before = state();
        ApiException error = assertThrows(ApiException.class, call::run);
        assertEquals(code, error.getStatus());
        assertEquals(notification.getDisplayName(), error.getMessage());
        assertFalse(em.getTransaction().isActive());
        assertEquals(before, state(), "Rejected transitions must not mutate either entity or history");
    }

    @Test
    void pickupUpdatesBothStatusesAndHistory() {
        service.startPickup(orderId, ownerId);
        DeliveryAssignmentDTO result = service.pickUp(orderId, ownerId);
        State actual = state();
        assertEquals(orderId, result.getOrderId());
        assertEquals(deliveryId, result.getDeliveryId());
        assertEquals(OrderStatus.OUT_FOR_DELIVERY, result.getOrderStatus());
        assertEquals(DeliveryStatus.PICKED_UP, result.getDeliveryStatus());
        assertEquals(OrderStatus.OUT_FOR_DELIVERY, actual.order());
        assertEquals(DeliveryStatus.PICKED_UP, actual.delivery());
        assertNotNull(actual.pickedUpAt());
        assertNull(actual.deliveredAt());
        assertEquals(ownerId, actual.owner());
        assertEquals(List.of(OrderStatus.READY_FOR_PICKUP, OrderStatus.OUT_FOR_DELIVERY), actual.history());
        assertEquals(DeliveryStatus.PICKED_UP, service.mine(ownerId).getFirst().getDeliveryStatus());
    }

    @Test
    void completionPersistsOneCompletedTaskForBonusAndRemovesActiveDelivery() {
        service.startPickup(orderId, ownerId);
        service.pickUp(orderId, ownerId);
        State pickedUp = state();
        DeliveryAssignmentDTO result = service.deliver(orderId, ownerId);
        State actual = state();
        assertEquals(OrderStatus.DELIVERED, result.getOrderStatus());
        assertEquals(DeliveryStatus.DELIVERED, result.getDeliveryStatus());
        assertEquals(OrderStatus.DELIVERED, actual.order());
        assertEquals(DeliveryStatus.DELIVERED, actual.delivery());
        assertEquals(pickedUp.pickedUpAt(), actual.pickedUpAt());
        assertNotNull(actual.deliveredAt());
        assertFalse(actual.deliveredAt().isBefore(actual.pickedUpAt()));
        assertEquals(ownerId, actual.owner());
        assertEquals(List.of(OrderStatus.READY_FOR_PICKUP, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED), actual.history());
        assertTrue(service.mine(ownerId).isEmpty());
        try (EntityManager reader = emf.createEntityManager()) {
            assertEquals(1L, reader.createQuery("""
                    SELECT COUNT(d) FROM Delivery d WHERE d.agent.user.id = :owner
                      AND d.status = :status AND d.deliveredAt IS NOT NULL
                      AND d.order.status = :orderStatus
                    """, Long.class).setParameter("owner", ownerId)
                    .setParameter("status", DeliveryStatus.DELIVERED)
                    .setParameter("orderStatus", OrderStatus.DELIVERED).getSingleResult().longValue());
        }
        rejected(409, Notifications.DELIVERY_STATUS_INVALID, () -> service.deliver(orderId, ownerId));
        rejected(409, Notifications.DELIVERY_STATUS_INVALID, () -> service.pickUp(orderId, ownerId));
    }

    @Test
    void mineShowsStatusChangesMadeByAnotherPersistenceContext() {
        assertEquals(DeliveryStatus.ASSIGNED, em.find(Delivery.class, deliveryId).getStatus());
        assertEquals(OrderStatus.READY_FOR_PICKUP, em.find(Order.class, orderId).getStatus());
        try (EntityManager worker = emf.createEntityManager()) {
            DeliveryAssignmentService otherServer = new DeliveryAssignmentService(worker);
            otherServer.startPickup(orderId, ownerId);
            otherServer.pickUp(orderId, ownerId);
            DeliveryAssignmentDTO current = service.mine(ownerId).getFirst();
            assertEquals(DeliveryStatus.PICKED_UP, current.getDeliveryStatus());
            assertEquals(OrderStatus.OUT_FOR_DELIVERY, current.getOrderStatus());
            otherServer.deliver(orderId, ownerId);
            assertTrue(service.mine(ownerId).isEmpty());
        }
    }

    @Test
    void anotherAgentCannotPickUpOrDeliver() {
        rejected(403, Notifications.DELIVERY_NOT_OWNED, () -> service.pickUp(orderId, otherId));
        service.startPickup(orderId, ownerId);
        service.pickUp(orderId, ownerId);
        rejected(403, Notifications.DELIVERY_NOT_OWNED, () -> service.deliver(orderId, otherId));
        service.deliver(orderId, ownerId);
        assertEquals(DeliveryStatus.DELIVERED, state().delivery());
    }

    @Test
    void statusTransitionsDoNotTouchAnotherPersistenceContextTransaction() {
        User unrelated = em.find(User.class, otherId);
        String originalName = unrelated.getFirstname();
        em.getTransaction().begin();
        try {
            unrelated.setFirstname("Uncommitted change");
            ApiException error = assertThrows(ApiException.class, () -> service.pickUp(orderId, otherId));
            assertEquals(403, error.getStatus());
            assertEquals(Notifications.DELIVERY_NOT_OWNED.getDisplayName(), error.getMessage());
            assertTrue(em.getTransaction().isActive());
            assertTrue(em.contains(unrelated));
            assertEquals(DeliveryStatus.ASSIGNED, state().delivery());

            service.startPickup(orderId, ownerId);

            service.pickUp(orderId, ownerId);
            service.deliver(orderId, ownerId);
            assertTrue(em.getTransaction().isActive());
            assertTrue(em.contains(unrelated));
            assertEquals("Uncommitted change", unrelated.getFirstname());
            assertEquals(DeliveryStatus.DELIVERED, state().delivery());
            try (EntityManager reader = emf.createEntityManager()) {
                assertEquals(originalName, reader.find(User.class, otherId).getFirstname());
            }
        } finally {
            if (em.getTransaction().isActive()) em.getTransaction().rollback();
        }
        try (EntityManager reader = emf.createEntityManager()) {
            assertEquals(originalName, reader.find(User.class, otherId).getFirstname());
        }
        assertEquals(DeliveryStatus.DELIVERED, state().delivery());
    }

    @Test
    void cannotSkipPickupOrRepeatPickup() {
        rejected(409, Notifications.DELIVERY_STATUS_INVALID, () -> service.deliver(orderId, ownerId));
        service.startPickup(orderId, ownerId);
        service.pickUp(orderId, ownerId);
        rejected(409, Notifications.DELIVERY_STATUS_INVALID, () -> service.pickUp(orderId, ownerId));
    }

    private void setOrderStatus(OrderStatus status) {
        em.getTransaction().begin();
        em.find(Order.class, orderId).setStatus(status);
        em.getTransaction().commit();
        em.clear();
    }

    @Test
    void inactiveAgentCannotUpdateDelivery() {
        setAgentActive(false);
        rejected(403, Notifications.DELIVERY_AGENT_NOT_ACTIVE, () -> service.pickUp(orderId, ownerId));
        setAgentActive(true);
        service.startPickup(orderId, ownerId);
        service.pickUp(orderId, ownerId);
        setAgentActive(false);
        rejected(403, Notifications.DELIVERY_AGENT_NOT_ACTIVE, () -> service.deliver(orderId, ownerId));
    }

    private void setAgentActive(boolean active) {
        em.getTransaction().begin();
        em.find(Delivery.class, deliveryId).getAgent().setActive(active);
        em.getTransaction().commit();
        em.clear();
    }

    @Test
    void unknownAndUnassignedOrdersAreRejected() {
        UUID missing = UUID.randomUUID();
        rejected(404, Notifications.ORDER_NOT_FOUND, () -> service.pickUp(missing, ownerId));
        rejected(404, Notifications.ORDER_NOT_FOUND, () -> service.deliver(missing, ownerId));
        em.getTransaction().begin();
        Order original = em.find(Order.class, orderId);
        Order unassigned = Order.builder().customer(original.getCustomer()).restaurant(original.getRestaurant())
                .status(OrderStatus.READY_FOR_PICKUP).build();
        em.persist(unassigned);
        em.getTransaction().commit();
        UUID id = unassigned.getId();
        rejected(409, Notifications.DELIVERY_NOT_ASSIGNED, () -> service.pickUp(id, ownerId));
        rejected(409, Notifications.DELIVERY_NOT_ASSIGNED, () -> service.deliver(id, ownerId));
        try (EntityManager reader = emf.createEntityManager()) {
            assertEquals(OrderStatus.READY_FOR_PICKUP, reader.find(Order.class, id).getStatus());
            assertEquals(0L, reader.createQuery("SELECT COUNT(d) FROM Delivery d WHERE d.order.id = :id", Long.class)
                    .setParameter("id", id).getSingleResult().longValue());
        }
    }

    @ParameterizedTest
    @EnumSource(value = OrderStatus.class, mode = EnumSource.Mode.EXCLUDE, names = "READY_FOR_PICKUP")
    void pickupRejectsEveryOtherOrderStatus(OrderStatus status) {
        setOrderStatus(status);
        rejected(409, Notifications.DELIVERY_STATUS_INVALID, () -> service.pickUp(orderId, ownerId));
    }

    @ParameterizedTest
    @EnumSource(value = OrderStatus.class, mode = EnumSource.Mode.EXCLUDE, names = "OUT_FOR_DELIVERY")
    void completionRejectsEveryOtherOrderStatus(OrderStatus status) {
        service.startPickup(orderId, ownerId);
        service.pickUp(orderId, ownerId);
        setOrderStatus(status);
        rejected(409, Notifications.DELIVERY_STATUS_INVALID, () -> service.deliver(orderId, ownerId));
    }

    @Test
    void completionRollsBackWhenStatusHistoryCannotBePersisted() {
        service.startPickup(orderId, ownerId);
        service.pickUp(orderId, ownerId);
        State before = state();
        executeSchemaChange("ALTER TABLE order_status_history ADD CONSTRAINT test_reject_completion CHECK (status <> 'DELIVERED')");
        try {
            assertThrows(PersistenceException.class, () -> service.deliver(orderId, ownerId));
            assertFalse(em.getTransaction().isActive());
            assertEquals(before, state());
        } finally {
            executeSchemaChange("ALTER TABLE order_status_history DROP CONSTRAINT test_reject_completion");
        }
        service.deliver(orderId, ownerId);
        assertEquals(DeliveryStatus.DELIVERED, state().delivery());
    }

    private void executeSchemaChange(String sql) {
        try (EntityManager schema = emf.createEntityManager()) {
            schema.getTransaction().begin();
            schema.createNativeQuery(sql).executeUpdate();
            schema.getTransaction().commit();
        }
    }

    @Test
    void completionWaitsForOrderLockAndRechecksStatusAfterRelease() throws Exception {
        service.startPickup(orderId, ownerId);
        service.pickUp(orderId, ownerId);
        ExecutorService executor = Executors.newSingleThreadExecutor();
        CyclicBarrier start = new CyclicBarrier(2);
        try (EntityManager holder = emf.createEntityManager()) {
            holder.getTransaction().begin();
            try {
                Order locked = holder.find(Order.class, orderId, jakarta.persistence.LockModeType.PESSIMISTIC_WRITE);
                Future<Integer> pending = executor.submit(() -> complete(start));
                start.await(10, TimeUnit.SECONDS);
                assertThrows(TimeoutException.class, () -> pending.get(250, TimeUnit.MILLISECONDS));
                locked.setStatus(OrderStatus.CANCELLED);
                holder.getTransaction().commit();
                assertEquals(409, pending.get(30, TimeUnit.SECONDS).intValue());
            } finally {
                if (holder.getTransaction().isActive()) holder.getTransaction().rollback();
            }
        } finally {
            executor.shutdownNow();
            assertTrue(executor.awaitTermination(15, TimeUnit.SECONDS));
        }
        State actual = state();
        assertEquals(OrderStatus.CANCELLED, actual.order());
        assertEquals(DeliveryStatus.PICKED_UP, actual.delivery());
        assertNull(actual.deliveredAt());
        assertEquals(List.of(OrderStatus.READY_FOR_PICKUP, OrderStatus.OUT_FOR_DELIVERY), actual.history());
    }

    @RepeatedTest(3)
    void competingCompletionRequestsRecordOnlyOneCompletion() throws Exception {
        service.startPickup(orderId, ownerId);
        service.pickUp(orderId, ownerId);
        CyclicBarrier start = new CyclicBarrier(2);
        ExecutorService executor = Executors.newFixedThreadPool(2);
        try {
            Future<Integer> first = executor.submit(() -> complete(start));
            Future<Integer> second = executor.submit(() -> complete(start));
            assertEquals(List.of(200, 409), java.util.stream.Stream.of(
                    first.get(30, TimeUnit.SECONDS), second.get(30, TimeUnit.SECONDS)).sorted().toList());
        } finally {
            executor.shutdownNow();
            assertTrue(executor.awaitTermination(15, TimeUnit.SECONDS));
        }
        State actual = state();
        assertEquals(OrderStatus.DELIVERED, actual.order());
        assertEquals(DeliveryStatus.DELIVERED, actual.delivery());
        assertNotNull(actual.deliveredAt());
        assertEquals(List.of(OrderStatus.READY_FOR_PICKUP, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED), actual.history());
    }

    @Test
    void startingPickupOnlyChangesTheDeliveryStatus() {
        DeliveryAssignmentDTO result = service.startPickup(orderId, ownerId);
        State actual = state();
        assertEquals(orderId, result.getOrderId());
        assertEquals(DeliveryStatus.EN_ROUTE_TO_PICKUP, result.getDeliveryStatus());
        assertEquals(OrderStatus.READY_FOR_PICKUP, result.getOrderStatus());
        assertEquals(DeliveryStatus.EN_ROUTE_TO_PICKUP, actual.delivery());
        assertEquals(OrderStatus.READY_FOR_PICKUP, actual.order());
        assertNull(actual.pickedUpAt());
        assertNull(actual.deliveredAt());
        assertEquals(List.of(OrderStatus.READY_FOR_PICKUP), actual.history());
        assertEquals(DeliveryStatus.EN_ROUTE_TO_PICKUP, service.mine(ownerId).getFirst().getDeliveryStatus());
    }

    @Test
    void theThreeStepsRunInOrderAndRecordEachStatus() {
        assertEquals(DeliveryStatus.EN_ROUTE_TO_PICKUP, service.startPickup(orderId, ownerId).getDeliveryStatus());
        assertEquals(DeliveryStatus.PICKED_UP, service.pickUp(orderId, ownerId).getDeliveryStatus());
        assertEquals(DeliveryStatus.DELIVERED, service.deliver(orderId, ownerId).getDeliveryStatus());
        State actual = state();
        assertNotNull(actual.pickedUpAt());
        assertNotNull(actual.deliveredAt());
        assertEquals(List.of(OrderStatus.READY_FOR_PICKUP, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED), actual.history());
    }

    @Test
    void pickupCannotBeSkippedPastTheStartStep() {
        rejected(409, Notifications.DELIVERY_STATUS_INVALID, () -> service.pickUp(orderId, ownerId));
        rejected(409, Notifications.DELIVERY_STATUS_INVALID, () -> service.deliver(orderId, ownerId));
        assertEquals(DeliveryStatus.ASSIGNED, state().delivery());
    }

    @Test
    void startingPickupCannotBeRepeatedOrDoneAfterPickup() {
        service.startPickup(orderId, ownerId);
        rejected(409, Notifications.DELIVERY_STATUS_INVALID, () -> service.startPickup(orderId, ownerId));
        service.pickUp(orderId, ownerId);
        rejected(409, Notifications.DELIVERY_STATUS_INVALID, () -> service.startPickup(orderId, ownerId));
        service.deliver(orderId, ownerId);
        rejected(409, Notifications.DELIVERY_STATUS_INVALID, () -> service.startPickup(orderId, ownerId));
    }

    @Test
    void anotherAgentCannotStartPickup() {
        rejected(403, Notifications.DELIVERY_NOT_OWNED, () -> service.startPickup(orderId, otherId));
        assertEquals(DeliveryStatus.ASSIGNED, state().delivery());
    }

    @Test
    void inactiveAgentCannotStartPickup() {
        setAgentActive(false);
        rejected(403, Notifications.DELIVERY_AGENT_NOT_ACTIVE, () -> service.startPickup(orderId, ownerId));
        setAgentActive(true);
        service.startPickup(orderId, ownerId);
        assertEquals(DeliveryStatus.EN_ROUTE_TO_PICKUP, state().delivery());
    }

    @Test
    void startingPickupRejectsUnknownAndUnassignedOrders() {
        rejected(404, Notifications.ORDER_NOT_FOUND, () -> service.startPickup(UUID.randomUUID(), ownerId));
        em.getTransaction().begin();
        Order original = em.find(Order.class, orderId);
        Order unassigned = Order.builder().customer(original.getCustomer()).restaurant(original.getRestaurant())
                .status(OrderStatus.READY_FOR_PICKUP).build();
        em.persist(unassigned);
        em.getTransaction().commit();
        UUID id = unassigned.getId();
        rejected(409, Notifications.DELIVERY_NOT_ASSIGNED, () -> service.startPickup(id, ownerId));
    }

    @ParameterizedTest
    @EnumSource(value = OrderStatus.class, mode = EnumSource.Mode.EXCLUDE, names = "READY_FOR_PICKUP")
    void startingPickupRejectsEveryOtherOrderStatus(OrderStatus status) {
        setOrderStatus(status);
        rejected(409, Notifications.DELIVERY_STATUS_INVALID, () -> service.startPickup(orderId, ownerId));
    }

    @Test
    void pickupRejectsAnOrderThatWasCancelledAfterTheStartStep() {
        service.startPickup(orderId, ownerId);
        setOrderStatus(OrderStatus.CANCELLED);
        rejected(409, Notifications.DELIVERY_STATUS_INVALID, () -> service.pickUp(orderId, ownerId));
    }

    private int complete(CyclicBarrier start) throws Exception {
        try (EntityManager worker = emf.createEntityManager()) {
            start.await(10, TimeUnit.SECONDS);
            try {
                new DeliveryAssignmentService(worker).deliver(orderId, ownerId);
                return 200;
            } catch (ApiException error) {
                assertEquals(Notifications.DELIVERY_STATUS_INVALID.getDisplayName(), error.getMessage());
                assertFalse(worker.getTransaction().isActive());
                return error.getStatus();
            }
        }
    }
}
