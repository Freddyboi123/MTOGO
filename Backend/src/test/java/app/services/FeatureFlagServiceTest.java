package app.services;

import app.enums.FeatureFlag;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class FeatureFlagServiceTest {

    @Test
    void flagSetToTrueIsEnabled() {
        FeatureFlagService service = new FeatureFlagService(Map.of("FEATURE_RESTAURANT_OVERVIEW", "true")::get);

        assertTrue(service.isEnabled(FeatureFlag.RESTAURANT_OVERVIEW));
    }

    // ________________________________________________________

    @Test
    void flagSetToFalseIsDisabled() {
        FeatureFlagService service = new FeatureFlagService(Map.of("FEATURE_RESTAURANT_OVERVIEW", "false")::get);

        assertFalse(service.isEnabled(FeatureFlag.RESTAURANT_OVERVIEW));
    }

    // ________________________________________________________

    @Test
    void missingFlagIsDisabled() {
        FeatureFlagService service = new FeatureFlagService(name -> null);

        assertFalse(service.isEnabled(FeatureFlag.RESTAURANT_OVERVIEW));
    }

    // ________________________________________________________

    @Test
    void getAllReturnsEveryFlagByClientName() {
        FeatureFlagService service = new FeatureFlagService(Map.of("FEATURE_RESTAURANT_OVERVIEW", "true")::get);

        Map<String, Boolean> flags = service.getAll();

        assertEquals(FeatureFlag.values().length, flags.size());
        assertTrue(flags.get("restaurantOverview"));
    }
}
