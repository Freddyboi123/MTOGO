package app;

import app.configs.TestHibernateConfig;
import app.dtos.UserDTO;
import app.entities.Address;
import app.entities.Delivery;
import app.entities.DeliveryAgent;
import app.entities.MenuItem;
import app.entities.Order;
import app.entities.OrderLine;
import app.entities.OrderStatusHistory;
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

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

public class PlaywrightServer {

    private static final String DEFAULT_PORT = "6970";

    public static void main(String[] args) throws InterruptedException {
        System.setProperty(MailService.MAIL_DISABLED_PROPERTY, "true");
        System.setProperty(FeatureFlag.DELIVERY_OVERVIEW.getPropertyName(), "true");

        int port = Integer.parseInt(System.getenv().getOrDefault("PORT", DEFAULT_PORT));

        EntityManagerFactory emf = TestHibernateConfig.getTestEmf();
        Populator.populate(emf);
        seedDeliveryUsers(emf);

        Setup setup = new Setup(emf.createEntityManager(), port);
        setup.getApp().post("/api/test-fixtures/delivery", ctx -> {
            UserDTO user = ctx.attribute("user");
            ctx.status(201).json(Map.of("orderId", createDeliveryFixture(emf, user.getId())));
        }, Role.DELIVERY_AGENT);
        setup.initialize();

        Thread.currentThread().join();
    }

    private static void seedDeliveryUsers(EntityManagerFactory emf) {
        try (EntityManager em = emf.createEntityManager()) {
            em.getTransaction().begin();
            String password = PasswordService.hashHelper(Populator.OWNER_PASSWORD);
            createUser(em, "delivery-customer@mtogo.dk", Role.CUSTOMER, password);
            createUser(em, "admin@mtogo.dk", Role.ADMIN, password, "Admin", "Test");
            createUser(em, "applicant-approve@mtogo.dk", Role.CUSTOMER, password, "Approve", "Applicant");
            createUser(em, "applicant-reject@mtogo.dk", Role.CUSTOMER, password, "Reject", "Applicant");
            createUser(em, "applicant-info@mtogo.dk", Role.CUSTOMER, password, "Info", "Applicant");
            createUser(em, "applicant-resubmit@mtogo.dk", Role.CUSTOMER, password, "Resubmit", "Applicant");
            createUser(em, "applicant-delivery@mtogo.dk", Role.CUSTOMER, password, "Delivery", "Applicant");
            User courier = createUser(em, "delivery-courier@mtogo.dk", Role.DELIVERY_AGENT, password);
            User otherCourier = createUser(em, "delivery-other@mtogo.dk", Role.DELIVERY_AGENT, password);
            em.persist(DeliveryAgent.builder().user(courier).build());
            em.persist(DeliveryAgent.builder().user(otherCourier).build());
            em.getTransaction().commit();
        }
    }

    private static UUID createDeliveryFixture(EntityManagerFactory emf, UUID courierId) {
        try (EntityManager em = emf.createEntityManager()) {
            em.getTransaction().begin();
            try {
                User customer = em.createQuery("SELECT u FROM User u WHERE u.email = :email", User.class)
                        .setParameter("email", "delivery-customer@mtogo.dk").getSingleResult();
                DeliveryAgent agent = em.createQuery("SELECT a FROM DeliveryAgent a WHERE a.user.id = :id", DeliveryAgent.class)
                        .setParameter("id", courierId).getSingleResult();
                Restaurant restaurant = em.createQuery("SELECT r FROM Restaurant r WHERE r.name = :name", Restaurant.class)
                        .setParameter("name", "Mamma Mia Pizza").getSingleResult();
                MenuItem item = em.createQuery("SELECT i FROM MenuItem i WHERE i.category.restaurant.id = :id AND i.name = :name", MenuItem.class)
                        .setParameter("id", restaurant.getId()).setParameter("name", "Margherita").getSingleResult();
                Order order = Order.builder().customer(customer).restaurant(restaurant)
                        .deliveryAddress(Address.builder().street("Testvej 10").postalCode("2200").city("København N").build())
                        .status(OrderStatus.READY_FOR_PICKUP).expectedPickupAt(LocalDateTime.now().plusMinutes(15))
                        .totalInclVat(item.getPrice()).build();
                order.addLine(OrderLine.builder().menuItem(item).itemName(item.getName())
                        .unitPrice(item.getPrice()).quantity(1).build());
                order.addStatusHistory(OrderStatusHistory.builder().status(OrderStatus.READY_FOR_PICKUP).build());
                em.persist(order);
                em.persist(Delivery.builder().order(order).agent(agent).assignedAt(LocalDateTime.now()).build());
                em.getTransaction().commit();
                return order.getId();
            } catch (RuntimeException exception) {
                if (em.getTransaction().isActive()) em.getTransaction().rollback();
                throw exception;
            }
        }
    }

    private static User createUser(EntityManager em, String email, Role role, String password) {
        return createUser(em, email, role, password, "Delivery", "Test");
    }

    private static User createUser(EntityManager em, String email, Role role, String password, String firstname, String lastname) {
        User user = User.builder().firstname(firstname).lastname(lastname)
                .email(email).password(password).roles(Set.of(role)).verified(true).build();
        em.persist(user);
        return user;
    }
}
