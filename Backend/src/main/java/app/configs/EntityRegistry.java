package app.configs;


import app.entities.*;
import org.hibernate.cfg.Configuration;

final class EntityRegistry {

    private EntityRegistry() {}

    static void registerEntities(Configuration configuration) {
        configuration.addAnnotatedClass(Address.class);
        configuration.addAnnotatedClass(User.class);
        configuration.addAnnotatedClass(Bonus.class);
        configuration.addAnnotatedClass(Delivery.class);
        configuration.addAnnotatedClass(DeliveryAgent.class);
        configuration.addAnnotatedClass(Feedback.class);
        configuration.addAnnotatedClass(MenuCategory.class);
        configuration.addAnnotatedClass(MenuItem.class);
        configuration.addAnnotatedClass(Order.class);
        configuration.addAnnotatedClass(OrderLine.class);
        configuration.addAnnotatedClass(OrderStatusHistory.class);
        configuration.addAnnotatedClass(Payment.class);
        configuration.addAnnotatedClass(Restaurant.class);
    }
}
