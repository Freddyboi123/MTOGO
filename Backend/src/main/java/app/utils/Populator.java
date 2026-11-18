package app.utils;

import app.configs.HibernateConfig;
import app.entities.*;
import app.enums.Role;
import app.services.PasswordService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;

import java.math.BigDecimal;
import java.util.Set;

/**
 * Fills the database with template restaurants + menus for manual testing.
 * Run the main method directly (uses the same DB as config.properties).
 * Safe to run multiple times: it does nothing if the template owner already exists.
 */
public class Populator {

    public static final String OWNER_EMAIL = "owner@mtogo.dk";
    public static final String OWNER_PASSWORD = "Password123!";

    // ________________________________________________________

    public static void main(String[] args) {
        EntityManagerFactory emf = HibernateConfig.getEntityManagerFactory();
        populate(emf);
        emf.close();
    }

    // ________________________________________________________

    public static void populate(EntityManagerFactory emf) {
        try (EntityManager em = emf.createEntityManager()) {

            Long existing = em.createQuery("SELECT COUNT(u) FROM User u WHERE u.email = :email", Long.class)
                    .setParameter("email", OWNER_EMAIL)
                    .getSingleResult();

            if (existing > 0) {
                System.out.println("Populator: template data already exists, skipping.");
                return;
            }

            em.getTransaction().begin();

            User owner = User.builder()
                    .firstname("Template")
                    .lastname("Owner")
                    .email(OWNER_EMAIL)
                    .password(PasswordService.hashHelper(OWNER_PASSWORD))
                    .roles(Set.of(Role.RESTAURANT_OWNER))
                    .verified(true)
                    .build();
            em.persist(owner);

            em.persist(pizzaPlace(owner));
            em.persist(sushiBar(owner));
            em.persist(burgerJoint(owner));

            em.getTransaction().commit();
            System.out.println("Populator: created owner + 3 restaurants with menus.");
        }
    }

    // ________________________________________________________

    private static Restaurant pizzaPlace(User owner) {
        Restaurant r = restaurant(owner, "Mamma Mia Pizza", "Classic Italian pizzas", "11111111",
                "Nørrebrogade 10", "2200", "København N");

        MenuCategory pizzas = category("Pizzas", 1);
        pizzas.addItem(item("Margherita", "Tomato, mozzarella, basil", "89.00"));
        pizzas.addItem(item("Pepperoni", "Tomato, mozzarella, pepperoni", "99.00"));
        pizzas.addItem(item("Quattro Formaggi", "Four cheeses", "109.00"));
        r.addCategory(pizzas);

        MenuCategory drinks = category("Drinks", 2);
        drinks.addItem(item("Coca-Cola 0.5L", null, "25.00"));
        drinks.addItem(item("San Pellegrino", null, "30.00"));
        r.addCategory(drinks);

        return r;
    }

    // ________________________________________________________

    private static Restaurant sushiBar(User owner) {
        Restaurant r = restaurant(owner, "Tokyo Sushi", "Fresh sushi and rolls", "22222222",
                "Vesterbrogade 50", "1620", "København V");

        MenuCategory rolls = category("Rolls", 1);
        rolls.addItem(item("California Roll", "Crab, avocado, cucumber (8 pcs)", "85.00"));
        rolls.addItem(item("Spicy Tuna Roll", "Tuna, chili mayo (8 pcs)", "95.00"));
        r.addCategory(rolls);

        MenuCategory nigiri = category("Nigiri", 2);
        nigiri.addItem(item("Salmon Nigiri", "2 pcs", "40.00"));
        nigiri.addItem(item("Tuna Nigiri", "2 pcs", "45.00"));
        r.addCategory(nigiri);

        MenuCategory sides = category("Sides", 3);
        sides.addItem(item("Miso Soup", null, "30.00"));
        sides.addItem(item("Edamame", null, "35.00"));
        r.addCategory(sides);

        return r;
    }

    // ________________________________________________________

    private static Restaurant burgerJoint(User owner) {
        Restaurant r = restaurant(owner, "Burger Barn", "Smash burgers and fries", "33333333",
                "Østerbrogade 100", "2100", "København Ø");

        MenuCategory burgers = category("Burgers", 1);
        burgers.addItem(item("Classic Burger", "Beef, cheddar, pickles", "95.00"));
        burgers.addItem(item("Bacon Burger", "Beef, bacon, BBQ sauce", "109.00"));
        MenuItem veggie = item("Veggie Burger", "Plant-based patty", "99.00");
        veggie.setAvailable(false); // useful for testing unavailable items
        burgers.addItem(veggie);
        r.addCategory(burgers);

        MenuCategory sides = category("Sides", 2);
        sides.addItem(item("Fries", null, "35.00"));
        sides.addItem(item("Onion Rings", null, "40.00"));
        r.addCategory(sides);

        return r;
    }

    // ________________________________________________________

    private static Restaurant restaurant(User owner, String name, String description, String phone,
                                         String street, String postalCode, String city) {
        return Restaurant.builder()
                .name(name)
                .description(description)
                .phoneNumber(phone)
                .address(Address.builder().street(street).postalCode(postalCode).city(city).build())
                .owner(owner)
                .build();
    }

    private static MenuCategory category(String name, int sortOrder) {
        return MenuCategory.builder().name(name).sortOrder(sortOrder).build();
    }

    private static MenuItem item(String name, String description, String price) {
        return MenuItem.builder().name(name).description(description).price(new BigDecimal(price)).build();
    }
}
