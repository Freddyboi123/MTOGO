package app.server;

import app.controllers.RestaurantApplicationController;
import app.controllers.FeatureFlagController;
import app.controllers.DeliveryOverviewController;
import app.controllers.DeliveryAssignmentController;
import app.controllers.AdminController;
import app.controllers.OrderController;
import app.controllers.RestaurantController;
import app.controllers.UserController;
import io.javalin.apibuilder.EndpointGroup;

import static io.javalin.apibuilder.ApiBuilder.get;
import static io.javalin.apibuilder.ApiBuilder.path;

public class Routing {

    public static EndpointGroup registerRoutes() {
        return () -> {
            path("/api", () -> {
                UserController.registerRoutes().addEndpoints();
                AdminController.registerRoutes().addEndpoints();
                RestaurantController.registerRoutes().addEndpoints();
                RestaurantApplicationController.registerRoutes().addEndpoints();
                FeatureFlagController.registerRoutes().addEndpoints();
                OrderController.registerRoutes().addEndpoints();
                DeliveryOverviewController.registerRoutes().addEndpoints();
                DeliveryAssignmentController.registerRoutes().addEndpoints();

                get("/health", ctx -> ctx.result("Health OK"));
            });
        };
    }
}
