package app.controllers;

import app.controllers.generic.BaseController;
import app.dtos.DriverApplicationDTO;
import app.dtos.UserDTO;
import app.entities.DriverApplication;
import app.enums.Notifications;
import app.enums.Role;
import app.mappers.DriverApplicationMapper;
import app.services.DriverApplicationService;
import app.services.MailService;
import app.utils.ErrorHandler;
import io.javalin.apibuilder.EndpointGroup;
import io.javalin.http.Context;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static io.javalin.apibuilder.ApiBuilder.get;
import static io.javalin.apibuilder.ApiBuilder.post;
import static io.javalin.apibuilder.ApiBuilder.put;

public class DriverApplicationController extends BaseController<DriverApplication, DriverApplicationDTO> {

    private final DriverApplicationService applicationService = new DriverApplicationService();

    // ________________________________________________________

    public DriverApplicationController() {
        super(DriverApplication.class, new DriverApplicationMapper());
    }

    // ________________________________________________________

    public static EndpointGroup registerRoutes() {
        DriverApplicationController controller = new DriverApplicationController();
        return () -> {
            post("/driver-applications", controller::submitApplication, Role.CUSTOMER, Role.RESTAURANT_OWNER);
            get("/driver-applications", controller::getAll, Role.ADMIN);
            get("/driver-application/{id}", controller::getByID, Role.ADMIN);
            get("/my-driver-applications", controller::getMyApplications, Role.CUSTOMER, Role.RESTAURANT_OWNER);
            put("/driver-application/{id}", controller::resubmitApplication, Role.CUSTOMER, Role.RESTAURANT_OWNER);
            put("/driver-application/{id}/decision", controller::decideApplication, Role.ADMIN);
        };
    }

    // ________________________________________________________

    @Override
    protected List<DriverApplication> getAllEntities() {
        return applicationService.getAllApplications();
    }

    // ________________________________________________________

    @Override
    protected DriverApplication getEntityById(UUID id) {
        return applicationService.getApplication(id);
    }

    // ________________________________________________________

    private void submitApplication(Context ctx) {
        UserDTO user = getUser(ctx);
        DriverApplicationDTO body = ErrorHandler.tryBody(ctx, DriverApplicationDTO.class, Notifications.BODY_EMPTY.getDisplayName());

        DriverApplication application = applicationService.submitApplication(user.getId(), body);

        String message = messageService.buildMessage(Notifications.DRIVER_APPLICATION_SUBMITTED);
        respond(ctx, 201, message, mapper.toDTO(application));
    }

    // ________________________________________________________

    private void getMyApplications(Context ctx) {
        UserDTO user = getUser(ctx);

        List<DriverApplicationDTO> list = applicationService.getMyApplications(user.getId())
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
        DriverApplicationDTO body = ErrorHandler.tryBody(ctx, DriverApplicationDTO.class, Notifications.BODY_EMPTY.getDisplayName());

        DriverApplication application = applicationService.resubmitApplication(user.getId(), applicationId, body);

        String message = messageService.buildMessage(Notifications.DRIVER_APPLICATION_UPDATED);
        respond(ctx, 200, message, mapper.toDTO(application));
    }

    // ________________________________________________________

    private void decideApplication(Context ctx) {
        UUID applicationId = ErrorHandler.tryParseUUID(ctx.pathParam("id"), Notifications.APPLICATION_NOT_FOUND.getDisplayName());
        DriverApplicationDTO body = ErrorHandler.tryBody(ctx, DriverApplicationDTO.class, Notifications.BODY_EMPTY.getDisplayName());

        DriverApplication application = applicationService.decideApplication(applicationId, body);
        MailService.MailResult mailResult = applicationService.notifyApplicant(application);

        String message = messageService.buildMessage(
            Notifications.DRIVER_APPLICATION_DECIDED,
            application.getFirstname() + " " + application.getLastname(),
            application.getStatus().name()
        );

        DriverApplicationDTO dto = mapper.toDTO(application);
        dto.setMailSent(mailResult.sent());
        respond(ctx, 200, message, dto);
    }
}
