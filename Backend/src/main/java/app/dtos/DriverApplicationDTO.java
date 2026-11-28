package app.dtos;

import app.enums.ApplicationStatus;
import app.enums.Region;
import app.enums.TimeOfDay;
import app.enums.Vehicle;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class DriverApplicationDTO {

    private UUID id;
    private String firstname;
    private String lastname;
    private String email;
    private String phoneNumber;
    private Vehicle vehicle;
    private Region region;
    private Integer weeklyHours;
    private Set<TimeOfDay> timesOfDay;
    private ApplicationStatus status;
    private String adminMessage;
    private LocalDateTime createdAt;
    private Boolean mailSent;

}
