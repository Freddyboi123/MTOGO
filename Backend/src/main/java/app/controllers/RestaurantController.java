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
import app.exceptions.ApiException;
import app.mappers.MenuCategoryMapper;
import app.mappers.MenuItemMapper;
import app.mappers.RestaurantMapper;
import app.server.Setup;
import app.services.RestaurantService;
import app.utils.ErrorHandler;
import io.javalin.apibuilder.EndpointGroup;
import io.javalin.http.Context;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static io.javalin.apibuilder.ApiBuilder.get;
import static io.javalin.apibuilder.ApiBuilder.post;
import static io.javalin.apibuilder.ApiBuilder.put;

public class RestaurantController extends BaseController<Restaurant, RestaurantDTO> {

    private final EntityManagerFactory emf = Setup.em.getEntityManagerFactory();
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
            get("/restaurants", controller::getAllVisible, Role.ANYONE);
            get("/restaurant/{id}", controller::getVisible, Role.ANYONE);
            get("/restaurants/admin", controller::getAll, Role.ADMIN);
            get("/restaurants/admin/{id}", controller::getByID, Role.ADMIN);
            get("/restaurant/menu/{id}",controller::getMenu, Role.ANYONE);
            get("/my-restaurants", controller::getMyRestaurants, Role.CUSTOMER, Role.RESTAURANT_OWNER);
            get("/my-restaurants/{id}", controller::getMyRestaurant, Role.RESTAURANT_OWNER);
            put("/my-restaurants/{id}/visibility", controller::setVisibility, Role.RESTAURANT_OWNER);
            post("/restaurants", controller::createRestaurant, Role.RESTAURANT_OWNER);
            post("/restaurant/{id}/categories", controller::addCategory, Role.RESTAURANT_OWNER);
            post("/category/{id}/items", controller::addItem, Role.RESTAURANT_OWNER);
            put("/menu-item/{id}", controller::updateItem, Role.RESTAURANT_OWNER);

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

    private void getAllVisible(Context ctx) {

        List<RestaurantDTO> list;
        try (EntityManager reader = emf.createEntityManager()) {
            RestaurantService readService = new RestaurantService(new RestaurantDAO(reader),
                    new MenuCategoryDAO(reader), new MenuItemDAO(reader), new UserDAO(reader));
            list = readService.searchActiveRestaurants(
                ctx.queryParam("cuisine"),
                ctx.queryParam("q"),
                parseCoordinate(ctx.queryParam("lat")),
                parseCoordinate(ctx.queryParam("lon"))
            );
        }

        String message = messageService.buildMessage(
            Notifications.GET_ALL,
            String.valueOf(list.size()),
            entityClass.getSimpleName().toLowerCase()
        );

        respond(ctx, 200, message, Map.of("data", list));

    }

    // ________________________________________________________

