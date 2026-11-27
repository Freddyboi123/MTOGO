package app.dtos;

import app.enums.ApplicationStatus;
import app.enums.Cuisine;
import lombok.*;

import java.util.UUID;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class RestaurantApplicationDTO {

    private UUID id;
    private String restaurantName;
    private String cvr;
    private String street;
    private String postalCode;
    private String city;
    private String email;
    private String phoneNumber;
    private String description;
    private Cuisine cuisine;
    private Double latitude;
    private Double longitude;
    private ApplicationStatus status;
    private String adminMessage;
    private String createdAt;
    private String applicantName;
    private boolean addressInUse;
    private Boolean mailSent;

}
