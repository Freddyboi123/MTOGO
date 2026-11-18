package app.controllers;

import app.controllers.generic.BaseController;
import app.daos.MenuItemDAO;
import app.daos.OrderDAO;
import app.daos.RestaurantDAO;
import app.daos.UserDAO;
import app.dtos.OrderDTO;
import app.dtos.UserDTO;
import app.entities.Order;
import app.enums.Notifications;
import app.enums.Role;
import app.mappers.OrderMapper;
import app.server.Setup;
import app.services.MockPaymentService;
import app.services.OrderService;
import app.utils.ErrorHandler;
import io.javalin.apibuilder.EndpointGroup;
import io.javalin.http.Context;

import java.util.List;
import java.util.UUID;

import static io.javalin.apibuilder.ApiBuilder.post;

public class OrderController extends BaseController<Order, OrderDTO> {

    private final OrderDAO orderDAO = new OrderDAO(Setup.em);
    private final OrderService orderService = new OrderService(
            orderDAO,
            new RestaurantDAO(Setup.em),
            new MenuItemDAO(Setup.em),
            new UserDAO(Setup.em),
            new MockPaymentService()
    );

    // ________________________________________________________

    public OrderController() {
        super(Order.class, new OrderMapper());
    }

    // ________________________________________________________

    public static EndpointGroup registerRoutes() {
        OrderController controller = new OrderController();
        return () -> post("/orders", controller::placeOrder, Role.CUSTOMER);
    }

    // ________________________________________________________

    @Override
    protected List<Order> getAllEntities() {
        return orderDAO.getAll();
    }

    // ________________________________________________________

    @Override
    protected Order getEntityById(UUID id) {
        return ErrorHandler.tryEntity(orderDAO.getById(id), Notifications.ORDER_NOT_FOUND.getDisplayName());
    }

    // ________________________________________________________

    private void placeOrder(Context ctx) {
        UserDTO user = ctx.attribute("user");
        OrderDTO body = ErrorHandler.tryBody(ctx, OrderDTO.class, Notifications.BODY_EMPTY.getDisplayName());

        Order order = orderService.placeOrder(user.getId(), body);

        String message = messageService.buildMessage(Notifications.ORDER_PLACED, String.valueOf(order.getId()));
        respond(ctx, 201, message, mapper.toDTO(order));
    }
}
