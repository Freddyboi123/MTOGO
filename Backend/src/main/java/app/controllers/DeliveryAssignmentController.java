package app.controllers;

import app.dtos.UserDTO;
import app.enums.Notifications;
import app.enums.Role;
import app.exceptions.ApiException;
import app.server.Setup;
import app.services.DeliveryAssignmentService;
import io.javalin.apibuilder.EndpointGroup;
import io.javalin.http.Context;

import java.util.Map;
import java.util.UUID;

import static io.javalin.apibuilder.ApiBuilder.get;
import static io.javalin.apibuilder.ApiBuilder.post;

public class DeliveryAssignmentController {
    private final DeliveryAssignmentService service = new DeliveryAssignmentService(Setup.em);

    public static EndpointGroup registerRoutes() {
        DeliveryAssignmentController controller = new DeliveryAssignmentController();
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
        };
    }

    private static UUID userId(Context ctx) {
        UserDTO user = ctx.attribute("user");
        if (user == null || user.getId() == null) throw new ApiException(401, Notifications.LOGIN_REQUIRED.getDisplayName());
        return user.getId();
    }
}
