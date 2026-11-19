package app.controllers;

import app.enums.Notifications;
import app.enums.Role;
import app.services.FeatureFlagService;
import app.services.MessageService;
import io.javalin.apibuilder.EndpointGroup;
import io.javalin.http.Context;

import java.util.Map;

import static io.javalin.apibuilder.ApiBuilder.get;

public class FeatureFlagController {

    private final FeatureFlagService featureFlagService = new FeatureFlagService();
    private final MessageService messageService = new MessageService();

    // ________________________________________________________

    public static EndpointGroup registerRoutes() {
        FeatureFlagController controller = new FeatureFlagController();
        return () -> get("/features", controller::getAll, Role.ANYONE);
    }

    // ________________________________________________________

    private void getAll(Context ctx) {
        String message = messageService.buildMessage(Notifications.FEATURE_FLAGS_FETCHED);
        ctx.status(200).json(Map.of(
                "message", message,
                "data", featureFlagService.getAll()
        ));
    }
}
