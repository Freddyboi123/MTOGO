package app.daos;

import app.daos.generic.EntityManagerDAO;
import app.entities.Restaurant;
import jakarta.persistence.EntityManager;

public class RestaurantDAO extends EntityManagerDAO<Restaurant> {

    public RestaurantDAO(EntityManager em) {
        super(em, Restaurant.class);
    }
}
