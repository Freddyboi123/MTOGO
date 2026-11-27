package app.services;

import app.daos.BannedEmailDAO;
import app.daos.DeliveryAgentDAO;
import app.daos.DeliveryDAO;
import app.daos.DriverApplicationDAO;
import app.daos.OrderDAO;
import app.daos.RestaurantApplicationDAO;
import app.daos.RestaurantDAO;
import app.daos.UserDAO;
import app.dtos.DeliveryAgentDTO;
import app.dtos.DriverApplicationDTO;
import app.dtos.OrderDTO;
import app.dtos.RestaurantDTO;
import app.dtos.UserDTO;
import app.entities.Address;
import app.entities.BannedEmail;
import app.entities.DeliveryAgent;
import app.entities.Order;
import app.entities.Restaurant;
import app.entities.User;
import app.enums.ApplicationStatus;
import app.enums.DeliveryStatus;
import app.enums.Notifications;
import app.enums.PaymentStatus;
import app.enums.Role;
import app.exceptions.ApiException;
import app.mappers.DeliveryAgentMapper;
import app.mappers.DriverApplicationMapper;
import app.mappers.OrderMapper;
import app.mappers.RestaurantMapper;
import app.server.Setup;
import app.utils.ErrorHandler;
import jakarta.persistence.EntityManager;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

public class AdminService {

    public static final String RESTAURANT_ACTIVE = "ACTIVE";
    public static final String RESTAURANT_PAUSED = "PAUSED";
    public static final String FROZEN = "FROZEN";

    public static final String COURIER_EN_ROUTE = "EN_ROUTE_TO_ORDER";
    public static final String COURIER_DELIVERING = "DELIVERING";
    public static final String COURIER_OFFLINE = "OFFLINE";
    public static final String COURIER_AVAILABLE = "AVAILABLE";

    public static final String ORDER_COMPLETED = "COMPLETED";
    public static final String ORDER_CANCELLED = "CANCELLED";
    public static final String ORDER_PROCESSING = "PROCESSING";
    public static final String ORDER_REFUNDED = "REFUNDED";
    public static final String ORDER_REQUEST = "REQUEST";

    private final RestaurantDAO restaurantDAO;
    private final DeliveryAgentDAO agentDAO;
    private final DeliveryDAO deliveryDAO;
    private final OrderDAO orderDAO;
    private final UserDAO userDAO;
    private final RestaurantApplicationDAO restaurantApplicationDAO;
    private final DriverApplicationDAO driverApplicationDAO;
    private final BannedEmailDAO bannedEmailDAO;
    private final MailService mailService;
    private final RestaurantMapper restaurantMapper = new RestaurantMapper();
    private final DeliveryAgentMapper agentMapper = new DeliveryAgentMapper();
    private final OrderMapper orderMapper = new OrderMapper();
    private final DriverApplicationMapper driverApplicationMapper = new DriverApplicationMapper();

    // ________________________________________________________

    public AdminService() {
        this(Setup.em, new MailService());
    }

    // ________________________________________________________

    public AdminService(EntityManager em, MailService mailService) {
        this(new RestaurantDAO(em), new DeliveryAgentDAO(em), new DeliveryDAO(em), new OrderDAO(em), new UserDAO(em),
                new RestaurantApplicationDAO(em), new DriverApplicationDAO(em), new BannedEmailDAO(em), mailService);
    }

    // ________________________________________________________

    public AdminService(
        RestaurantDAO restaurantDAO, DeliveryAgentDAO agentDAO, DeliveryDAO deliveryDAO,
        OrderDAO orderDAO, UserDAO userDAO, RestaurantApplicationDAO restaurantApplicationDAO,
        DriverApplicationDAO driverApplicationDAO, BannedEmailDAO bannedEmailDAO,
        MailService mailService
    ) {
        this.restaurantDAO = restaurantDAO;
        this.agentDAO = agentDAO;
        this.deliveryDAO = deliveryDAO;
        this.orderDAO = orderDAO;
        this.userDAO = userDAO;
        this.restaurantApplicationDAO = restaurantApplicationDAO;
        this.driverApplicationDAO = driverApplicationDAO;
        this.bannedEmailDAO = bannedEmailDAO;
        this.mailService = mailService;
    }

    // ________________________________________________________

