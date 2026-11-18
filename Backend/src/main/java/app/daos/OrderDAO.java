package app.daos;

import app.daos.generic.EntityManagerDAO;
import app.entities.Order;
import jakarta.persistence.EntityManager;

public class OrderDAO extends EntityManagerDAO<Order> {

    public OrderDAO(EntityManager em) {
        super(em, Order.class);
    }
}
