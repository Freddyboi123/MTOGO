package app.controllers;

import app.daos.OrderDAO;
import app.enums.FeatureFlag;
import app.enums.Role;
import app.server.Setup;
import app.services.DeliveryOverviewService;
import app.services.FeatureFlagService;
import io.javalin.apibuilder.EndpointGroup;
import io.javalin.http.Context;

import java.util.Map;

import static io.javalin.apibuilder.ApiBuilder.get;

public class DeliveryOverviewController {

    private final FeatureFlagService featureFlags = new FeatureFlagService();
    private final DeliveryOverviewService service = new DeliveryOverviewService(new OrderDAO(Setup.em));

    public static EndpointGroup registerRoutes() {
        DeliveryOverviewController controller = new DeliveryOverviewController();
        return () -> get("/deliveries/available", controller::getAvailable, Role.DELIVERY_AGENT);
    }

    private void getAvailable(Context ctx) {
        if (!featureFlags.isEnabled(FeatureFlag.DELIVERY_OVERVIEW)) {
            ctx.status(404).result("Not found");
            return;
        }
        ctx.status(200).json(Map.of("data", service.getAvailableDeliveries()));
    }
}
