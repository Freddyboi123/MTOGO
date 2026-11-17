package app.controllers;

import app.controllers.generic.BaseController;
import app.daos.MenuCategoryDAO;
import app.daos.MenuItemDAO;
import app.daos.RestaurantDAO;
import app.daos.UserDAO;
import app.dtos.MenuCategoryDTO;
import app.dtos.MenuItemDTO;
import app.dtos.RestaurantDTO;
import app.dtos.UserDTO;
import app.entities.MenuCategory;
import app.entities.MenuItem;
import app.entities.Restaurant;
import app.enums.Notifications;
import app.enums.Role;
import app.mappers.MenuCategoryMapper;
import app.mappers.MenuItemMapper;
import app.mappers.RestaurantMapper;
import app.server.Setup;
import app.services.RestaurantService;
import app.utils.ErrorHandler;
import io.javalin.apibuilder.EndpointGroup;
import io.javalin.http.Context;

import java.util.List;
import java.util.UUID;

import static io.javalin.apibuilder.ApiBuilder.get;
import static io.javalin.apibuilder.ApiBuilder.post;

public class RestaurantController extends BaseController<Restaurant, RestaurantDTO> {

    private final RestaurantDAO restaurantDAO = new RestaurantDAO(Setup.em);
    private final RestaurantService restaurantService = new RestaurantService(
            restaurantDAO,
            new MenuCategoryDAO(Setup.em),
            new MenuItemDAO(Setup.em),
            new UserDAO(Setup.em)
    );
    private final MenuCategoryMapper categoryMapper = new MenuCategoryMapper();
    private final MenuItemMapper itemMapper = new MenuItemMapper();

    // ________________________________________________________

    public RestaurantController() {
        super(Restaurant.class, new RestaurantMapper());
    }

    // ________________________________________________________

    public static EndpointGroup registerRoutes() {
        RestaurantController controller = new RestaurantController();
        return () -> {
            get("/restaurants", controller::getAll, Role.ANYONE);
            get("/restaurant/{id}", controller::getByID, Role.ANYONE);
            post("/restaurants", controller::createRestaurant, Role.RESTAURANT_OWNER);
            post("/restaurant/{id}/categories", controller::addCategory, Role.RESTAURANT_OWNER);
            post("/category/{id}/items", controller::addItem, Role.RESTAURANT_OWNER);
        };
    }

    // ________________________________________________________

    @Override
    protected List<Restaurant> getAllEntities() {
        return restaurantDAO.getAll();
    }

    // ________________________________________________________

    @Override
    protected Restaurant getEntityById(UUID id) {
        return restaurantService.getRestaurant(id);
    }

    // ________________________________________________________

    private void createRestaurant(Context ctx) {
        UserDTO user = ctx.attribute("user");
        RestaurantDTO body = ErrorHandler.tryBody(ctx, RestaurantDTO.class, Notifications.BODY_EMPTY.getDisplayName());

        Restaurant restaurant = restaurantService.createRestaurant(user.getId(), body);

        String message = messageService.buildMessage(Notifications.RESTAURANT_CREATED, restaurant.getName());
        respond(ctx, 201, message, mapper.toDTO(restaurant));
    }

    // ________________________________________________________

    private void addCategory(Context ctx) {
        UserDTO user = ctx.attribute("user");
        UUID restaurantId = ErrorHandler.tryParseUUID(ctx.pathParam("id"), Notifications.RESTAURANT_NOT_FOUND.getDisplayName());
        MenuCategoryDTO body = ErrorHandler.tryBody(ctx, MenuCategoryDTO.class, Notifications.BODY_EMPTY.getDisplayName());

        MenuCategory category = restaurantService.addCategory(user.getId(), restaurantId, body);

        String message = messageService.buildMessage(Notifications.CATEGORY_ADDED, category.getName());
        respond(ctx, 201, message, categoryMapper.toDTO(category));
    }

    // ________________________________________________________

    private void addItem(Context ctx) {
        UserDTO user = ctx.attribute("user");
        UUID categoryId = ErrorHandler.tryParseUUID(ctx.pathParam("id"), Notifications.CATEGORY_NOT_FOUND.getDisplayName());
        MenuItemDTO body = ErrorHandler.tryBody(ctx, MenuItemDTO.class, Notifications.BODY_EMPTY.getDisplayName());

        MenuItem item = restaurantService.addItem(user.getId(), categoryId, body);

        String message = messageService.buildMessage(Notifications.MENU_ITEM_ADDED, item.getName());
        respond(ctx, 201, message, itemMapper.toDTO(item));
    }
}
