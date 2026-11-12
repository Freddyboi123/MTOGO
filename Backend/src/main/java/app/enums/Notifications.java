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

    MAIL_FAILED("Your account was created, but we could not send the email. Try to resend the link")

    ;

    // ________________________________________________________

    private final String displayName;

    // ________________________________________________________

    Notifications(String displayName) {
        this.displayName = displayName;
    }
}
