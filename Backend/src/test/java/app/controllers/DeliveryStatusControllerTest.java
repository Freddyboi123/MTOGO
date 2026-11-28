package app.controllers;

import app.configs.TestHibernateConfig;
import app.dtos.UserDTO;
import app.entities.*;
import app.enums.FeatureFlag;
import app.enums.Notifications;
import app.enums.OrderStatus;
import app.enums.Role;
import app.exceptions.ApiException;
import app.server.Setup;
import app.services.DeliveryAssignmentService;
import app.services.FeatureFlagService;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.javalin.Javalin;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;

import static io.javalin.apibuilder.ApiBuilder.path;
import static org.junit.jupiter.api.Assertions.*;

class DeliveryStatusControllerTest {
    private static final HttpClient CLIENT = HttpClient.newHttpClient();
    private static final ObjectMapper JSON = new ObjectMapper();
    private EntityManagerFactory emf;
    private EntityManager em;
    private Javalin app;
    private final AtomicBoolean enabled = new AtomicBoolean(true);
    private UUID orderId;
    private UUID ownerId;
    private UUID otherId;

    @BeforeEach
    void setUp() {
        emf = TestHibernateConfig.getTestEmf();
        em = emf.createEntityManager();
        DeliveryAssignmentService service = new DeliveryAssignmentService(em);
        em.getTransaction().begin();
        User customer = user();
        User restaurantOwner = user();
        User driver = user();
        User other = user();
        em.persist(DeliveryAgent.builder().user(driver).build());
        em.persist(DeliveryAgent.builder().user(other).build());
        Restaurant restaurant = Restaurant.builder().name("Test Pizza").owner(restaurantOwner).build();
        em.persist(restaurant);
        Order order = Order.builder().customer(customer).restaurant(restaurant)
                .status(OrderStatus.READY_FOR_PICKUP).build();
        em.persist(order);
        em.getTransaction().commit();
        orderId = order.getId();
        ownerId = driver.getId();
        otherId = other.getId();
        service.accept(orderId, ownerId);

        FeatureFlagService flags = new FeatureFlagService(key ->
                FeatureFlag.DELIVERY_OVERVIEW.getPropertyName().equals(key) && enabled.get() ? "true" : "false");
        app = Javalin.create(Setup::configuration).beforeMatched(ctx -> {
            ctx.header("X-Test-Delivery-Role", Boolean.toString(ctx.routeRoles().contains(Role.DELIVERY_AGENT)));
            String identity = ctx.header("X-Test-User");
            if (identity != null) ctx.attribute("user", UserDTO.builder().id(UUID.fromString(identity)).build());
        }).start(0);
        app.exception(ApiException.class, (error, ctx) -> ctx.result(error.getMessage()).status(error.getStatus()));
        app.unsafeConfig().router.apiBuilder(() -> path("/api", () ->
                DeliveryAssignmentController.registerRoutes(service, flags).addEndpoints()));
    }

    private User user() {
        User user = User.builder().email(UUID.randomUUID() + "@test.dk").build();
        em.persist(user);
        return user;
    }

    @AfterEach
    void tearDown() {
        if (app != null) app.stop();
        if (em != null && em.isOpen()) {
            if (em.getTransaction().isActive()) em.getTransaction().rollback();
            em.close();
        }
        if (emf != null && emf.isOpen()) emf.close();
    }

    private HttpResponse<String> post(String id, String action, UUID userId) throws Exception {
        HttpRequest.Builder request = HttpRequest.newBuilder(URI.create("http://localhost:" + app.port()
                + "/api/deliveries/" + id + "/" + action)).POST(HttpRequest.BodyPublishers.noBody());
        if (userId != null) request.header("X-Test-User", userId.toString());
        HttpResponse<String> response = CLIENT.send(request.build(), HttpResponse.BodyHandlers.ofString());
        assertEquals("true", response.headers().firstValue("X-Test-Delivery-Role").orElse("false"));
        return response;
    }

