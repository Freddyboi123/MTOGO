package app.enums;

import io.javalin.security.RouteRole;

public enum Role implements RouteRole {
    ANYONE,
    CUSTOMER,
    RESTAURANT_OWNER,
    DELIVERY_AGENT,
    ADMIN,
    OWNER
}
