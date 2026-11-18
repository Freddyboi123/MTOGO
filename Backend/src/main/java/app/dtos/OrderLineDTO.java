package app.dtos;

import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class OrderLineDTO {

    private UUID menuItemId;
    private String itemName;
    private BigDecimal unitPrice;
    private Integer quantity;

}
