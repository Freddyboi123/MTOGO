package app.entities;

import app.enums.Role;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
@Getter
@Setter
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String firstname;

    private String lastname;

    @Column(nullable = false, unique = true)
    private String email;

    private String password;

    @Builder.Default
    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @Column(name = "roles")
    private Set<Role> roles = new HashSet<>();

    @Builder.Default
    private boolean verified = false;
    private String verifyToken;
    private LocalDateTime verifyTokenExpiresAt;

    private String resetToken;
    private LocalDateTime resetTokenExpiresAt;

}


