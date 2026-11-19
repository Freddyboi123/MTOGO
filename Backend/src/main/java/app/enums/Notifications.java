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

    // RESTAURANTS AND MENUS
    RESTAURANT_CREATED("Restaurant %s was created"),
    RESTAURANT_NOT_FOUND("The restaurant was not found"),
    RESTAURANT_NAME_REQUIRED("You must enter a name for the restaurant"),
    OWNER_NOT_FOUND("The owner was not found"),
    NOT_RESTAURANT_OWNER("Only the owner of the restaurant can change its menu"),
    CATEGORY_ADDED("Category %s was added to the menu"),
    CATEGORY_NOT_FOUND("The menu category was not found"),
    CATEGORY_NAME_REQUIRED("You must enter a name for the category"),
    MENU_ITEM_ADDED("Menu item %s was added"),
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
    APPLICATION_EMAIL_INVALID("The email address is not valid"),
    APPLICATION_PHONE_INVALID("The phone number is not valid"),
    APPLICATION_NAME_TAKEN("A restaurant with this name already exists in this city. Choose another name"),
    APPLICATION_NOT_EDITABLE("The application can only be changed when more information is requested"),
    NOT_APPLICANT("Only the applicant can change the application")

    ;

    // ________________________________________________________

    private final String displayName;

    // ________________________________________________________

    Notifications(String displayName) {
        this.displayName = displayName;
    }
}