    public Map<String, Long> overview() {
        long restaurantApplications = restaurantApplicationDAO.countByStatus(ApplicationStatus.PENDING);
        long driverApplications = driverApplicationDAO.countByStatus(ApplicationStatus.PENDING);

        Map<String, Long> overview = new LinkedHashMap<>();
        overview.put("activeOrders", orderDAO.countUnfinished());
        overview.put("restaurants", restaurantDAO.count());
        overview.put("restaurantApplications", restaurantApplications);
        overview.put("courierApplications", driverApplications);
        overview.put("totalApplications", restaurantApplications + driverApplications);
        overview.put("couriers", agentDAO.count());
        return overview;
    }

    // ________________________________________________________

    public List<RestaurantDTO> getRestaurants() {
        return restaurantDAO.getAllWithOwner().stream()
                .map(restaurant -> restaurantMapper.toAdminDTO(restaurant, restaurantStatus(restaurant)))
                .toList();
    }

    // ________________________________________________________

    public RestaurantDTO updateRestaurant(UUID id, RestaurantDTO body) {
        Restaurant restaurant = ErrorHandler.tryEntity(restaurantDAO.getById(id), Notifications.RESTAURANT_NOT_FOUND.getDisplayName());

        if (body.getName() != null) {
            requireText(body.getName(), Notifications.ADMIN_NAME_REQUIRED);
            restaurant.setName(body.getName().trim());
        }
        if (body.getDescription() != null) restaurant.setDescription(body.getDescription().trim());
        if (body.getPhoneNumber() != null) restaurant.setPhoneNumber(body.getPhoneNumber().trim());
        if (body.getCuisine() != null) restaurant.setCuisine(body.getCuisine());

        Address address = restaurant.getAddress() == null ? new Address() : restaurant.getAddress();
        if (body.getStreet() != null) address.setStreet(body.getStreet().trim());
        if (body.getPostalCode() != null) address.setPostalCode(body.getPostalCode().trim());
        if (body.getCity() != null) address.setCity(body.getCity().trim());
        restaurant.setAddress(address);

        return restaurantMapper.toAdminDTO(restaurantDAO.update(restaurant), restaurantStatus(restaurant));
    }

    // ________________________________________________________

    public RestaurantDTO setRestaurantVisibility(UUID id, boolean active) {
        Restaurant restaurant = ErrorHandler.tryEntity(restaurantDAO.getById(id), Notifications.RESTAURANT_NOT_FOUND.getDisplayName());
        if (restaurant.isLocked()) {
            throw new ApiException(409, Notifications.ADMIN_RESTAURANT_LOCKED.getDisplayName());
        }

        restaurant.setActive(active);
        return restaurantMapper.toAdminDTO(restaurantDAO.update(restaurant), restaurantStatus(restaurant));
    }

    // ________________________________________________________

    public RestaurantDTO lockRestaurant(UUID id, String reason) {
        requireText(reason, Notifications.ADMIN_LOCK_REASON_REQUIRED);

        Restaurant restaurant = ErrorHandler.tryEntity(restaurantDAO.getById(id), Notifications.RESTAURANT_NOT_FOUND.getDisplayName());
        restaurant.setLocked(true);
        restaurant.setActive(false);
        restaurant.setLockReason(reason.trim());
        return restaurantMapper.toAdminDTO(restaurantDAO.update(restaurant), restaurantStatus(restaurant));
    }

    // ________________________________________________________

    public RestaurantDTO unlockRestaurant(UUID id) {
        Restaurant restaurant = ErrorHandler.tryEntity(restaurantDAO.getById(id), Notifications.RESTAURANT_NOT_FOUND.getDisplayName());
        restaurant.setLocked(false);
        restaurant.setActive(true);
        restaurant.setLockReason(null);
        return restaurantMapper.toAdminDTO(restaurantDAO.update(restaurant), restaurantStatus(restaurant));
    }

    // ________________________________________________________

    public MailService.MailResult notifyRestaurantLock(UUID id, String reason) {
        Restaurant restaurant = ErrorHandler.tryEntity(restaurantDAO.getById(id), Notifications.RESTAURANT_NOT_FOUND.getDisplayName());
        return reason == null
                ? mailService.sendUnlockedEmail(restaurant.getOwner(), restaurant.getName(), "Din restaurant")
                : mailService.sendLockedEmail(restaurant.getOwner(), restaurant.getName(), "Din restaurant", reason.trim());
    }