    private static Double parseCoordinate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return Double.valueOf(value);
        } catch (NumberFormatException e) {
            throw new ApiException(400, Notifications.RESTAURANT_LOCATION_INVALID.getDisplayName());
        }
    }

    // ________________________________________________________

    private void getVisible(Context ctx) {

        UUID id = ErrorHandler.tryParseUUID(ctx.pathParam("id"), Notifications.RESTAURANT_NOT_FOUND.getDisplayName());
        Restaurant restaurant = restaurantService.getVisibleRestaurant(id);

        String message = messageService.buildMessage(
            Notifications.GET_BY_ID,
            entityClass.getSimpleName().toLowerCase(),
            id.toString()
        );
        respond(ctx, 200, message, Map.of("data", mapper.toDTO(restaurant)));

    }

    // ________________________________________________________

    private void getMyRestaurants(Context ctx) {
        UserDTO user = getUser(ctx);

        List<RestaurantDTO> list = restaurantService.getMyRestaurants(user.getId())
                .stream()
                .map(mapper::toDTO)
                .toList();

        String message = messageService.buildMessage(
                Notifications.GET_ALL,
                String.valueOf(list.size()),
                entityClass.getSimpleName().toLowerCase()
        );
        respond(ctx, 200, message, Map.of("data", list));
    }

    // ________________________________________________________

    private void getMyRestaurant(Context ctx) {

        UserDTO user = getUser(ctx);
        UUID restaurantId = ErrorHandler.tryParseUUID(ctx.pathParam("id"), Notifications.RESTAURANT_NOT_FOUND.getDisplayName());

        Restaurant restaurant = restaurantService.getMyRestaurant(user.getId(), restaurantId);

        String message = messageService.buildMessage(
                Notifications.GET_BY_ID,
                entityClass.getSimpleName().toLowerCase(),
                restaurantId.toString()
        );

        respond(ctx, 200, message, Map.of("data", mapper.toDTO(restaurant)));

    }

    // ________________________________________________________

    private void setVisibility(Context ctx) {
        UserDTO user = getUser(ctx);
        UUID restaurantId = ErrorHandler.tryParseUUID(ctx.pathParam("id"), Notifications.RESTAURANT_NOT_FOUND.getDisplayName());
        Map<String, String> body = ErrorHandler.tryBodyMap(ctx, Notifications.BODY_EMPTY.getDisplayName());

        String active = String.valueOf(body.get("active"));
        if (!active.equals("true") && !active.equals("false")) {
            throw new ApiException(400, Notifications.RESTAURANT_VISIBILITY_INVALID.getDisplayName());
        }

        Restaurant restaurant = restaurantService.setVisibility(user.getId(), restaurantId, Boolean.parseBoolean(active));

        String message = messageService.buildMessage(
            Notifications.RESTAURANT_VISIBILITY_CHANGED,
            restaurant.getName(),
            restaurant.isActive() ? "visible" : "hidden"
        );
        respond(ctx, 200, message, Map.of("data", mapper.toDTO(restaurant)));
    }

    // ________________________________________________________

    private void createRestaurant(Context ctx) {
        UserDTO user = getUser(ctx);
        RestaurantDTO body = ErrorHandler.tryBody(ctx, RestaurantDTO.class, Notifications.BODY_EMPTY.getDisplayName());

        Restaurant restaurant = restaurantService.createRestaurant(user.getId(), body);

        String message = messageService.buildMessage(Notifications.RESTAURANT_CREATED, restaurant.getName());
        respond(ctx, 201, message, mapper.toDTO(restaurant));
    }

    // ________________________________________________________

    private void addCategory(Context ctx) {
        UserDTO user = getUser(ctx);
        UUID restaurantId = ErrorHandler.tryParseUUID(ctx.pathParam("id"), Notifications.RESTAURANT_NOT_FOUND.getDisplayName());
        MenuCategoryDTO body = ErrorHandler.tryBody(ctx, MenuCategoryDTO.class, Notifications.BODY_EMPTY.getDisplayName());

        MenuCategory category = restaurantService.addCategory(user.getId(), restaurantId, body);

        String message = messageService.buildMessage(Notifications.CATEGORY_ADDED, category.getName());
        respond(ctx, 201, message, categoryMapper.toDTO(category));
    }

    // ________________________________________________________

    private void addItem(Context ctx) {
        UserDTO user = getUser(ctx);
        UUID categoryId = ErrorHandler.tryParseUUID(ctx.pathParam("id"), Notifications.CATEGORY_NOT_FOUND.getDisplayName());
        MenuItemDTO body = ErrorHandler.tryBody(ctx, MenuItemDTO.class, Notifications.BODY_EMPTY.getDisplayName());

        MenuItem item = restaurantService.addItem(user.getId(), categoryId, body);

        String message = messageService.buildMessage(Notifications.MENU_ITEM_ADDED, item.getName());
        respond(ctx, 201, message, itemMapper.toDTO(item));
    }

    // ________________________________________________________

    private void updateItem(Context ctx) {
        UserDTO user = getUser(ctx);
        UUID itemId = ErrorHandler.tryParseUUID(ctx.pathParam("id"), Notifications.MENU_ITEM_NOT_FOUND.getDisplayName());
        MenuItemDTO body = ErrorHandler.tryBody(ctx, MenuItemDTO.class, Notifications.BODY_EMPTY.getDisplayName());

        MenuItem item = restaurantService.updateItem(user.getId(), itemId, body);

        String message = messageService.buildMessage(Notifications.MENU_ITEM_UPDATED, item.getName());
        respond(ctx, 200, message, itemMapper.toDTO(item));
    }

    // ________________________________________________________

    private void getMenu(Context ctx) {
        UUID restaurantId = ErrorHandler.tryParseUUID(ctx.pathParam("id"), Notifications.RESTAURANT_NOT_FOUND.getDisplayName());

        List<MenuCategoryDTO> menu = restaurantService.getMenu(restaurantId).stream()
                .map(categoryMapper::toDTO)
                .toList();

        respond(ctx, 200, messageService.buildMessage(Notifications.MENU_FETCHED), menu);
    }
}
