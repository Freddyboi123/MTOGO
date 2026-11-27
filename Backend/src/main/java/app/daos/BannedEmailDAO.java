package app.daos;

import app.daos.generic.EntityManagerDAO;
import app.entities.BannedEmail;
import jakarta.persistence.EntityManager;

public class BannedEmailDAO extends EntityManagerDAO<BannedEmail> {

    public BannedEmailDAO(EntityManager em) {
        super(em, BannedEmail.class);
    }

    // ________________________________________________________

    public boolean existsByEmail(String email) {

        String jpql = "SELECT COUNT(b) FROM BannedEmail b WHERE b.email = :email";

        Long count = executeQuery(() ->
            em.createQuery(jpql, Long.class)
                .setParameter("email", email)
                .getSingleResult()
        );
        return count != null && count > 0;
    }

}
