package app.dtos;

import lombok.*;

import java.util.List;
import java.util.UUID;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class RestaurantDTO {

    private UUID id;
    private String name;
    private String description;
    private String phoneNumber;
    private String street;
    private String postalCode;
    private String city;
    private boolean active;
    private List<MenuCategoryDTO> categories;

}
