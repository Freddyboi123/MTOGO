package app.daos;

import app.daos.generic.EntityManagerDAO;
import app.entities.User;
import jakarta.persistence.EntityManager;

import java.util.UUID;

public class UserDAO extends EntityManagerDAO<User> {

    public UserDAO(EntityManager em) {
        super(em, User.class);
    }

    // ________________________________________________________

    public User getByEmail(String email) {
        String jpql = "SELECT u FROM User u WHERE LOWER(u.email) = LOWER(:email)";

        return executeQuery(() ->
            em.createQuery(jpql, User.class)
                .setParameter("email", email)
                .getSingleResult()
        );
    }

    // ________________________________________________________

    public boolean existsByEmail(String email) {
        String jpql = "SELECT COUNT(u) FROM User u WHERE LOWER(u.email) = LOWER(:email)";

        Long count = executeQuery(() ->
            em.createQuery(jpql, Long.class)
                .setParameter("email", email)
                .getSingleResult()
        );
        return count != null && count > 0;
    }

    // ________________________________________________________

    public boolean existsByEmailExcludingId(String email, UUID id) {
        String jpql = "SELECT COUNT(u) FROM User u WHERE LOWER(u.email) = LOWER(:email) AND u.id <> :id";

        Long count = executeQuery(() ->
            em.createQuery(jpql, Long.class)
                .setParameter("email", email)
                .setParameter("id", id)
                .getSingleResult()
        );
        return count != null && count > 0;
    }

    // ________________________________________________________

    public User getByToken(String token, String column) {
        String jpql = "SELECT u FROM User u WHERE u." + column + " = :token";

        return executeQuery(() ->
            em.createQuery(jpql, User.class)
                .setParameter("token", token)
                .getSingleResult()
        );
    }

}
