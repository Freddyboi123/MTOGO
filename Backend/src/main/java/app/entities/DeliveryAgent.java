package app.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "delivery_agents")
@Getter
@Setter
public class DeliveryAgent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private String phoneNumber;

    @Builder.Default
    private boolean active = true;

    @Builder.Default
    @OneToMany(mappedBy = "agent")
    private List<Delivery> deliveries = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "agent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Bonus> bonuses = new ArrayList<>();

    public void addBonus(Bonus bonus) {
        bonuses.add(bonus);
        bonus.setAgent(this);
    }
}
