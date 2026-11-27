package app.dtos;

import app.enums.Role;
import lombok.*;

import java.util.Set;
import java.util.UUID;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class UserDTO {

    private UUID id;
    private String name;
    private String email;
    private String pendingEmail;
    private String lastName;
    private String phoneNumber;
    private String street;
    private String postalCode;
    private String city;
    private String floorDoor;
    private Set<Role> roles;

}

