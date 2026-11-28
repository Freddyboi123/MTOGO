package app.controllers;

import app.dtos.UserDTO;
import app.enums.Notifications;
import app.enums.FeatureFlag;
import app.enums.Role;
import app.exceptions.ApiException;
import app.server.Setup;
import app.services.DeliveryAssignmentService;
import app.services.FeatureFlagService;
import io.javalin.apibuilder.EndpointGroup;
import io.javalin.http.Context;

import java.util.Map;
import java.util.UUID;

import static io.javalin.apibuilder.ApiBuilder.get;
import static io.javalin.apibuilder.ApiBuilder.post;

public class DeliveryAssignmentController {
    private final DeliveryAssignmentService service;
    private final FeatureFlagService featureFlags;

    // ________________________________________________________

    private DeliveryAssignmentController(DeliveryAssignmentService service, FeatureFlagService featureFlags) {
        this.service = service;
        this.featureFlags = featureFlags;
    }

    // ________________________________________________________

    public static EndpointGroup registerRoutes() {
        return registerRoutes(new DeliveryAssignmentService(Setup.em), new FeatureFlagService());
    }

    // ________________________________________________________

    static EndpointGroup registerRoutes(DeliveryAssignmentService service, FeatureFlagService featureFlags) {
        DeliveryAssignmentController controller = new DeliveryAssignmentController(service, featureFlags);
        return () -> {
            get("/deliveries/mine", ctx -> ctx.json(Map.of("data", controller.service.mine(userId(ctx)))), Role.DELIVERY_AGENT);
            post("/deliveries/{orderId}/accept", ctx -> {
                UUID orderId;
                try {
                    orderId = UUID.fromString(ctx.pathParam("orderId"));
                } catch (IllegalArgumentException e) {
                    throw new ApiException(400, Notifications.ORDER_ID_INVALID.getDisplayName());
                }
                ctx.status(201).json(Map.of("data", controller.service.accept(orderId, userId(ctx))));
            }, Role.DELIVERY_AGENT);
            post("/deliveries/{orderId}/start", controller::startPickup, Role.DELIVERY_AGENT);
            post("/deliveries/{orderId}/pickup", controller::pickUp, Role.DELIVERY_AGENT);
            post("/deliveries/{orderId}/deliver", controller::deliver, Role.DELIVERY_AGENT);
        };
    }

    // ________________________________________________________

    private void startPickup(Context ctx) {
        UUID orderId = statusOrderId(ctx);
        UUID user = userId(ctx);
        ctx.status(200).json(Map.of("data", service.startPickup(orderId, user)));
    }

    // ________________________________________________________

    private void pickUp(Context ctx) {
        UUID orderId = statusOrderId(ctx);
        UUID user = userId(ctx);
        ctx.status(200).json(Map.of("data", service.pickUp(orderId, user)));
    }

    // ________________________________________________________

    private void deliver(Context ctx) {
        UUID orderId = statusOrderId(ctx);
        UUID user = userId(ctx);
        ctx.status(200).json(Map.of("data", service.deliver(orderId, user)));
    }

    // ________________________________________________________

    private UUID statusOrderId(Context ctx) {
        if (!featureFlags.isEnabled(FeatureFlag.DELIVERY_OVERVIEW)) {
            throw new ApiException(404, Notifications.DELIVERY_FEATURE_DISABLED.getDisplayName());
        }
        try {
            return UUID.fromString(ctx.pathParam("orderId"));
        } catch (IllegalArgumentException e) {
            throw new ApiException(400, Notifications.ORDER_ID_INVALID.getDisplayName());
        }
    }

    // ________________________________________________________

    private static UUID userId(Context ctx) {
        UserDTO user = ctx.attribute("user");
        if (user == null || user.getId() == null) throw new ApiException(401, Notifications.LOGIN_REQUIRED.getDisplayName());
        return user.getId();
    }
}
