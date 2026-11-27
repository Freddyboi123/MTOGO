package app.controllers;

import app.dtos.*;
import app.enums.Notifications;
import app.enums.Role;
import app.services.AdminService;
import app.services.MailService;
import app.utils.ErrorHandler;
import io.javalin.apibuilder.EndpointGroup;
import io.javalin.http.Context;

import java.util.Map;
import java.util.UUID;

import static io.javalin.apibuilder.ApiBuilder.delete;
import static io.javalin.apibuilder.ApiBuilder.get;
import static io.javalin.apibuilder.ApiBuilder.post;
import static io.javalin.apibuilder.ApiBuilder.put;

public class AdminController {

    private final AdminService adminService = new AdminService();

    // ________________________________________________________

    public static EndpointGroup registerRoutes() {
        AdminController c = new AdminController();
        return () -> {
            get("/admin/overview", c::overview, Role.ADMIN);

            get("/admin/restaurants", c::getRestaurants, Role.ADMIN);
            put("/admin/restaurants/{id}", c::updateRestaurant, Role.ADMIN);
            put("/admin/restaurants/{id}/visibility", c::setRestaurantVisibility, Role.ADMIN);
            post("/admin/restaurants/{id}/lock", c::lockRestaurant, Role.ADMIN);
            post("/admin/restaurants/{id}/unlock", c::unlockRestaurant, Role.ADMIN);
            delete("/admin/restaurants/{id}", c::deleteRestaurant, Role.ADMIN);

            get("/admin/couriers", c::getCouriers, Role.ADMIN);
            put("/admin/couriers/{id}", c::updateCourier, Role.ADMIN);
            post("/admin/couriers/{id}/lock", c::lockCourier, Role.ADMIN);
            post("/admin/couriers/{id}/unlock", c::unlockCourier, Role.ADMIN);
            post("/admin/couriers/{id}/ban", c::banCourier, Role.ADMIN);
            delete("/admin/couriers/{id}", c::deleteCourier, Role.ADMIN);

            get("/admin/courier-applications", c::getDriverApplications, Role.ADMIN);
            get("/admin/orders", c::getOrders, Role.ADMIN);
        };
    }

    // ________________________________________________________

    private void overview(Context ctx) {
        ctx.status(200).json(Map.of("data", adminService.overview()));
    }

    // ________________________________________________________

    private void getRestaurants(Context ctx) {
        ctx.status(200).json(Map.of("data", adminService.getRestaurants()));
    }

    // ________________________________________________________

    private void updateRestaurant(Context ctx) {
        UUID id = id(ctx, Notifications.RESTAURANT_NOT_FOUND);
        RestaurantDTO body = ErrorHandler.tryBody(ctx, RestaurantDTO.class, Notifications.BODY_EMPTY.getDisplayName());
        ctx.status(200).json(Map.of("data", adminService.updateRestaurant(id, body)));
    }

    // ________________________________________________________

    private void setRestaurantVisibility(Context ctx) {
        UUID id = id(ctx, Notifications.RESTAURANT_NOT_FOUND);
        RestaurantDTO body = ErrorHandler.tryBody(ctx, RestaurantDTO.class, Notifications.BODY_EMPTY.getDisplayName());
        ctx.status(200).json(Map.of("data", adminService.setRestaurantVisibility(id, body.isActive())));
    }

    // ________________________________________________________

    private void lockRestaurant(Context ctx) {
        UUID id = id(ctx, Notifications.RESTAURANT_NOT_FOUND);
        String reason = reason(ctx);
        RestaurantDTO restaurant = adminService.lockRestaurant(id, reason);
        respond(ctx, restaurant, adminService.notifyRestaurantLock(id, reason));
    }

    // ________________________________________________________

    private void unlockRestaurant(Context ctx) {
        UUID id = id(ctx, Notifications.RESTAURANT_NOT_FOUND);
        RestaurantDTO restaurant = adminService.unlockRestaurant(id);
        respond(ctx, restaurant, adminService.notifyRestaurantLock(id, null));
    }

    // ________________________________________________________

    private void deleteRestaurant(Context ctx) {
        adminService.deleteRestaurant(id(ctx, Notifications.RESTAURANT_NOT_FOUND));
        ctx.status(204);
    }

    // ________________________________________________________

    private void getCouriers(Context ctx) {
        ctx.status(200).json(Map.of("data", adminService.getCouriers()));
    }

    // ________________________________________________________

    private void updateCourier(Context ctx) {
        UUID id = id(ctx, Notifications.ADMIN_COURIER_NOT_FOUND);
        UserDTO body = ErrorHandler.tryBody(ctx, UserDTO.class, Notifications.BODY_EMPTY.getDisplayName());
        ctx.status(200).json(Map.of("data", adminService.updateCourier(id, body)));
    }

    // ________________________________________________________

    private void lockCourier(Context ctx) {
        UUID id = id(ctx, Notifications.ADMIN_COURIER_NOT_FOUND);
        String reason = reason(ctx);
        DeliveryAgentDTO courier = adminService.lockCourier(id, reason);
        respond(ctx, courier, adminService.notifyCourierLock(id, reason));
    }

    // ________________________________________________________

    private void unlockCourier(Context ctx) {
        UUID id = id(ctx, Notifications.ADMIN_COURIER_NOT_FOUND);
        DeliveryAgentDTO courier = adminService.unlockCourier(id);
        respond(ctx, courier, adminService.notifyCourierLock(id, null));
    }

    // ________________________________________________________

    private void banCourier(Context ctx) {
        UUID id = id(ctx, Notifications.ADMIN_COURIER_NOT_FOUND);
        adminService.banCourier(id, ctx.body().isBlank() ? null : reason(ctx));
        ctx.status(204);
    }

    // ________________________________________________________

    private void deleteCourier(Context ctx) {
        adminService.deleteCourier(id(ctx, Notifications.ADMIN_COURIER_NOT_FOUND));
        ctx.status(204);
    }

    // ________________________________________________________

    private void getDriverApplications(Context ctx) {
        ctx.status(200).json(Map.of("data", adminService.getDriverApplications()));
    }

    // ________________________________________________________

    private void getOrders(Context ctx) {
        ctx.status(200).json(Map.of("data", adminService.getOrders(ctx.queryParam("status"))));
    }

    // ________________________________________________________

    private static UUID id(Context ctx, Notifications notFound) {
        return ErrorHandler.tryParseUUID(ctx.pathParam("id"), notFound.getDisplayName());
    }

    // ________________________________________________________

    private String reason(Context ctx) {
        Object reason = ErrorHandler.tryBodyMap(ctx, Notifications.BODY_EMPTY.getDisplayName()).get("reason");
        return reason == null ? null : reason.toString();
    }

    // ________________________________________________________

    // The changed item, plus whether the notification mail was sent.
    private void respond(Context ctx, Object item, MailService.MailResult mail) {
        ctx.status(200).json(Map.of("data", Map.of("item", item, "mailSent", mail.sent())));
    }
}
