package app.dtos;

import java.util.UUID;

public record AvailableDeliveryDTO(
        UUID orderId,
        String restaurantName,
        String pickupStreet,
        String pickupPostalCode,
        String pickupCity,
        String deliveryStreet,
        String deliveryPostalCode,
        String deliveryCity,
        String expectedPickupAt
) {}
