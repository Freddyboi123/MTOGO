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

    // ________________________________________________________

    public boolean existsByNameAndCity(String name, String city) {
        String jpql = "SELECT COUNT(r) FROM Restaurant r WHERE LOWER(r.name) = LOWER(:name) AND LOWER(r.address.city) = LOWER(:city)";

        Long count = executeQuery(() ->
            em.createQuery(jpql, Long.class)
                .setParameter("name", name)
                .setParameter("city", city)
                .getSingleResult()
        );
        return count != null && count > 0;
    }

    // ________________________________________________________

    public boolean existsByAddress(String street, String postalCode, String city) {
        String jpql = "SELECT COUNT(r) FROM Restaurant r WHERE " +
            normalized("r.address.street") + " = :street AND " +
            normalized("r.address.postalCode") + " = :postalCode AND " +
            normalized("r.address.city") + " = :city";

        Long count = executeQuery(() ->
            em.createQuery(jpql, Long.class)
                .setParameter("street", normalize(street))
                .setParameter("postalCode", normalize(postalCode))
                .setParameter("city", normalize(city))
                .getSingleResult()
        );
        return count != null && count > 0;
    }

    // ________________________________________________________

    //Had to get help from AI to normalize DB.. Had a hard time figuring it out...
    private String normalized(String column) {
        return "LOWER(REPLACE(REPLACE(REPLACE(REPLACE(" + column + ", ' ', ''), ',', ''), '.', ''), '-', ''))";
    }

    // ________________________________________________________

    private String normalize(String value) {
        return value.toLowerCase().replaceAll("[\\s,.\\-]", "");
    }

    public List<Restaurant> getAllActive() {
        return executeQuery(() -> em.createQuery(
                        "SELECT r FROM Restaurant r WHERE r.active = true ORDER BY r.name", Restaurant.class)
                .getResultList());
    }
}
