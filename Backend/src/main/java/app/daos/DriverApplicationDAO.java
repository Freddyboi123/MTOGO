package app.daos;

import app.daos.generic.EntityManagerDAO;
import app.entities.DriverApplication;
import app.enums.ApplicationStatus;
import jakarta.persistence.EntityManager;

import java.util.List;
import java.util.UUID;

public class DriverApplicationDAO extends EntityManagerDAO<DriverApplication> {

    public DriverApplicationDAO(EntityManager em) {
        super(em, DriverApplication.class);
    }

    // ________________________________________________________

    public List<DriverApplication> getAllNewestFirst() {

        String jpql = "SELECT a FROM DriverApplication a ORDER BY a.createdAt DESC";

        return executeQuery(() -> em.createQuery(jpql, DriverApplication.class)
                .getResultList());
    }

    // ________________________________________________________

    public List<DriverApplication> getByApplicantId(UUID applicantId) {

        String jpql = "SELECT a FROM DriverApplication a WHERE a.applicant.id = :applicantId ORDER BY a.createdAt DESC";

        return executeQuery(() -> em.createQuery(jpql, DriverApplication.class)
            .setParameter("applicantId", applicantId)
            .getResultList());
    }

    // ________________________________________________________

    public long countByStatus(ApplicationStatus status) {

        String jpql = "SELECT COUNT(a) FROM DriverApplication a WHERE a.status = :status";

        return executeQuery(() -> em.createQuery(jpql, Long.class)
            .setParameter("status", status)
            .getSingleResult());
    }

}
