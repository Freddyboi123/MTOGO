package app.enums;


import lombok.Getter;

@Getter
public enum Notifications {

    // TEMPLATE
    Notify("This is a message with args: %s!"),
    Notify2("This is a hardcoded message"),


    // GENERICS
    GET_ALL_EMPTY("No data was fetched because %s was empty!"),
    GET_BY_ID("You fetched %s with ID: %s"),
    GET_ALL("You fetched %s %ss"),
    BODY_EMPTY("Body is empty or invalid!"),
    MUST_BE_FLOAT("The entered must be a decimal number!"),

    // FEATURE FLAGS
    FEATURE_FLAGS_FETCHED("You fetched the feature flags"),

    // VALIDATE PASSWORD
    PASSWORD_LENGTH_INVALID("The password must be between 8 and 30 characters"),
    PASSWORD_LOWERCASE_MISSING("The password must contain a lowercase letter"),
    PASSWORD_UPPERCASE_MISSING("The password must contain an uppercase letter"),
    PASSWORD_SPECIAL_CHAR_MISSING("The password must contain a special character"),


    REGISTER_SUCCESS("Welcome %s! Check your email to verify your account"),
    REGISTER_NO_EMAIL("You must enter an email address!"),
    REGISTER_NO_PASSWORD("You must enter a password"),
    REGISTER_NO_PASSWORD_REPEAT("You must verify your password"),
    REGISTER_PASSWORD_MISMATCH("Password confirmation does not match"),
    REGISTER_NO_FIRSTNAME("You must enter your first name"),
    REGISTER_NO_LASTNAME("You must enter your last name"),
    EMAIL_EXISTS("Email already exists!"),

    LOGGED_IN("Welcome back %s!"),
    LOGIN_INVALID("Wrong email or password"),
    LOGIN_NOT_VERIFIED("You must verify your account before you can log in. Check your email"),

    VERIFY_SUCCESS("Your account is now verified. You can log in"),
    VERIFY_INVALID_TOKEN("The verification link is invalid"),
    VERIFY_EXPIRED("The verification link has expired. Request a new one"),
    VERIFY_ALREADY("Your account is already verified"),
    VERIFY_RESENT("If the account exists and is not verified, a new link has been sent to %s"),

    RESET_NO_TOKEN("The reset link is missing a token"),
    RESET_LINK_SENT("If the account exists, a reset link has been sent to %s"),
    RESET_INVALID_TOKEN("The reset link is invalid or has expired"),
    RESET_SUCCESS("Your password has been changed. You can now log in"),

    MAIL_FAILED("Your account was created, but we could not send the email. Try to resend the link"),

    USER_NOT_FOUND("The user was not found"),
    ROLE_REQUIRED("You must enter a role"),
    ROLE_INVALID("The role does not exist"),
    ROLE_ASSIGNED("The role %s was given to %s"),

    // PROFILE
    PROFILE_UPDATED("Your profile was updated"),
    PROFILE_NO_CHANGES("There was nothing to update"),
    PROFILE_EMAIL_VERIFY("Your profile was updated. Check your new email and confirm it to change your email"),
    EMAIL_CHANGED("Your email has been changed. You can now log in with the new email"),
    PROFILE_EMAIL_VERIFY_MAIL_FAILED("We could not send the confirmation email to your new address. Try again"),
    PROFILE_EMAIL_INVALID("The email address is not valid"),
    PROFILE_PHONE_INVALID("The phone number is not valid"),
    PROFILE_ADDRESS_INCOMPLETE("The address must have a street, a postcode and a city"),
    PROFILE_POSTCODE_INVALID("The postcode must be 4 digits"),
    PROFILE_FIRSTNAME_EMPTY("The first name cannot be empty"),
    PROFILE_LASTNAME_EMPTY("The last name cannot be empty"),
    PROFILE_CURRENT_PASSWORD_REQUIRED("You must enter your current password to change it"),
    PROFILE_CURRENT_PASSWORD_WRONG("The current password is wrong"),

    // ORDERS
    ORDER_PLACED("Order %s was placed"),
    ORDER_NOT_FOUND("The order was not found"),
    ORDER_RESTAURANT_REQUIRED("You must choose a restaurant for the order"),
    ORDER_ADDRESS_REQUIRED("You must enter a delivery address with street, postal code and city"),
    ORDER_LINES_REQUIRED("The basket is empty"),
    ORDER_QUANTITY_INVALID("The quantity must be at least 1"),
    ORDER_ONE_RESTAURANT("All items in an order must be from the same restaurant"),
    MENU_ITEM_NOT_FOUND("The menu item was not found"),
    MENU_ITEM_UNAVAILABLE("The menu item is not available"),
    PAYMENT_FAILED("The payment failed. No order was created"),
    ORDERS_FETCHED("You fetched %s orders"),
    ORDERS_NOT_OWNER("Only the owner of the restaurant can see its orders"),
    ORDER_STATUS_UPDATED("Order %s is now %s"),
    ORDER_STATUS_NOT_OWNER("Only the restaurant that received the order can change its status"),
    ORDER_STATUS_INVALID("The order cannot change to that status"),

