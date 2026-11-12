package app.entities;

import app.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "orders")
@Getter
@Setter
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Embedded
    private Address deliveryAddress;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(precision = 10, scale = 2)
    private BigDecimal totalInclVat;

    @Column(precision = 10, scale = 2)
    private BigDecimal totalExclVat;

    @Column(precision = 10, scale = 2)
    private BigDecimal commissionAmount;

    @Builder.Default
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderLine> lines = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("changedAt ASC")
    private List<OrderStatusHistory> statusHistory = new ArrayList<>();

    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private Payment payment;

    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private Delivery delivery;

    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private Feedback feedback;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }

    // ________________________________________________________

    public void addLine(OrderLine line) {
        lines.add(line);
        line.setOrder(this);
    }

    // ________________________________________________________

    public void removeLine(OrderLine line) {
        lines.remove(line);
        line.setOrder(null);
    }

    // ________________________________________________________

    public void addStatusHistory(OrderStatusHistory entry) {
        statusHistory.add(entry);
        entry.setOrder(this);
    }

    // ________________________________________________________

    public void setPayment(Payment payment) {
        this.payment = payment;
        if (payment != null) payment.setOrder(this);
    }

    // ________________________________________________________

    public void setDelivery(Delivery delivery) {
        this.delivery = delivery;
        if (delivery != null) delivery.setOrder(this);
    }

    // ________________________________________________________

    public void setFeedback(Feedback feedback) {
        this.feedback = feedback;
        if (feedback != null) feedback.setOrder(this);
    }
}
