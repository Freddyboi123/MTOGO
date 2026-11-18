package app.daos;

import app.daos.generic.EntityManagerDAO;
import app.entities.Restaurant;
import jakarta.persistence.EntityManager;

import java.util.List;
import java.util.UUID;

public class RestaurantDAO extends EntityManagerDAO<Restaurant> {

    public RestaurantDAO(EntityManager em) {
        super(em, Restaurant.class);
    }

    // ________________________________________________________

    public List<Restaurant> getByOwnerId(UUID ownerId) {
        String jpql = "SELECT r FROM Restaurant r WHERE r.owner.id = :ownerId";

        return executeQuery(() ->
            em.createQuery(jpql, Restaurant.class)
                .setParameter("ownerId", ownerId)
                .getResultList()
        );
    }

}
