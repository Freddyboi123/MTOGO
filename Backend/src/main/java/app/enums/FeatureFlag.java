package app.enums;

import lombok.Getter;

@Getter
public enum FeatureFlag {

    RESTAURANT_OVERVIEW("restaurantOverview"),
    DELIVERY_OVERVIEW("deliveryOverview"),
    ORDERING("ordering"),
    DELIVERY_BONUS("deliveryBonus"),
    ORDER_STATUS("orderStatus"),
    RATINGS("ratings"),
    MANAGEMENT_DASHBOARD("managementDashboard"),
    LANGUAGE_CHOICE("languageChoice");

    // ________________________________________________________

    private final String clientName;

    // ________________________________________________________

    FeatureFlag(String clientName) {
        this.clientName = clientName;
    }

    // ________________________________________________________

    public String getPropertyName() {
        return "FEATURE_" + name();
    }
}
