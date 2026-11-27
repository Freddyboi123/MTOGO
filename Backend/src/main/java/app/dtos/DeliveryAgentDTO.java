package app.dtos;

import lombok.*;

import java.util.UUID;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class DeliveryAgentDTO {

    private UUID id;
    private UserDTO user;
    private boolean locked;
    private String lockReason;
    private String status;

}
