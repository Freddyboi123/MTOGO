package app.dtos;

import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class MenuItemDTO {

    private UUID id;
    private String name;
    private String description;
    private BigDecimal price;
    private Boolean available;

}
