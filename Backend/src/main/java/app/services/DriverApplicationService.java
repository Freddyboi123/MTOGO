package app.services;

import app.daos.DriverApplicationDAO;
import app.daos.UserDAO;
import app.dtos.DriverApplicationDTO;
import app.entities.DriverApplication;
import app.entities.User;
import app.enums.ApplicationStatus;
import app.enums.Notifications;
import app.exceptions.ApiException;
import app.mappers.DriverApplicationMapper;
import app.server.Setup;
import app.utils.ErrorHandler;

import java.util.HashSet;
import java.util.List;
import java.util.UUID;

public class DriverApplicationService {

    private static final int MIN_WEEKLY_HOURS = 1;
    private static final int MAX_WEEKLY_HOURS = 80;

    private final DriverApplicationDAO applicationDAO;
    private final UserDAO userDAO;
    private final DriverApplicationMapper applicationMapper = new DriverApplicationMapper();

    // ________________________________________________________

    public DriverApplicationService() {
        this(new DriverApplicationDAO(Setup.em), new UserDAO(Setup.em));
    }

    // ________________________________________________________

    public DriverApplicationService(DriverApplicationDAO applicationDAO, UserDAO userDAO) {
        this.applicationDAO = applicationDAO;
        this.userDAO = userDAO;
    }

    // ________________________________________________________

    public DriverApplication getApplication(UUID id) {
        return ErrorHandler.tryEntity(
            applicationDAO.getById(id),
            Notifications.APPLICATION_NOT_FOUND.getDisplayName()
        );
    }

    // ________________________________________________________

    public List<DriverApplication> getAllApplications() {
        return applicationDAO.getAllNewestFirst();
    }

    // ________________________________________________________

    public List<DriverApplication> getMyApplications(UUID applicantId) {
        return applicationDAO.getByApplicantId(applicantId);
    }

    // ________________________________________________________

    public DriverApplication submitApplication(UUID applicantId, DriverApplicationDTO dto) {
        User applicant = ErrorHandler.tryEntity(
            userDAO.getById(applicantId),
            Notifications.USER_NOT_FOUND.getDisplayName()
        );

        fillContactDetails(dto, applicant);
        validate(dto);

        DriverApplication application = applicationMapper.toEntity(dto);
        application.setApplicant(applicant);

        return applicationDAO.create(application);
    }

    // ________________________________________________________

    public DriverApplication resubmitApplication(UUID applicantId, UUID applicationId, DriverApplicationDTO dto) {
        DriverApplication application = getApplication(applicationId);

        if (application.getApplicant() == null || !application.getApplicant().getId().equals(applicantId)) {
            throw new ApiException(403, Notifications.NOT_APPLICANT.getDisplayName());
        }

        if (application.getStatus() != ApplicationStatus.MORE_INFORMATION_NEEDED) {
            throw new ApiException(400, Notifications.APPLICATION_NOT_EDITABLE.getDisplayName());
        }

        fillContactDetails(dto, application.getApplicant());
        validate(dto);

        application.setFirstname(dto.getFirstname());
        application.setLastname(dto.getLastname());
        application.setEmail(dto.getEmail());
        application.setPhoneNumber(dto.getPhoneNumber());
        application.setVehicle(dto.getVehicle());
        application.setRegion(dto.getRegion());
        application.setWeeklyHours(dto.getWeeklyHours());
        application.setTimesOfDay(new HashSet<>(dto.getTimesOfDay()));
        application.setStatus(ApplicationStatus.PENDING);

        return applicationDAO.update(application);
    }

    // ________________________________________________________

    private void fillContactDetails(DriverApplicationDTO dto, User user) {
        if (isBlank(dto.getFirstname())) dto.setFirstname(user.getFirstname());
        if (isBlank(dto.getLastname())) dto.setLastname(user.getLastname());
        if (isBlank(dto.getEmail())) dto.setEmail(user.getEmail());
        if (isBlank(dto.getPhoneNumber())) dto.setPhoneNumber(user.getPhoneNumber());
    }

    // ________________________________________________________

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    // ________________________________________________________

    private void validate(DriverApplicationDTO dto) {
        ErrorHandler.tryString(dto.getFirstname(), Notifications.DRIVER_APPLICATION_NAME_REQUIRED.getDisplayName());
        ErrorHandler.tryString(dto.getLastname(), Notifications.DRIVER_APPLICATION_NAME_REQUIRED.getDisplayName());

        String email = ErrorHandler.tryString(dto.getEmail(), Notifications.APPLICATION_EMAIL_INVALID.getDisplayName());
        if (!email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            throw new ApiException(400, Notifications.APPLICATION_EMAIL_INVALID.getDisplayName());
        }

        String phone = ErrorHandler.tryString(dto.getPhoneNumber(), Notifications.APPLICATION_PHONE_INVALID.getDisplayName());
        if (!phone.replaceAll("\\s", "").matches("\\+?\\d{8,12}")) {
            throw new ApiException(400, Notifications.APPLICATION_PHONE_INVALID.getDisplayName());
        }

        if (dto.getVehicle() == null) {
            throw new ApiException(400, Notifications.DRIVER_APPLICATION_VEHICLE_REQUIRED.getDisplayName());
        }

        if (dto.getRegion() == null) {
            throw new ApiException(400, Notifications.DRIVER_APPLICATION_REGION_REQUIRED.getDisplayName());
        }

        Integer hours = dto.getWeeklyHours();
        if (hours == null || hours < MIN_WEEKLY_HOURS || hours > MAX_WEEKLY_HOURS) {
            throw new ApiException(400, Notifications.DRIVER_APPLICATION_HOURS_INVALID.getDisplayName());
        }

        if (dto.getTimesOfDay() == null || dto.getTimesOfDay().isEmpty()) {
            throw new ApiException(400, Notifications.DRIVER_APPLICATION_TIMES_REQUIRED.getDisplayName());
        }
    }
}
