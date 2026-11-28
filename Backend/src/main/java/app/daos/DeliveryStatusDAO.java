package app.daos;

import app.daos.generic.EntityManagerDAO;
import app.entities.Delivery;
import app.entities.DeliveryAgent;
import app.entities.Order;
import app.enums.DeliveryStatus;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public class DeliveryStatusDAO extends EntityManagerDAO<Delivery> {

    public DeliveryStatusDAO(EntityManager em) {
        super(em, Delivery.class);
    }

    public List<Delivery> findActiveByUser(UUID userId) {
        return em.createQuery("""
                SELECT d FROM Delivery d
                JOIN FETCH d.order o
                JOIN FETCH o.restaurant
                WHERE d.agent.user.id = :userId AND d.status <> :delivered
                ORDER BY d.assignedAt DESC
                """, Delivery.class)
                .setParameter("userId", userId)
                .setParameter("delivered", DeliveryStatus.DELIVERED)
                .getResultList();
    }

    public Order findLockedOrder(UUID orderId) {
        Order order = em.find(Order.class, orderId, LockModeType.PESSIMISTIC_WRITE);
        if (order != null) {
            em.refresh(order, LockModeType.PESSIMISTIC_WRITE);
        }
        return order;
    }

    public Optional<Delivery> findLockedDelivery(UUID orderId) {
        Optional<Delivery> delivery = em.createQuery(
                        "SELECT d FROM Delivery d WHERE d.order.id = :id", Delivery.class)
                .setParameter("id", orderId)
                .setMaxResults(1)
                .getResultList().stream().findFirst();
        delivery.ifPresent(value -> em.refresh(value, LockModeType.PESSIMISTIC_WRITE));
        return delivery;
    }

    public void refreshAgent(DeliveryAgent agent) {
        em.refresh(agent);
    }

    // ________________________________________________________

    public Order findOrderById(UUID orderId) {
        return executeQuery(() -> em.find(Order.class, orderId));
    }

    // ________________________________________________________

    public Delivery findByOrderId(UUID orderId) {

        String jpql = "SELECT d FROM Delivery d WHERE d.order.id = :orderId";

        return executeQuery(() -> em.createQuery(jpql, Delivery.class)
                .setParameter("orderId", orderId)
                .setMaxResults(1)
                .getResultStream().findFirst().orElse(null));
    }

    // ________________________________________________________

    public Delivery saveEstimate(Delivery delivery, Integer minutesToPickup, Integer minutesToDeliver) {

        String jpql = """
                UPDATE Delivery d
                SET d.minutesToPickup = :minutesToPickup,
                    d.minutesToDeliver = :minutesToDeliver,
                    d.estimatedAt = :estimatedAt
                WHERE d.id = :id AND d.status <> :delivered
                """;

        return executeQuery(() -> {
            int updated = em.createQuery(jpql)
                    .setParameter("minutesToPickup", minutesToPickup)
                    .setParameter("minutesToDeliver", minutesToDeliver)
                    .setParameter("estimatedAt", LocalDateTime.now())
                    .setParameter("id", delivery.getId())
                    .setParameter("delivered", DeliveryStatus.DELIVERED)
                    .executeUpdate();
            if (updated == 0) {
                return null;
            }
            em.refresh(delivery);
            return delivery;
        });
    }
}
