package app.controllers;

import app.controllers.generic.BaseController;
import app.daos.RestaurantApplicationDAO;
import app.daos.RestaurantDAO;
import app.daos.UserDAO;
import app.dtos.RestaurantApplicationDTO;
import app.dtos.UserDTO;
import app.entities.RestaurantApplication;
import app.enums.Notifications;
import app.enums.Role;
import app.mappers.RestaurantApplicationMapper;
import app.server.Setup;
import app.services.RestaurantApplicationService;
import app.utils.ErrorHandler;
import io.javalin.apibuilder.EndpointGroup;
import io.javalin.http.Context;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static io.javalin.apibuilder.ApiBuilder.get;
import static io.javalin.apibuilder.ApiBuilder.post;
import static io.javalin.apibuilder.ApiBuilder.put;

public class RestaurantApplicationController extends BaseController<RestaurantApplication, RestaurantApplicationDTO> {

    private final RestaurantApplicationDAO applicationDAO = new RestaurantApplicationDAO(Setup.em);
    private final RestaurantApplicationService applicationService = new RestaurantApplicationService(
            applicationDAO,
            new RestaurantDAO(Setup.em),
            new UserDAO(Setup.em)
    );

    // ________________________________________________________

    public RestaurantApplicationController() {
        super(RestaurantApplication.class, new RestaurantApplicationMapper());
    }

    // ________________________________________________________

    public static EndpointGroup registerRoutes() {
        RestaurantApplicationController controller = new RestaurantApplicationController();
        return () -> {
            post("/restaurant-applications", controller::submitApplication, Role.CUSTOMER, Role.RESTAURANT_OWNER);
            get("/restaurant-applications", controller::getAllApplications, Role.ADMIN);
            get("/my-restaurant-applications", controller::getMyApplications, Role.CUSTOMER, Role.RESTAURANT_OWNER);
            put("/restaurant-application/{id}", controller::resubmitApplication, Role.CUSTOMER, Role.RESTAURANT_OWNER);
            put("/restaurant-application/{id}/decision", controller::decideApplication, Role.ADMIN);
        };
    }

    // ________________________________________________________

    @Override
    protected List<RestaurantApplication> getAllEntities() {
        return applicationDAO.getAll();
    }

    // ________________________________________________________

    @Override
    protected RestaurantApplication getEntityById(UUID id) {
        return applicationService.getApplication(id);
    }

    // ________________________________________________________

    private void submitApplication(Context ctx) {
        UserDTO user = getUser(ctx);
        RestaurantApplicationDTO body = ErrorHandler.tryBody(ctx, RestaurantApplicationDTO.class, Notifications.BODY_EMPTY.getDisplayName());

        RestaurantApplication application = applicationService.submitApplication(user.getId(), body);

        String message = messageService.buildMessage(Notifications.APPLICATION_SUBMITTED, application.getRestaurantName());
        respond(ctx, 201, message, mapper.toDTO(application));
    }

    // ________________________________________________________

    private void getAllApplications(Context ctx) {
        List<RestaurantApplicationDTO> list = applicationService.getAllApplications()
            .stream()
            .map(application -> {
                RestaurantApplicationDTO dto = mapper.toDTO(application);
                dto.setAddressInUse(applicationService.isAddressInUse(application));
                return dto;
            }).toList();

        String message = messageService.buildMessage(
            Notifications.GET_ALL,
            String.valueOf(list.size()),
            entityClass.getName().toLowerCase()
        );
        respond(ctx, 200, message, Map.of("data", list));
    }

    // ________________________________________________________

    private void getMyApplications(Context ctx) {
        UserDTO user = getUser(ctx);

        List<RestaurantApplicationDTO> list = applicationService.getMyApplications(user.getId())
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

    private void resubmitApplication(Context ctx) {
        UserDTO user = getUser(ctx);
        UUID applicationId = ErrorHandler.tryParseUUID(ctx.pathParam("id"), Notifications.APPLICATION_NOT_FOUND.getDisplayName());
        RestaurantApplicationDTO body = ErrorHandler.tryBody(ctx, RestaurantApplicationDTO.class, Notifications.BODY_EMPTY.getDisplayName());

        RestaurantApplication application = applicationService.resubmitApplication(user.getId(), applicationId, body);

        String message = messageService.buildMessage(Notifications.APPLICATION_UPDATED, application.getRestaurantName());
        respond(ctx, 200, message, mapper.toDTO(application));
    }

    // ________________________________________________________

    private void decideApplication(Context ctx) {
        UUID applicationId = ErrorHandler.tryParseUUID(ctx.pathParam("id"), Notifications.APPLICATION_NOT_FOUND.getDisplayName());
        RestaurantApplicationDTO body = ErrorHandler.tryBody(ctx, RestaurantApplicationDTO.class, Notifications.BODY_EMPTY.getDisplayName());

        RestaurantApplication application = applicationService.decideApplication(applicationId, body);

        String message = messageService.buildMessage(
            Notifications.APPLICATION_DECIDED,
            application.getRestaurantName(),
            application.getStatus().name()
        );
        respond(ctx, 200, message, mapper.toDTO(application));
    }
}
