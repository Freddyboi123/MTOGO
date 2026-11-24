package app.daos;

import app.daos.generic.EntityManagerDAO;
import app.entities.Order;
import app.enums.OrderStatus;
import jakarta.persistence.EntityManager;

import java.util.List;
import java.util.UUID;

public class OrderDAO extends EntityManagerDAO<Order> {

    public OrderDAO(EntityManager em) {
        super(em, Order.class);
    }

    // ________________________________________________________

    public List<Order> getAvailableForDelivery() {
        return executeQuery(() -> em.createQuery("""
                SELECT o FROM Order o
                JOIN FETCH o.restaurant
                WHERE o.status = :ready
                  AND NOT EXISTS (SELECT d.id FROM Delivery d WHERE d.order = o)
                ORDER BY o.createdAt ASC
                """, Order.class)
                .setParameter("ready", OrderStatus.READY_FOR_PICKUP)
                .getResultList());
    }

    // ________________________________________________________

    public List<Order> getByRestaurant(UUID restaurantId) {
        return executeQuery(() -> em.createQuery("""
                SELECT o FROM Order o
                WHERE o.restaurant.id = :restaurantId
                ORDER BY o.createdAt DESC
                """, Order.class)
                .setParameter("restaurantId", restaurantId)
                .getResultList());
    }
}
