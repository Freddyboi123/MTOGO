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
@Table(name = "restaurants")
@Getter
@Setter
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String description;

    private String phoneNumber;

    @Embedded
    private Address address;

    @Builder.Default
    private boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Builder.Default
    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<MenuCategory> categories = new ArrayList<>();

    // ________________________________________________________

    public void addCategory(MenuCategory category) {
        categories.add(category);
        category.setRestaurant(this);
    }

    // ________________________________________________________

    public void removeCategory(MenuCategory category) {
        categories.remove(category);
        category.setRestaurant(null);
    }
}
