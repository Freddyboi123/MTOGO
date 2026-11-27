package app;

import app.configs.TestHibernateConfig;
import app.entities.Address;
import app.entities.Delivery;
import app.entities.DeliveryAgent;
import app.entities.Order;
import app.entities.Restaurant;
import app.entities.User;
import app.enums.FeatureFlag;
import app.enums.OrderStatus;
import app.enums.Role;
import app.server.Setup;
import app.services.MailService;
import app.services.PasswordService;
import app.utils.Populator;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

public class PlaywrightServer {

    private static final String DEFAULT_PORT = "6970";

    public static void main(String[] args) throws InterruptedException {
        System.setProperty(MailService.MAIL_DISABLED_PROPERTY, "true");
        System.setProperty(FeatureFlag.DELIVERY_OVERVIEW.getPropertyName(), "true");

        int port = Integer.parseInt(System.getenv().getOrDefault("PORT", DEFAULT_PORT));

        EntityManagerFactory emf = TestHibernateConfig.getTestEmf();
        Populator.populate(emf);
        seedDeliveryStatusFixtures(emf);

        new Setup(emf.createEntityManager(), port).initialize();

        Thread.currentThread().join();
    }
    private static void seedDeliveryStatusFixtures(EntityManagerFactory emf) {
        try (EntityManager em = emf.createEntityManager()) {
            em.getTransaction().begin();
            String password = PasswordService.hashHelper(Populator.OWNER_PASSWORD);
            User customer = createUser(em, "delivery-customer@mtogo.dk", Role.CUSTOMER, password);
            User courier = createUser(em, "delivery-courier@mtogo.dk", Role.DELIVERY_AGENT, password);
            User otherCourier = createUser(em, "delivery-other@mtogo.dk", Role.DELIVERY_AGENT, password);
            DeliveryAgent agent = DeliveryAgent.builder().user(courier).build();
            em.persist(agent);
            em.persist(DeliveryAgent.builder().user(otherCourier).build());
            Restaurant restaurant = em.createQuery("SELECT r FROM Restaurant r WHERE r.name = :name", Restaurant.class)
                    .setParameter("name", "Mamma Mia Pizza").getSingleResult();
            for (int i = 0; i < 3; i++) {
                Order order = Order.builder().customer(customer).restaurant(restaurant)
                        .deliveryAddress(Address.builder().street("Testvej 10").postalCode("2200").city("København N").build())
                        .status(OrderStatus.READY_FOR_PICKUP).expectedPickupAt(LocalDateTime.now().plusMinutes(15))
                        .totalInclVat(new BigDecimal("89.00")).build();
                em.persist(order);
                em.persist(Delivery.builder().order(order).agent(agent).assignedAt(LocalDateTime.now()).build());
            }
            em.getTransaction().commit();
        }
    }

    private static User createUser(EntityManager em, String email, Role role, String password) {
        User user = User.builder().firstname("Delivery").lastname("Test")
                .email(email).password(password).roles(Set.of(role)).verified(true).build();
        em.persist(user);
        return user;
    }
}
