package app.enums;

import lombok.Getter;

@Getter
public enum FeatureFlag {

    // US-01: Customer can see a list of restaurants
    RESTAURANT_OVERVIEW("restaurantOverview")

    ;

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
