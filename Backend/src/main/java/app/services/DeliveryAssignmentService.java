package app.services;

import app.dtos.DeliveryAssignmentDTO;
import app.entities.*;
import app.enums.Notifications;
import app.enums.OrderStatus;
import app.exceptions.ApiException;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/** US-10: assigning orders; pickup/delivery status updates belong to US-11. */
public class DeliveryAssignmentService {
    private final EntityManager em;

    public DeliveryAssignmentService(EntityManager em) {
        this.em = em;
    }

    public List<DeliveryAssignmentDTO> available() {
        synchronized (em) {
            return em.createQuery("""
                    SELECT o FROM Order o
                    JOIN FETCH o.restaurant
                    WHERE o.status = :status AND NOT EXISTS
                        (SELECT d.id FROM Delivery d WHERE d.order = o)
                    ORDER BY o.createdAt ASC
                    """, Order.class)
                    .setParameter("status", OrderStatus.READY_FOR_PICKUP)
                    .getResultList().stream().map(o -> toDTO(o, null)).toList();
        }
    }

    public List<DeliveryAssignmentDTO> mine(UUID userId) {
        synchronized (em) {
            return em.createQuery("""
                    SELECT d FROM Delivery d
                    JOIN FETCH d.order o
                    JOIN FETCH o.restaurant
                    WHERE d.agent.user.id = :userId AND d.status <> :delivered
                    ORDER BY d.assignedAt DESC
                    """, Delivery.class)
                    .setParameter("userId", userId)
                    .setParameter("delivered", app.enums.DeliveryStatus.DELIVERED)
                    .getResultList().stream().map(d -> toDTO(d.getOrder(), d)).toList();
        }
    }

    public DeliveryAssignmentDTO accept(UUID orderId, UUID userId) {
        synchronized (em) {
            try {
                em.getTransaction().begin();
                DeliveryAgent agent = em.createQuery(
                                "SELECT a FROM DeliveryAgent a WHERE a.user.id = :userId AND a.active = true",
                                DeliveryAgent.class)
                        .setParameter("userId", userId)
                        .getResultStream().findFirst()
                        .orElseThrow(() -> new ApiException(403, Notifications.DELIVERY_AGENT_NOT_ACTIVE.getDisplayName()));

                // The database row lock serializes competing claims across server instances.
                Order order = em.find(Order.class, orderId, LockModeType.PESSIMISTIC_WRITE);
                if (order == null) {
                    throw new ApiException(404, Notifications.ORDER_NOT_FOUND.getDisplayName());
                }
                em.refresh(order, LockModeType.PESSIMISTIC_WRITE);
                if (order.getStatus() != OrderStatus.READY_FOR_PICKUP ||
                        !em.createQuery("SELECT d.id FROM Delivery d WHERE d.order.id = :id", UUID.class)
                                .setParameter("id", orderId).setMaxResults(1).getResultList().isEmpty()) {
                    throw new ApiException(409, Notifications.DELIVERY_ALREADY_TAKEN.getDisplayName());
                }

                Delivery delivery = Delivery.builder()
                        .order(order)
                        .agent(agent)
                        .assignedAt(LocalDateTime.now())
                        .build();
                em.persist(delivery);
                em.flush();
                DeliveryAssignmentDTO result = toDTO(order, delivery);
                em.getTransaction().commit();
                return result;
            } catch (RuntimeException exception) {
                if (em.getTransaction().isActive()) em.getTransaction().rollback();
                throw exception;
            }
        }
    }

    private static DeliveryAssignmentDTO toDTO(Order order, Delivery delivery) {
        return DeliveryAssignmentDTO.builder()
                .orderId(order.getId())
                .deliveryId(delivery == null ? null : delivery.getId())
                .restaurantName(order.getRestaurant().getName())
                .pickupAddress(format(order.getRestaurant().getAddress()))
                .deliveryAddress(format(order.getDeliveryAddress()))
                .expectedPickupTime(order.getExpectedPickupAt())
                .assignedAt(delivery == null ? null : delivery.getAssignedAt())
                .orderStatus(order.getStatus())
                .deliveryStatus(delivery == null ? null : delivery.getStatus())
                .build();
    }

    private static String format(Address address) {
        return address == null ? "" : String.join(", ",
                java.util.stream.Stream.of(address.getStreet(), address.getPostalCode(), address.getCity())
                        .filter(s -> s != null && !s.isBlank()).toList());
    }
}
