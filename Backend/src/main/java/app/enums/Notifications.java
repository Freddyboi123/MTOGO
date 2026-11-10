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

    ;

    // ________________________________________________________

    private final String displayName;

    // ________________________________________________________

    Notifications(String displayName) {
        this.displayName = displayName;
    }
}
