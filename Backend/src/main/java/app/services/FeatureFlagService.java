package app.services;

import app.enums.FeatureFlag;
import app.exceptions.ApiException;
import app.utils.Utils;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.function.Function;

public class FeatureFlagService {

    private static final String CONFIG = "config.properties";

    private final Function<String, String> propertyLookup;

    // ________________________________________________________

    public FeatureFlagService() {
        this(FeatureFlagService::readProperty);
    }

    // ________________________________________________________

    public FeatureFlagService(Function<String, String> propertyLookup) {
        this.propertyLookup = propertyLookup;
    }

    // ________________________________________________________

    public boolean isEnabled(FeatureFlag flag) {
        return Boolean.parseBoolean(propertyLookup.apply(flag.getPropertyName()));
    }

    // ________________________________________________________

    public Map<String, Boolean> getAll() {
        Map<String, Boolean> flags = new LinkedHashMap<>();
        for (FeatureFlag flag : FeatureFlag.values()) {
            flags.put(flag.getClientName(), isEnabled(flag));
        }
        return flags;
    }

    // ________________________________________________________

    // A flag that is not configured anywhere counts as turned off
    private static String readProperty(String propertyName) {
        try {
            return Utils.getPropertyValue(propertyName, CONFIG);
        } catch (ApiException e) {
            return null;
        }
    }
}
