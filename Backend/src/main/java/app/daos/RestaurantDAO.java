package app.daos;

import app.daos.generic.EntityManagerDAO;
import app.entities.Restaurant;
import jakarta.persistence.EntityManager;

import java.util.List;

public class RestaurantDAO extends EntityManagerDAO<Restaurant> {

    public RestaurantDAO(EntityManager em) {
        super(em, Restaurant.class);
    }

    // ________________________________________________________

    public List<Restaurant> getAllActive() {
        return executeQuery(() -> em.createQuery(
                        "SELECT r FROM Restaurant r WHERE r.active = true ORDER BY r.name", Restaurant.class)
                .getResultList());
    }
}
