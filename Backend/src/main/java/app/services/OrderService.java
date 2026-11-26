package app.services;

import app.daos.MenuItemDAO;
import app.daos.OrderDAO;
import app.daos.RestaurantDAO;
import app.daos.UserDAO;
import app.dtos.OrderDTO;
import app.dtos.OrderLineDTO;
import app.entities.MenuItem;
import app.entities.Order;
import app.entities.OrderLine;
import app.entities.OrderStatusHistory;
import app.entities.Payment;
import app.entities.Restaurant;
import app.entities.User;
import app.enums.Notifications;
import app.enums.OrderStatus;
import app.enums.PaymentStatus;
import app.exceptions.ApiException;
import app.mappers.OrderMapper;
import app.server.Setup;
import app.utils.ErrorHandler;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

public class OrderService {

    private static final BigDecimal VAT_FACTOR = new BigDecimal("1.25");
    private static final Map<OrderStatus, Set<OrderStatus>> RESTAURANT_STEPS = Map.of(
            OrderStatus.PREPARING, Set.of(OrderStatus.RECEIVED, OrderStatus.ACCEPTED),
            OrderStatus.READY_FOR_PICKUP, Set.of(OrderStatus.PREPARING)
    );

    private final OrderDAO orderDAO;
    private final RestaurantDAO restaurantDAO;
    private final MenuItemDAO itemDAO;
    private final UserDAO userDAO;
    private final IPaymentService paymentService;
    private final OrderMapper orderMapper = new OrderMapper();
    private final CommissionCalculator commissionCalculator = new CommissionCalculator();

    // ________________________________________________________

    public OrderService() {
        this(new OrderDAO(Setup.em), new RestaurantDAO(Setup.em), new MenuItemDAO(Setup.em), new UserDAO(Setup.em), new MockPaymentService());
    }

    // ________________________________________________________

    public OrderService(OrderDAO orderDAO, RestaurantDAO restaurantDAO, MenuItemDAO itemDAO, UserDAO userDAO, IPaymentService paymentService) {
        this.orderDAO = orderDAO;
        this.restaurantDAO = restaurantDAO;
        this.itemDAO = itemDAO;
        this.userDAO = userDAO;
        this.paymentService = paymentService;
    }

    // ________________________________________________________

    public Order placeOrder(UUID customerId, OrderDTO dto) {
        User customer = ErrorHandler.tryEntity(
                userDAO.getById(customerId),
                Notifications.USER_NOT_FOUND.getDisplayName()
        );

        if (dto.getRestaurantId() == null) {
            throw new ApiException(400, Notifications.ORDER_RESTAURANT_REQUIRED.getDisplayName());
        }

        Restaurant restaurant = ErrorHandler.tryEntity(
                restaurantDAO.getById(dto.getRestaurantId()),
                Notifications.RESTAURANT_NOT_FOUND.getDisplayName()
        );

        ErrorHandler.tryString(dto.getStreet(), Notifications.ORDER_ADDRESS_REQUIRED.getDisplayName());
        ErrorHandler.tryString(dto.getPostalCode(), Notifications.ORDER_ADDRESS_REQUIRED.getDisplayName());
        ErrorHandler.tryString(dto.getCity(), Notifications.ORDER_ADDRESS_REQUIRED.getDisplayName());
        ErrorHandler.tryList(dto.getLines(), Notifications.ORDER_LINES_REQUIRED.getDisplayName());

        List<OrderLine> lines = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (OrderLineDTO lineDTO : dto.getLines()) {
            OrderLine line = createLine(restaurant, lineDTO);
            lines.add(line);
            total = total.add(line.getUnitPrice().multiply(BigDecimal.valueOf(line.getQuantity())));
        }

        if (!paymentService.charge(customer.getId(), total)) {
            throw new ApiException(402, Notifications.PAYMENT_FAILED.getDisplayName());
        }

        Order order = orderMapper.toEntity(dto);
        order.setCustomer(customer);
        order.setRestaurant(restaurant);
        order.setStatus(OrderStatus.RECEIVED);
        order.setTotalInclVat(total);
        order.setTotalExclVat(total.divide(VAT_FACTOR, 2, RoundingMode.HALF_UP));
        order.setCommissionAmount(commissionCalculator.calculate(order.getTotalExclVat()));
        lines.forEach(order::addLine);
        order.addStatusHistory(OrderStatusHistory.builder().status(OrderStatus.RECEIVED).build());
        order.setPayment(Payment.builder()
                .amount(total)
                .status(PaymentStatus.COMPLETED)
                .paidAt(LocalDateTime.now())
                .build());

        return orderDAO.create(order);
    }

    // ________________________________________________________

    public List<Order> getRestaurantOrders(UUID ownerId, UUID restaurantId) {
        Restaurant restaurant = ErrorHandler.tryEntity(
                restaurantDAO.getById(restaurantId),
                Notifications.RESTAURANT_NOT_FOUND.getDisplayName()
        );

        if (!restaurant.getOwner().getId().equals(ownerId)) {
            throw new ApiException(403, Notifications.ORDERS_NOT_OWNER.getDisplayName());
        }

        return orderDAO.getByRestaurant(restaurantId);
    }

    // ________________________________________________________

    public List<Order> getMyOrders(UUID customerId) {
        return orderDAO.getByCustomer(customerId);
    }

    // ________________________________________________________

    public Order updateStatus(UUID ownerId, UUID orderId, OrderStatus status) {
        Order order = ErrorHandler.tryEntity(
                orderDAO.getById(orderId),
                Notifications.ORDER_NOT_FOUND.getDisplayName()
        );

        if (!order.getRestaurant().getOwner().getId().equals(ownerId)) {
            throw new ApiException(403, Notifications.ORDER_STATUS_NOT_OWNER.getDisplayName());
        }

        if (status == null || !RESTAURANT_STEPS.getOrDefault(status, Set.of()).contains(order.getStatus())) {
            throw new ApiException(400, Notifications.ORDER_STATUS_INVALID.getDisplayName());
        }

        order.setStatus(status);
        order.addStatusHistory(OrderStatusHistory.builder().status(status).build());
        return orderDAO.update(order);
    }

    // ________________________________________________________

    private OrderLine createLine(Restaurant restaurant, OrderLineDTO dto) {
        if (dto.getMenuItemId() == null) {
            throw new ApiException(400, Notifications.MENU_ITEM_NOT_FOUND.getDisplayName());
        }

        if (dto.getQuantity() == null || dto.getQuantity() < 1) {
            throw new ApiException(400, Notifications.ORDER_QUANTITY_INVALID.getDisplayName());
        }

        MenuItem item = ErrorHandler.tryEntity(
                itemDAO.getById(dto.getMenuItemId()),
                Notifications.MENU_ITEM_NOT_FOUND.getDisplayName()
        );

        if (!item.getCategory().getRestaurant().getId().equals(restaurant.getId())) {
            throw new ApiException(400, Notifications.ORDER_ONE_RESTAURANT.getDisplayName());
        }

        if (!item.isAvailable()) {
            throw new ApiException(400, Notifications.MENU_ITEM_UNAVAILABLE.getDisplayName());
        }

        return OrderLine.builder()
                .menuItem(item)
                .itemName(item.getName())
                .unitPrice(item.getPrice())
                .quantity(dto.getQuantity())
                .build();
    }
}
