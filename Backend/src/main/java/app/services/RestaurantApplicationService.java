package app.services;

import app.daos.RestaurantApplicationDAO;
import app.daos.RestaurantDAO;
import app.daos.UserDAO;
import app.dtos.RestaurantApplicationDTO;
import app.entities.Address;
import app.entities.RestaurantApplication;
import app.entities.User;
import app.enums.ApplicationStatus;
import app.enums.Notifications;
import app.exceptions.ApiException;
import app.mappers.RestaurantApplicationMapper;
import app.server.Setup;
import app.utils.ErrorHandler;

import java.util.List;
import java.util.UUID;

public class RestaurantApplicationService {

    private final RestaurantApplicationDAO applicationDAO;
    private final RestaurantDAO restaurantDAO;
    private final UserDAO userDAO;
    private final RestaurantApplicationMapper applicationMapper = new RestaurantApplicationMapper();

    // ________________________________________________________

    public RestaurantApplicationService() {
        this(new RestaurantApplicationDAO(Setup.em), new RestaurantDAO(Setup.em), new UserDAO(Setup.em));
    }

    // ________________________________________________________

    public RestaurantApplicationService(RestaurantApplicationDAO applicationDAO, RestaurantDAO restaurantDAO, UserDAO userDAO) {
        this.applicationDAO = applicationDAO;
        this.restaurantDAO = restaurantDAO;
        this.userDAO = userDAO;
    }

    // ________________________________________________________

    public RestaurantApplication getApplication(UUID id) {
        return ErrorHandler.tryEntity(
            applicationDAO.getById(id),
            Notifications.APPLICATION_NOT_FOUND.getDisplayName()
        );
    }

    // ________________________________________________________

    public List<RestaurantApplication> getMyApplications(UUID applicantId) {
        return applicationDAO.getByApplicantId(applicantId);
    }

    // ________________________________________________________

    public RestaurantApplication submitApplication(UUID applicantId, RestaurantApplicationDTO dto) {
        validate(dto);

        User applicant = ErrorHandler.tryEntity(
            userDAO.getById(applicantId),
            Notifications.USER_NOT_FOUND.getDisplayName()
        );

        RestaurantApplication application = applicationMapper.toEntity(dto);
        application.setApplicant(applicant);

        return applicationDAO.create(application);
    }

    // ________________________________________________________

    public RestaurantApplication resubmitApplication(UUID applicantId, UUID applicationId, RestaurantApplicationDTO dto) {
        RestaurantApplication application = getApplication(applicationId);

        if (!application.getApplicant().getId().equals(applicantId)) {
            throw new ApiException(403, Notifications.NOT_APPLICANT.getDisplayName());
        }

        if (application.getStatus() != ApplicationStatus.MORE_INFORMATION_NEEDED) {
            throw new ApiException(400, Notifications.APPLICATION_NOT_EDITABLE.getDisplayName());
        }

        validate(dto);

        application.setRestaurantName(dto.getRestaurantName());
        application.setCvr(dto.getCvr());
        application.setAddress(Address.builder()
            .street(dto.getStreet())
            .postalCode(dto.getPostalCode())
            .city(dto.getCity())
            .build());
        application.setEmail(dto.getEmail());
        application.setPhoneNumber(dto.getPhoneNumber());
        application.setDescription(dto.getDescription());
        application.setStatus(ApplicationStatus.PENDING);

        return applicationDAO.update(application);
    }

    // ________________________________________________________

    private void validate(RestaurantApplicationDTO dto) {
        ErrorHandler.tryString(dto.getRestaurantName(), Notifications.APPLICATION_NAME_REQUIRED.getDisplayName());
        ErrorHandler.tryString(dto.getStreet(), Notifications.APPLICATION_ADDRESS_REQUIRED.getDisplayName());
        ErrorHandler.tryString(dto.getPostalCode(), Notifications.APPLICATION_ADDRESS_REQUIRED.getDisplayName());
        ErrorHandler.tryString(dto.getCity(), Notifications.APPLICATION_ADDRESS_REQUIRED.getDisplayName());

        String cvr = ErrorHandler.tryString(dto.getCvr(), Notifications.APPLICATION_CVR_INVALID.getDisplayName());
        if (!cvr.matches("\\d{8}")) {
            throw new ApiException(400, Notifications.APPLICATION_CVR_INVALID.getDisplayName());
        }

        String email = ErrorHandler.tryString(dto.getEmail(), Notifications.APPLICATION_EMAIL_INVALID.getDisplayName());
        if (!email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            throw new ApiException(400, Notifications.APPLICATION_EMAIL_INVALID.getDisplayName());
        }

        String phone = ErrorHandler.tryString(dto.getPhoneNumber(), Notifications.APPLICATION_PHONE_INVALID.getDisplayName());
        if (!phone.replaceAll("\\s", "").matches("\\+?\\d{8,12}")) {
            throw new ApiException(400, Notifications.APPLICATION_PHONE_INVALID.getDisplayName());
        }

        if (restaurantDAO.existsByNameAndCity(dto.getRestaurantName(), dto.getCity())) {
            throw new ApiException(400, Notifications.APPLICATION_NAME_TAKEN.getDisplayName());
        }
    }
}
