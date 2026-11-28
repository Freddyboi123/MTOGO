package app.dtos;

import app.enums.OrderStatus;
import app.enums.PaymentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class OrderDTO {

    private UUID id;
    private UUID restaurantId;
    private String restaurantName;
    private String street;
    private String postalCode;
    private String city;
    private OrderStatus status;
    private PaymentStatus paymentStatus;
    private BigDecimal total;
    private LocalDateTime createdAt;
    private LocalDateTime expectedDeliveryAt;
    private List<OrderLineDTO> lines;

    // Admin only
    private UserDTO customer;
    private String adminStatus;

}
