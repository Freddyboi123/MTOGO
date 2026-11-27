package app.dtos;

import app.enums.ApplicationStatus;
import lombok.*;

import java.time.LocalDateTime;
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
    private String vehicle;
    private String area;
    private ApplicationStatus status;
    private LocalDateTime createdAt;

}
