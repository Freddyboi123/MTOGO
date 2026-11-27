package app.services;

import app.daos.RestaurantApplicationDAO;
import app.daos.RestaurantDAO;
import app.daos.UserDAO;
import app.dtos.RestaurantApplicationDTO;
import app.entities.Address;
import app.entities.Restaurant;
import app.entities.RestaurantApplication;
import app.entities.User;
import app.enums.ApplicationStatus;
import app.enums.Notifications;
import app.enums.Role;
import app.exceptions.ApiException;
import app.mappers.RestaurantApplicationMapper;
import app.server.Setup;
import app.utils.ErrorHandler;

import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

public class RestaurantApplicationService {

    private final RestaurantApplicationDAO applicationDAO;
    private final RestaurantDAO restaurantDAO;
    private final UserDAO userDAO;
    private final RestaurantApplicationMapper applicationMapper = new RestaurantApplicationMapper();
    private final MailService mailService = new MailService();

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

    public List<RestaurantApplication> getAllApplications() {
        return applicationDAO.getAll()
            .stream()
            .sorted(Comparator.comparing(RestaurantApplication::getCreatedAt).reversed())
            .toList();
    }

    // ________________________________________________________

    public boolean isAddressInUse(RestaurantApplication application) {
        Address address = application.getAddress();

        return application.getStatus() != ApplicationStatus.APPROVED
            && restaurantDAO.existsByAddress(address.getStreet(), address.getPostalCode(), address.getCity());
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
        application.setCuisine(dto.getCuisine());
        application.setLatitude(dto.getLatitude());
        application.setLongitude(dto.getLongitude());
        application.setStatus(ApplicationStatus.PENDING);

        return applicationDAO.update(application);
    }

    // ________________________________________________________

    public RestaurantApplication decideApplication(UUID applicationId, RestaurantApplicationDTO dto) {
        RestaurantApplication application = getApplication(applicationId);

        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new ApiException(400, Notifications.APPLICATION_NOT_PENDING.getDisplayName());
        }

        ApplicationStatus decision = dto.getStatus();
        if (decision == null || decision == ApplicationStatus.PENDING) {
            throw new ApiException(400, Notifications.APPLICATION_DECISION_INVALID.getDisplayName());
        }

        if (decision == ApplicationStatus.MORE_INFORMATION_NEEDED) {
            ErrorHandler.tryString(dto.getAdminMessage(), Notifications.APPLICATION_MESSAGE_REQUIRED.getDisplayName());
            application.setAdminMessage(dto.getAdminMessage());
        } else if (decision == ApplicationStatus.REJECTED) {
            application.setAdminMessage(dto.getAdminMessage());
        }

        if (decision == ApplicationStatus.APPROVED) {
            createRestaurant(application);
        }

        application.setStatus(decision);

        return applicationDAO.update(application);
    }

    // ________________________________________________________

    public MailService.MailResult notifyApplicant(RestaurantApplication application) {
        return mailService.sendApplicationStatusEmail(application);
    }

    // ________________________________________________________

    private void createRestaurant(RestaurantApplication application) {
        Address address = application.getAddress();

        if (restaurantDAO.existsByNameAndCity(application.getRestaurantName(), address.getCity())) {
            throw new ApiException(400, Notifications.APPLICATION_NAME_TAKEN.getDisplayName());
        }

        User owner = application.getApplicant();


        Restaurant restaurant = Restaurant.builder()
            .name(application.getRestaurantName())
            .description(application.getDescription())
            .phoneNumber(application.getPhoneNumber())
            .cuisine(application.getCuisine())
            .latitude(application.getLatitude())
            .longitude(application.getLongitude())
            .address(address)
            .owner(owner)
            .build();
        restaurantDAO.create(restaurant);

        Set<Role> roles = new HashSet<>(owner.getRoles());
        roles.add(Role.RESTAURANT_OWNER);
        owner.setRoles(roles);
        userDAO.update(owner);
    }

    // ________________________________________________________

    private void validate(RestaurantApplicationDTO dto) {
        ErrorHandler.tryString(dto.getRestaurantName(), Notifications.APPLICATION_NAME_REQUIRED.getDisplayName());
        ErrorHandler.tryString(dto.getStreet(), Notifications.APPLICATION_ADDRESS_REQUIRED.getDisplayName());
        ErrorHandler.tryString(dto.getPostalCode(), Notifications.APPLICATION_ADDRESS_REQUIRED.getDisplayName());
        ErrorHandler.tryString(dto.getCity(), Notifications.APPLICATION_ADDRESS_REQUIRED.getDisplayName());

        if (dto.getCuisine() == null) {
            throw new ApiException(400, Notifications.APPLICATION_CUISINE_REQUIRED.getDisplayName());
        }
        if (dto.getLatitude() == null || !RestaurantService.isValidLocation(dto.getLatitude(), dto.getLongitude())) {
            throw new ApiException(400, Notifications.APPLICATION_LOCATION_REQUIRED.getDisplayName());
        }

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
