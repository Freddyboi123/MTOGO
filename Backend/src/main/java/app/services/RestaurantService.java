package app.services;

import app.daos.MenuCategoryDAO;
import app.daos.MenuItemDAO;
import app.daos.RestaurantDAO;
import app.daos.UserDAO;
import app.dtos.MenuCategoryDTO;
import app.dtos.MenuItemDTO;
import app.dtos.RestaurantDTO;
import app.entities.MenuCategory;
import app.entities.MenuItem;
import app.entities.Restaurant;
import app.entities.User;
import app.enums.Notifications;
import app.exceptions.ApiException;
import app.mappers.MenuCategoryMapper;
import app.mappers.MenuItemMapper;
import app.mappers.RestaurantMapper;
import app.server.Setup;
import app.utils.ErrorHandler;

import java.util.UUID;

public class RestaurantService {

    private final RestaurantDAO restaurantDAO;
    private final MenuCategoryDAO categoryDAO;
    private final MenuItemDAO itemDAO;
    private final UserDAO userDAO;
    private final RestaurantMapper restaurantMapper = new RestaurantMapper();
    private final MenuCategoryMapper categoryMapper = new MenuCategoryMapper();
    private final MenuItemMapper itemMapper = new MenuItemMapper();

    // ________________________________________________________

    public RestaurantService() {
        this(new RestaurantDAO(Setup.em), new MenuCategoryDAO(Setup.em), new MenuItemDAO(Setup.em), new UserDAO(Setup.em));
    }

    // ________________________________________________________

    public RestaurantService(RestaurantDAO restaurantDAO, MenuCategoryDAO categoryDAO, MenuItemDAO itemDAO, UserDAO userDAO) {
        this.restaurantDAO = restaurantDAO;
        this.categoryDAO = categoryDAO;
        this.itemDAO = itemDAO;
        this.userDAO = userDAO;
    }

    // ________________________________________________________

    public Restaurant getRestaurant(UUID id) {
        return ErrorHandler.tryEntity(
                restaurantDAO.getById(id),
                Notifications.RESTAURANT_NOT_FOUND.getDisplayName()
        );
    }

    // ________________________________________________________

    public Restaurant createRestaurant(UUID ownerId, RestaurantDTO dto) {
        ErrorHandler.tryString(dto.getName(), Notifications.RESTAURANT_NAME_REQUIRED.getDisplayName());

        User owner = ErrorHandler.tryEntity(
                userDAO.getById(ownerId),
                Notifications.OWNER_NOT_FOUND.getDisplayName()
        );

        Restaurant restaurant = restaurantMapper.toEntity(dto);
        restaurant.setOwner(owner);

        return restaurantDAO.create(restaurant);
    }

    // ________________________________________________________

    public MenuCategory addCategory(UUID userId, UUID restaurantId, MenuCategoryDTO dto) {
        Restaurant restaurant = getRestaurant(restaurantId);
        checkOwner(restaurant, userId);

        ErrorHandler.tryString(dto.getName(), Notifications.CATEGORY_NAME_REQUIRED.getDisplayName());

        MenuCategory category = categoryMapper.toEntity(dto);
        restaurant.addCategory(category);

        return categoryDAO.create(category);
    }

    // ________________________________________________________

    public MenuItem addItem(UUID userId, UUID categoryId, MenuItemDTO dto) {
        MenuCategory category = ErrorHandler.tryEntity(
                categoryDAO.getById(categoryId),
                Notifications.CATEGORY_NOT_FOUND.getDisplayName()
        );
        checkOwner(category.getRestaurant(), userId);

        ErrorHandler.tryString(dto.getName(), Notifications.MENU_ITEM_NAME_REQUIRED.getDisplayName());

        if (dto.getPrice() == null || dto.getPrice().signum() < 0) {
            throw new ApiException(400, Notifications.MENU_ITEM_PRICE_INVALID.getDisplayName());
        }

        MenuItem item = itemMapper.toEntity(dto);
        category.addItem(item);

        return itemDAO.create(item);
    }

    // ________________________________________________________

    private void checkOwner(Restaurant restaurant, UUID userId) {
        if (!restaurant.getOwner().getId().equals(userId)) {
            throw new ApiException(403, Notifications.NOT_RESTAURANT_OWNER.getDisplayName());
        }
    }
}
