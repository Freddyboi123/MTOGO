package app.dtos;

import app.enums.Cuisine;
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
    private Cuisine cuisine;
    private Double latitude;
    private Double longitude;
    private Double distanceKm;
    private boolean active;
    private List<MenuCategoryDTO> categories;

    // Admin only
    private UserDTO owner;
    private Boolean locked;
    private String lockReason;
    private String status;

}
