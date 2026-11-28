package app.daos;

import app.daos.generic.EntityManagerDAO;
import app.entities.DeliveryAgent;
import jakarta.persistence.EntityManager;

import java.util.List;
import java.util.UUID;

public class DeliveryAgentDAO extends EntityManagerDAO<DeliveryAgent> {

    public DeliveryAgentDAO(EntityManager em) {
        super(em, DeliveryAgent.class);
    }

    // ________________________________________________________

    public boolean existsByUserId(UUID userId) {

        String jpql = "SELECT COUNT(a) FROM DeliveryAgent a WHERE a.user.id = :userId";

        Long count = executeQuery(() -> em.createQuery(jpql, Long.class)
            .setParameter("userId", userId)
            .getSingleResult());

        return count != null && count > 0;
    }

    // ________________________________________________________

    public List<DeliveryAgent> getAllWithUser() {

        String jpql = "SELECT a FROM DeliveryAgent a JOIN FETCH a.user ORDER BY a.user.firstname";

        return executeQuery(() -> em.createQuery(jpql, DeliveryAgent.class)
            .getResultList());
    }

}
