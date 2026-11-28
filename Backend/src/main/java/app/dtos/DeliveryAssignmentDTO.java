package app.dtos;

import app.enums.DeliveryStatus;
import app.enums.OrderStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryAssignmentDTO {
    private UUID orderId;
    private UUID deliveryId;
    private String restaurantName;
    private String pickupAddress;
    private String deliveryAddress;
    private LocalDateTime expectedPickupTime;
    private LocalDateTime assignedAt;
    private OrderStatus orderStatus;
    private DeliveryStatus deliveryStatus;
    private Integer minutesToPickup;
    private Integer minutesToDeliver;
}
