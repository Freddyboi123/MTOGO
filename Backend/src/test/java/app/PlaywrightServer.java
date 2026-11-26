package app;

import app.configs.TestHibernateConfig;
import app.server.Setup;
import app.services.MailService;
import app.utils.Populator;
import jakarta.persistence.EntityManagerFactory;

public class PlaywrightServer {

    private static final String DEFAULT_PORT = "6970";

    public static void main(String[] args) throws InterruptedException {
        System.setProperty(MailService.MAIL_DISABLED_PROPERTY, "true");

        int port = Integer.parseInt(System.getenv().getOrDefault("PORT", DEFAULT_PORT));

        EntityManagerFactory emf = TestHibernateConfig.getTestEmf();
        Populator.populate(emf);

        new Setup(emf.createEntityManager(), port).initialize();

        Thread.currentThread().join();
    }
}