    // ________________________________________________________

    public void deleteRestaurant(UUID id) {
        Restaurant restaurant = ErrorHandler.tryEntity(restaurantDAO.getById(id), Notifications.RESTAURANT_NOT_FOUND.getDisplayName());

        if (orderDAO.countByRestaurant(id) > 0) {
            throw new ApiException(409, Notifications.ADMIN_RESTAURANT_HAS_ORDERS.getDisplayName());
        }

        restaurantDAO.delete(restaurant);
    }

    // ________________________________________________________

    public List<DeliveryAgentDTO> getCouriers() {
        return agentDAO.getAllWithUser().stream()
                .map(agent -> agentMapper.toDTO(agent,
                        courierStatus(agent, deliveryDAO.getCurrentStatus(agent.getId()))))
                .toList();
    }

    // ________________________________________________________

    public DeliveryAgentDTO updateCourier(UUID id, UserDTO body) {
        DeliveryAgent agent = ErrorHandler.tryEntity(agentDAO.getById(id), Notifications.ADMIN_COURIER_NOT_FOUND.getDisplayName());
        User user = agent.getUser();

        if (body.getName() != null) {
            requireText(body.getName(), Notifications.ADMIN_NAME_REQUIRED);
            user.setFirstname(body.getName().trim());
        }
        if (body.getLastName() != null) {
            requireText(body.getLastName(), Notifications.ADMIN_NAME_REQUIRED);
            user.setLastname(body.getLastName().trim());
        }
        if (body.getEmail() != null && !body.getEmail().trim().equalsIgnoreCase(user.getEmail())) {
            if (userDAO.existsByEmailExcludingId(body.getEmail().trim(), user.getId())) {
                throw new ApiException(409, Notifications.ADMIN_EMAIL_TAKEN.getDisplayName());
            }
            user.setEmail(body.getEmail().trim());
        }
        if (body.getPhoneNumber() != null) {
            user.setPhoneNumber(body.getPhoneNumber().trim());
            agent.setPhoneNumber(body.getPhoneNumber().trim());
        }

        userDAO.update(user);
        return agentMapper.toDTO(agentDAO.update(agent),
                courierStatus(agent, deliveryDAO.getCurrentStatus(agent.getId())));
    }

    // ________________________________________________________

    public DeliveryAgentDTO lockCourier(UUID id, String reason) {
        requireText(reason, Notifications.ADMIN_LOCK_REASON_REQUIRED);

        DeliveryAgent agent = ErrorHandler.tryEntity(agentDAO.getById(id), Notifications.ADMIN_COURIER_NOT_FOUND.getDisplayName());
        agent.setLocked(true);
        agent.setActive(false);
        agent.setLockReason(reason.trim());
        return agentMapper.toDTO(agentDAO.update(agent),
                courierStatus(agent, deliveryDAO.getCurrentStatus(agent.getId())));
    }

    // ________________________________________________________

    public DeliveryAgentDTO unlockCourier(UUID id) {
        DeliveryAgent agent = ErrorHandler.tryEntity(agentDAO.getById(id), Notifications.ADMIN_COURIER_NOT_FOUND.getDisplayName());
        agent.setLocked(false);
        agent.setLockReason(null);
        return agentMapper.toDTO(agentDAO.update(agent),
                courierStatus(agent, deliveryDAO.getCurrentStatus(agent.getId())));
    }

    // ________________________________________________________

    public MailService.MailResult notifyCourierLock(UUID id, String reason) {
        User user = ErrorHandler.tryEntity(agentDAO.getById(id), Notifications.ADMIN_COURIER_NOT_FOUND.getDisplayName()).getUser();
        String name = fullName(user);
        return reason == null
                ? mailService.sendUnlockedEmail(user, name, "Din chaufførkonto")
                : mailService.sendLockedEmail(user, name, "Din chaufførkonto", reason.trim());
    }

    // ________________________________________________________

    public void deleteCourier(UUID id) {
        DeliveryAgent agent = ErrorHandler.tryEntity(agentDAO.getById(id), Notifications.ADMIN_COURIER_NOT_FOUND.getDisplayName());

        if (deliveryDAO.countByAgent(id) > 0) {
            throw new ApiException(409, Notifications.ADMIN_COURIER_HAS_DELIVERIES.getDisplayName());
        }

        removeCourier(agent);
    }

