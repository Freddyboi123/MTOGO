package app.daos;

import app.daos.generic.EntityManagerDAO;
import app.entities.DeliveryAgent;
import jakarta.persistence.EntityManager;

import java.util.List;

public class DeliveryAgentDAO extends EntityManagerDAO<DeliveryAgent> {

    public DeliveryAgentDAO(EntityManager em) {
        super(em, DeliveryAgent.class);
    }

    // ________________________________________________________

    public List<DeliveryAgent> getAllWithUser() {

        String jpql = "SELECT a FROM DeliveryAgent a JOIN FETCH a.user ORDER BY a.user.firstname";

        return executeQuery(() -> em.createQuery(jpql, DeliveryAgent.class)
            .getResultList());
    }

}