    // DELIVERIES
    ORDER_ID_INVALID("The order ID is not valid"),
    LOGIN_REQUIRED("You must be logged in"),
    DELIVERY_AGENT_NOT_ACTIVE("You are not an active delivery agent"),
    DELIVERY_ALREADY_TAKEN("This delivery has already been taken or is no longer available"),
    DELIVERY_NOT_ASSIGNED("This order has no assigned delivery"),
    DELIVERY_NOT_OWNED("Only the assigned delivery agent can update this delivery"),
    DELIVERY_STATUS_INVALID("This delivery cannot be updated from its current status"),
    DELIVERY_ESTIMATE_INVALID("The minutes to pick up and to deliver must be whole numbers between 1 and 240"),
    DELIVERY_FEATURE_DISABLED("Not found"),

    // RESTAURANTS AND MENUS
    RESTAURANT_CREATED("Restaurant %s was created"),
    RESTAURANT_NOT_FOUND("The restaurant was not found"),
    RESTAURANT_NAME_REQUIRED("You must enter a name for the restaurant"),
    RESTAURANT_VISIBILITY_INVALID("You must send active as true or false"),
    RESTAURANT_VISIBILITY_CHANGED("Restaurant %s is now %s"),
    OWNER_NOT_FOUND("The owner was not found"),
    NOT_RESTAURANT_OWNER("Only the owner of the restaurant can change its menu"),
    CATEGORY_ADDED("Category %s was added to the menu"),
    CATEGORY_NOT_FOUND("The menu category was not found"),
    CATEGORY_NAME_REQUIRED("You must enter a name for the category"),
    MENU_ITEM_ADDED("Menu item %s was added"),
    MENU_ITEM_UPDATED("Menu item %s was updated"),
    MENU_FETCHED("You fetched the menu"),
    MENU_ITEM_NAME_REQUIRED("You must enter a name for the menu item"),
    MENU_ITEM_PRICE_INVALID("The price must be a number greater than zero"),

    // RESTAURANT APPLICATIONS
    APPLICATION_SUBMITTED("Your application for %s was submitted"),
    APPLICATION_UPDATED("Your application for %s was sent in again"),
    APPLICATION_NOT_FOUND("The application was not found"),
    APPLICATION_NAME_REQUIRED("You must enter a name for the restaurant"),
    APPLICATION_CVR_INVALID("The CVR number must be 8 digits"),
    APPLICATION_ADDRESS_REQUIRED("You must enter the street, postal code and city of the restaurant"),
    APPLICATION_CUISINE_REQUIRED("You must choose a category for the restaurant"),
    APPLICATION_LOCATION_REQUIRED("You must choose the address from the suggestions"),
    RESTAURANT_CUISINE_INVALID("The category does not exist"),
    RESTAURANT_LOCATION_INVALID("The location is not valid"),
    APPLICATION_EMAIL_INVALID("The email address is not valid"),
    APPLICATION_PHONE_INVALID("The phone number is not valid"),
    APPLICATION_NAME_TAKEN("A restaurant with this name already exists in this city. Choose another name"),
    APPLICATION_NOT_EDITABLE("The application can only be changed when more information is requested"),
    NOT_APPLICANT("Only the applicant can change the application"),
    APPLICATION_DECIDED("The application for %s is now %s"),
    APPLICATION_NOT_PENDING("Only a new application can get a decision"),
    APPLICATION_DECISION_INVALID("The decision must be APPROVED, REJECTED or MORE_INFORMATION_NEEDED"),
    APPLICATION_MESSAGE_REQUIRED("You must write what information is missing"),

    // DRIVER APPLICATIONS
    DRIVER_APPLICATION_SUBMITTED("Your application as a delivery agent was submitted"),
    DRIVER_APPLICATION_UPDATED("Your application as a delivery agent was sent in again"),
    DRIVER_APPLICATION_DECIDED("The application of %s as a delivery agent is now %s"),
    DRIVER_APPLICATION_NAME_REQUIRED("You must enter your first and last name"),
    DRIVER_APPLICATION_VEHICLE_REQUIRED("You must choose a vehicle"),
    DRIVER_APPLICATION_REGION_REQUIRED("You must choose a region"),
    DRIVER_APPLICATION_HOURS_INVALID("The expected hours per week must be between 1 and 80"),
    DRIVER_APPLICATION_TIMES_REQUIRED("You must choose at least one time of day"),

    // ADMIN
    ADMIN_LOCK_REASON_REQUIRED("You must write why it is locked and what must be changed"),
    ADMIN_RESTAURANT_LOCKED("The restaurant is locked by an administrator and cannot be changed"),
    ADMIN_RESTAURANT_HAS_ORDERS("The restaurant has orders and cannot be deleted. Lock it instead"),
    ADMIN_COURIER_NOT_FOUND("The courier was not found"),
    ADMIN_COURIER_HAS_DELIVERIES("The courier has deliveries and cannot be deleted. Lock or ban them instead"),
    ADMIN_ORDER_FILTER_INVALID("The order status filter does not exist"),
    ADMIN_NAME_REQUIRED("The name cannot be empty"),
    ADMIN_EMAIL_TAKEN("Another user already uses this email"),

    MAIL_SENDER_BOOLEAN_FAILED("Mail sender failed!")

    ;

    // ________________________________________________________

    private final String displayName;

    // ________________________________________________________

    Notifications(String displayName) {
        this.displayName = displayName;
    }
}
