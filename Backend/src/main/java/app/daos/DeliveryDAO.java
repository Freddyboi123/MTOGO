package app.daos;

import app.daos.generic.EntityManagerDAO;
import app.entities.Delivery;
import app.enums.DeliveryStatus;
import jakarta.persistence.EntityManager;

import java.util.UUID;

public class DeliveryDAO extends EntityManagerDAO<Delivery> {

    public DeliveryDAO(EntityManager em) {
        super(em, Delivery.class);
    }

    // ________________________________________________________

    public DeliveryStatus getCurrentStatus(UUID agentId) {

        String jpql = "SELECT d.status FROM Delivery d WHERE d.agent.id = :agentId AND d.status <> :done";

        return executeQuery(() -> em.createQuery(jpql, DeliveryStatus.class)
            .setParameter("agentId", agentId)
            .setParameter("done", DeliveryStatus.DELIVERED)
            .setMaxResults(1)
            .getResultStream().findFirst().orElse(null));
    }

    // ________________________________________________________

    public long countByAgent(UUID agentId) {

        String jpql = "SELECT COUNT(d) FROM Delivery d WHERE d.agent.id = :agentId";

        return executeQuery(() -> em.createQuery(jpql, Long.class)
            .setParameter("agentId", agentId)
            .getSingleResult());
    }

}