    // ________________________________________________________

    public void banCourier(UUID id, String reason) {
        DeliveryAgent agent = ErrorHandler.tryEntity(agentDAO.getById(id), Notifications.ADMIN_COURIER_NOT_FOUND.getDisplayName());

        String email = normalizeEmail(agent.getUser().getEmail());
        if (!bannedEmailDAO.existsByEmail(email)) {
            bannedEmailDAO.create(BannedEmail.builder().email(email).reason(reason == null ? null : reason.trim()).build());
        }

        if (deliveryDAO.countByAgent(id) > 0) {
            agent.setLocked(true);
            agent.setActive(false);
            agent.setLockReason(reason == null || reason.isBlank() ? "Banlyst" : reason.trim());
            agent.getUser().getRoles().remove(Role.DELIVERY_AGENT);
            userDAO.update(agent.getUser());
            agentDAO.update(agent);
        } else {
            removeCourier(agent);
        }
    }

    // ________________________________________________________

    public boolean isEmailBanned(String email) {
        if (email == null || email.isBlank()) return false;
        return bannedEmailDAO.existsByEmail(normalizeEmail(email));
    }

    // ________________________________________________________

    public List<DriverApplicationDTO> getDriverApplications() {
        return driverApplicationDAO.getAllNewestFirst().stream().map(driverApplicationMapper::toDTO).toList();
    }

    // ________________________________________________________

    public List<OrderDTO> getOrders(String filter) {
        String wanted = filter == null || filter.isBlank() ? null : filter.trim().toUpperCase();
        if (wanted != null && !Set.of(ORDER_COMPLETED, ORDER_CANCELLED, ORDER_PROCESSING, ORDER_REFUNDED, ORDER_REQUEST)
                .contains(wanted)) {
            throw new ApiException(400, Notifications.ADMIN_ORDER_FILTER_INVALID.getDisplayName());
        }

        return orderDAO.getAllWithRestaurantAndCustomer().stream()
            .map(order -> orderMapper.toAdminDTO(order, orderCategory(order)))
            .filter(order -> wanted == null || order.getAdminStatus().equals(wanted))
            .toList();
    }

    // ________________________________________________________

    public static String orderCategory(Order order) {
        if (order.getPayment() != null && order.getPayment().getStatus() == PaymentStatus.REFUNDED) {
            return ORDER_REFUNDED;
        }
        return switch (order.getStatus()) {
            case CANCELLED -> ORDER_CANCELLED;
            case DELIVERED -> ORDER_COMPLETED;
            case RECEIVED, PENDING -> ORDER_REQUEST;
            default -> ORDER_PROCESSING;
        };
    }

    // ________________________________________________________

    public static String restaurantStatus(Restaurant restaurant) {
        if (restaurant.isLocked()) return FROZEN;
        return restaurant.isActive() ? RESTAURANT_ACTIVE : RESTAURANT_PAUSED;
    }

    // ________________________________________________________

    public static String courierStatus(DeliveryAgent agent, DeliveryStatus currentDelivery) {
        if (agent.isLocked()) return FROZEN;
        if (currentDelivery == DeliveryStatus.ASSIGNED) return COURIER_EN_ROUTE;
        if (currentDelivery == DeliveryStatus.PICKED_UP) return COURIER_DELIVERING;
        return agent.isActive() ? COURIER_AVAILABLE : COURIER_OFFLINE;
    }

    // ________________________________________________________

    private void removeCourier(DeliveryAgent agent) {
        User user = agent.getUser();
        user.getRoles().remove(Role.DELIVERY_AGENT);
        userDAO.update(user);
        agentDAO.delete(agent);
    }

    // ________________________________________________________

    private static String fullName(User user) {
        String first = user.getFirstname() == null ? "" : user.getFirstname();
        String last = user.getLastname() == null ? "" : user.getLastname();
        return (first + " " + last).trim();
    }

    // ________________________________________________________

    private static void requireText(String value, Notifications message) {
        if (value == null || value.isBlank()) {
            throw new ApiException(400, message.getDisplayName());
        }
    }

    // ________________________________________________________

    private static String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }
}
