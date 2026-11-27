package app.daos;

import app.daos.generic.EntityManagerDAO;
import app.entities.Order;
import app.enums.OrderStatus;
import jakarta.persistence.EntityManager;

import java.util.EnumSet;
import java.util.List;
import java.util.UUID;

public class OrderDAO extends EntityManagerDAO<Order> {

    public OrderDAO(EntityManager em) {
        super(em, Order.class);
    }

    // ________________________________________________________

    public List<Order> getAvailableForDelivery() {

        String jpql = "SELECT o FROM Order o JOIN FETCH o.restaurant WHERE o.status = :ready AND NOT EXISTS (SELECT d.id FROM Delivery d WHERE d.order = o) ORDER BY o.createdAt ASC";

        return executeQuery(() -> em.createQuery(jpql, Order.class)
            .setParameter("ready", OrderStatus.READY_FOR_PICKUP)
            .getResultList());
    }

    // ________________________________________________________

    public List<Order> getByRestaurant(UUID restaurantId) {

        String jpql = "SELECT o FROM Order o WHERE o.restaurant.id = :restaurantId ORDER BY o.createdAt DESC";

        return executeQuery(() -> em.createQuery(jpql, Order.class)
            .setParameter("restaurantId", restaurantId)
            .getResultList());
    }

    // ________________________________________________________

    public List<Order> getByCustomer(UUID customerId) {

        String jpql = "SELECT o FROM Order o JOIN FETCH o.restaurant WHERE o.customer.id = :customerId ORDER BY o.createdAt DESC";

        return executeQuery(() -> em.createQuery(jpql, Order.class)
            .setParameter("customerId", customerId)
            .getResultList());
    }

    // ________________________________________________________

    public long countUnfinished() {

        String jpql = "SELECT COUNT(o) FROM Order o WHERE o.status NOT IN :finished";

        return executeQuery(() -> em.createQuery(jpql, Long.class)
            .setParameter("finished", EnumSet.of(OrderStatus.DELIVERED, OrderStatus.CANCELLED))
            .getSingleResult());
    }

    // ________________________________________________________

    public long countByRestaurant(UUID restaurantId) {

        String jpql = "SELECT COUNT(o) FROM Order o WHERE o.restaurant.id = :restaurantId";

        return executeQuery(() -> em.createQuery(jpql, Long.class)
            .setParameter("restaurantId", restaurantId)
            .getSingleResult());
    }

    // ________________________________________________________

    public List<Order> getAllWithRestaurantAndCustomer() {

        String jpql = "SELECT o FROM Order o JOIN FETCH o.restaurant JOIN FETCH o.customer ORDER BY o.createdAt DESC";

        return executeQuery(() -> em.createQuery(jpql, Order.class)
            .getResultList());
    }
}
