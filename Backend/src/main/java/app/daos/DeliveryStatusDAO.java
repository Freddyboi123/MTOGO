package app.daos;

import app.entities.Delivery;
import app.entities.DeliveryAgent;
import app.entities.Order;
import app.enums.DeliveryStatus;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public class DeliveryStatusDAO {
    private final EntityManager em;

    public DeliveryStatusDAO(EntityManager em) {
        this.em = em;
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
}