    private void expectError(HttpResponse<String> response, int code, Notifications message) {
        assertEquals(code, response.statusCode());
        assertEquals(message.getDisplayName(), response.body());
    }

    private OrderStatus persistedOrderStatus() {
        try (EntityManager reader = emf.createEntityManager()) {
            return reader.find(Order.class, orderId).getStatus();
        }
    }

    @Test
    void bothRoutesRejectMissingIdentityAndMalformedId() throws Exception {
        for (String action : new String[]{"start", "pickup", "deliver"}) {
            expectError(post(orderId.toString(), action, null), 401, Notifications.LOGIN_REQUIRED);
            expectError(post("not-a-uuid", action, ownerId), 400, Notifications.ORDER_ID_INVALID);
        }
        assertEquals(OrderStatus.READY_FOR_PICKUP, persistedOrderStatus());
    }

    @Test
    void featureFlagBlocksBothRoutesEvenForAssignedAgent() throws Exception {
        enabled.set(false);
        for (String action : new String[]{"start", "pickup", "deliver"}) {
            expectError(post(orderId.toString(), action, ownerId), 404, Notifications.DELIVERY_FEATURE_DISABLED);
        }
        assertEquals(OrderStatus.READY_FOR_PICKUP, persistedOrderStatus());
    }

    @Test
    void routesEnforceOwnershipAndTransitionOrderAndReturnUpdatedStatus() throws Exception {
        String id = orderId.toString();
        expectError(post(id, "pickup", otherId), 403, Notifications.DELIVERY_NOT_OWNED);
        expectError(post(id, "deliver", ownerId), 409, Notifications.DELIVERY_STATUS_INVALID);
        assertEquals(OrderStatus.READY_FOR_PICKUP, persistedOrderStatus());

        expectError(post(id, "pickup", ownerId), 409, Notifications.DELIVERY_STATUS_INVALID);
        expectError(post(id, "start", otherId), 403, Notifications.DELIVERY_NOT_OWNED);
        assertEquals(OrderStatus.READY_FOR_PICKUP, persistedOrderStatus());

        HttpResponse<String> start = post(id, "start", ownerId);
        assertEquals(200, start.statusCode());
        var started = JSON.readTree(start.body()).get("data");
        assertEquals(id, started.get("orderId").asText());
        assertEquals("READY_FOR_PICKUP", started.get("orderStatus").asText());
        assertEquals("EN_ROUTE_TO_PICKUP", started.get("deliveryStatus").asText());
        expectError(post(id, "start", ownerId), 409, Notifications.DELIVERY_STATUS_INVALID);
        expectError(post(id, "deliver", ownerId), 409, Notifications.DELIVERY_STATUS_INVALID);
        assertEquals(OrderStatus.READY_FOR_PICKUP, persistedOrderStatus());

        HttpResponse<String> pickup = post(id, "pickup", ownerId);
        assertEquals(200, pickup.statusCode());
        var pickedUp = JSON.readTree(pickup.body()).get("data");
        assertEquals(id, pickedUp.get("orderId").asText());
        assertEquals("OUT_FOR_DELIVERY", pickedUp.get("orderStatus").asText());
        assertEquals("PICKED_UP", pickedUp.get("deliveryStatus").asText());
        expectError(post(id, "deliver", otherId), 403, Notifications.DELIVERY_NOT_OWNED);
        assertEquals(OrderStatus.OUT_FOR_DELIVERY, persistedOrderStatus());

        HttpResponse<String> completion = post(id, "deliver", ownerId);
        assertEquals(200, completion.statusCode());
        var delivered = JSON.readTree(completion.body()).get("data");
        assertEquals(id, delivered.get("orderId").asText());
        assertEquals("DELIVERED", delivered.get("orderStatus").asText());
        assertEquals("DELIVERED", delivered.get("deliveryStatus").asText());
        expectError(post(id, "deliver", ownerId), 409, Notifications.DELIVERY_STATUS_INVALID);
        assertEquals(OrderStatus.DELIVERED, persistedOrderStatus());
    }
}
