package app.daos;

import app.daos.generic.EntityManagerDAO;
import app.entities.RestaurantApplication;
import app.enums.ApplicationStatus;
import jakarta.persistence.EntityManager;

import java.util.List;
import java.util.UUID;

public class RestaurantApplicationDAO extends EntityManagerDAO<RestaurantApplication> {

    public RestaurantApplicationDAO(EntityManager em) {
        super(em, RestaurantApplication.class);
    }

    // ________________________________________________________

    public List<RestaurantApplication> getByApplicantId(UUID applicantId) {
        String jpql = "SELECT a FROM RestaurantApplication a WHERE a.applicant.id = :applicantId ORDER BY a.createdAt DESC";

        return executeQuery(() ->
            em.createQuery(jpql, RestaurantApplication.class)
                .setParameter("applicantId", applicantId)
                .getResultList()
        );
    }

    // ________________________________________________________

    public long countByStatus(ApplicationStatus status) {

        String jpql = "SELECT COUNT(a) FROM RestaurantApplication a WHERE a.status = :status";

        return executeQuery(() -> em.createQuery(jpql, Long.class)
            .setParameter("status", status)
            .getSingleResult());
    }

}
