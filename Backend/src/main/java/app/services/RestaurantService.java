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
import app.enums.Cuisine;
import app.enums.Notifications;
import app.exceptions.ApiException;
import app.mappers.MenuCategoryMapper;
import app.mappers.MenuItemMapper;
import app.mappers.RestaurantMapper;
import app.server.Setup;
import app.utils.ErrorHandler;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

public class RestaurantService {

    private static final double RANGE_KILOMETERS = 10.0;

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

    public List<Restaurant> getMyRestaurants(UUID ownerId) {
        return restaurantDAO.getByOwnerId(ownerId);
    }

    // ________________________________________________________

    public Restaurant getMyRestaurant(UUID ownerId, UUID restaurantId) {
        Restaurant restaurant = getRestaurant(restaurantId);
        checkOwner(restaurant, ownerId);
        return restaurant;
    }

    // ________________________________________________________

    public Restaurant getVisibleRestaurant(UUID id) {
        Restaurant restaurant = getRestaurant(id);

        if (!restaurant.isActive()) {
            throw new ApiException(404, Notifications.RESTAURANT_NOT_FOUND.getDisplayName());
        }

        return restaurant;

    }

    // ________________________________________________________

    public Restaurant setVisibility(UUID ownerId, UUID restaurantId, boolean visible) {

        Restaurant restaurant = getMyRestaurant(ownerId, restaurantId);
        restaurant.setActive(visible);

        return restaurantDAO.update(restaurant);

    }

    // ________________________________________________________

    public List<Restaurant> getActiveRestaurants() {
        return restaurantDAO.getAllActive();
    }

    // ________________________________________________________

    public List<RestaurantDTO> searchActiveRestaurants(String cuisine, String query, Double latitude, Double longitude) {
        Cuisine wantedCuisine = cuisine == null || cuisine.isBlank() ? null
            : ErrorHandler.tryParseEnum(Cuisine.class, cuisine.trim(), Notifications.RESTAURANT_CUISINE_INVALID.getDisplayName());

        if (!isValidLocation(latitude, longitude)) {
            throw new ApiException(400, Notifications.RESTAURANT_LOCATION_INVALID.getDisplayName());
        }

        String text = query == null ? "" : query.trim().toLowerCase();
        List<RestaurantDTO> result = new ArrayList<>();

        for (Restaurant restaurant : restaurantDAO.getAllActive()) {
            if (wantedCuisine != null && restaurant.getCuisine() != wantedCuisine) {
                continue;
            }
            if (!text.isEmpty() && !matches(restaurant, text)) {
                continue;
            }

            RestaurantDTO dto = restaurantMapper.toDTO(restaurant);

            if (latitude != null && restaurant.getLatitude() != null && restaurant.getLongitude() != null) {
                double kilometers = DistanceCalculator.kilometers(latitude, longitude, restaurant.getLatitude(), restaurant.getLongitude());
                if (kilometers > RANGE_KILOMETERS) {
                    continue;
                }
                dto.setDistanceKm(Math.round(kilometers * 10) / 10.0);
            }

            result.add(dto);
        }

        if (latitude != null) {
            result.sort(Comparator.comparing(RestaurantDTO::getDistanceKm, Comparator.nullsLast(Comparator.naturalOrder())));
        }

        return result;
    }

    // ________________________________________________________

    public static boolean isValidLocation(Double latitude, Double longitude) {
        if (latitude == null && longitude == null) {
            return true;
        }
        return latitude != null && longitude != null
            && latitude >= -90 && latitude <= 90
            && longitude >= -180 && longitude <= 180;
    }

    // ________________________________________________________

    private static boolean matches(Restaurant restaurant, String text) {
        return restaurant.getName().toLowerCase().contains(text)
            || (restaurant.getDescription() != null && restaurant.getDescription().toLowerCase().contains(text));
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

        checkPrice(dto.getPrice());

        MenuItem item = itemMapper.toEntity(dto);
        category.addItem(item);

        return itemDAO.create(item);
    }

    // ________________________________________________________

    public MenuItem updateItem(UUID userId, UUID itemId, MenuItemDTO dto) {
        MenuItem item = ErrorHandler.tryEntity(
            itemDAO.getById(itemId),
            Notifications.MENU_ITEM_NOT_FOUND.getDisplayName()
        );
        checkOwner(item.getCategory().getRestaurant(), userId);

        if (dto.getName() != null) {
            ErrorHandler.tryString(dto.getName(), Notifications.MENU_ITEM_NAME_REQUIRED.getDisplayName());
        }

        if (dto.getPrice() != null) {
            checkPrice(dto.getPrice());
        }

        if (dto.getName() != null) {
            item.setName(dto.getName());
        }

        if (dto.getDescription() != null) {
            item.setDescription(dto.getDescription());
        }

        if (dto.getPrice() != null) {
            item.setPrice(dto.getPrice());
        }

        if (dto.getAvailable() != null) {
            item.setAvailable(dto.getAvailable());
        }

        return itemDAO.update(item);
    }

    // ________________________________________________________

    private void checkPrice(BigDecimal price) {
        if (price == null || price.signum() <= 0) {
            throw new ApiException(400, Notifications.MENU_ITEM_PRICE_INVALID.getDisplayName());
        }
    }

    // ________________________________________________________

    private void checkOwner(Restaurant restaurant, UUID userId) {
        if (!restaurant.getOwner().getId().equals(userId)) {
            throw new ApiException(403, Notifications.NOT_RESTAURANT_OWNER.getDisplayName());
        }
    }

    // ________________________________________________________

    public List<MenuCategory> getMenu(UUID restaurantId) {
        return getVisibleRestaurant(restaurantId).getCategories();
    }
}
