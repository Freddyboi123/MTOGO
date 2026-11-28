package app.services;

import app.configs.TestHibernateConfig;
import app.daos.DeliveryAgentDAO;
import app.daos.DriverApplicationDAO;
import app.daos.UserDAO;
import app.dtos.DriverApplicationDTO;
import app.entities.DeliveryAgent;
import app.entities.DriverApplication;
import app.entities.User;
import app.enums.ApplicationStatus;
import app.enums.Region;
import app.enums.Role;
import app.enums.TimeOfDay;
import app.enums.Vehicle;
import app.exceptions.ApiException;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class DriverApplicationServiceTest {

    private static EntityManagerFactory emf;
    private static EntityManager em;

    private DriverApplicationDAO applicationDAO;
    private DriverApplicationService service;
    private UserDAO userDAO;
    private User applicant;

    // ________________________________________________________

    @BeforeAll
    static void setUpDatabase() {
        emf = TestHibernateConfig.getTestEmf();
        em = emf.createEntityManager();
    }

    // ________________________________________________________

    @AfterAll
    static void closeDatabase() {
        em.close();
        emf.close();
    }

    // ________________________________________________________

    @BeforeEach
    void setUp() {
        userDAO = new UserDAO(em);
        applicationDAO = new DriverApplicationDAO(em);
        service = new DriverApplicationService(applicationDAO, new DeliveryAgentDAO(em), userDAO);
        applicant = createUser("Sofie", "Andersen", "+4528345678");
    }

    // ________________________________________________________

    private User createUser(String firstname, String lastname, String phoneNumber) {
        return userDAO.create(User.builder()
                .firstname(firstname)
                .lastname(lastname)
                .phoneNumber(phoneNumber)
                .email(UUID.randomUUID() + "@test.dk")
                .roles(Set.of(Role.CUSTOMER))
                .build());
    }

    // ________________________________________________________

    private DriverApplicationDTO applicationDTO() {
        return DriverApplicationDTO.builder()
                .vehicle(Vehicle.E_BIKE)
                .region(Region.CAPITAL)
                .weeklyHours(20)
                .timesOfDay(Set.of(TimeOfDay.EVENING, TimeOfDay.NIGHT))
                .build();
    }

    // ________________________________________________________

    private int statusOf(Runnable action) {
        return assertThrows(ApiException.class, action::run).getStatus();
    }

    // ________________________________________________________

    @Test
    void submitSavesApplicationAsPending() {
        DriverApplication application = service.submitApplication(applicant.getId(), applicationDTO());

        assertNotNull(application.getId());
        assertEquals(ApplicationStatus.PENDING, application.getStatus());
        assertEquals(Vehicle.E_BIKE, application.getVehicle());
        assertEquals(Region.CAPITAL, application.getRegion());
        assertEquals(20, application.getWeeklyHours());
        assertEquals(applicant.getId(), application.getApplicant().getId());
    }

    // ________________________________________________________

    @Test
    void submitKeepsEveryChosenTimeOfDay() {
        DriverApplicationDTO dto = applicationDTO();
        dto.setTimesOfDay(Set.of(TimeOfDay.MORNING, TimeOfDay.MIDDAY, TimeOfDay.EVENING, TimeOfDay.NIGHT));

        DriverApplication application = service.submitApplication(applicant.getId(), dto);

        assertEquals(Set.of(TimeOfDay.MORNING, TimeOfDay.MIDDAY, TimeOfDay.EVENING, TimeOfDay.NIGHT), application.getTimesOfDay());
    }

    // ________________________________________________________

    @Test
    void submitFillsContactDetailsFromTheProfile() {
        DriverApplication application = service.submitApplication(applicant.getId(), applicationDTO());

        assertEquals("Sofie", application.getFirstname());
        assertEquals("Andersen", application.getLastname());
        assertEquals(applicant.getEmail(), application.getEmail());
        assertEquals("+4528345678", application.getPhoneNumber());
    }

    // ________________________________________________________

    @Test
    void submitPrefersDetailsTheApplicantEnters() {
        DriverApplicationDTO dto = applicationDTO();
        dto.setPhoneNumber("+4511223344");

        DriverApplication application = service.submitApplication(applicant.getId(), dto);

        assertEquals("+4511223344", application.getPhoneNumber());
    }

    // ________________________________________________________

    @Test
    void submitRequiresPhoneNumberWhenTheProfileHasNone() {
        User withoutPhone = createUser("Ida", "Hansen", null);

        assertEquals(400, statusOf(() -> service.submitApplication(withoutPhone.getId(), applicationDTO())));
    }

    // ________________________________________________________

    @Test
    void submitAcceptsPhoneNumberWhenTheProfileHasNone() {
        User withoutPhone = createUser("Ida", "Hansen", null);
        DriverApplicationDTO dto = applicationDTO();
        dto.setPhoneNumber("28 34 56 78");

        DriverApplication application = service.submitApplication(withoutPhone.getId(), dto);

        assertEquals("28 34 56 78", application.getPhoneNumber());
    }

    // ________________________________________________________

    @Test
    void submitRequiresNameWhenTheProfileHasNone() {
        User withoutName = createUser(null, null, "+4528345678");

        assertEquals(400, statusOf(() -> service.submitApplication(withoutName.getId(), applicationDTO())));
    }

    // ________________________________________________________

    @Test
    void submitRejectsInvalidEmail() {
        DriverApplicationDTO dto = applicationDTO();
        dto.setEmail("not-an-email");

        assertEquals(400, statusOf(() -> service.submitApplication(applicant.getId(), dto)));
    }

    // ________________________________________________________

    @Test
    void submitRejectsInvalidPhoneNumber() {
        DriverApplicationDTO dto = applicationDTO();
        dto.setPhoneNumber("12");

        assertEquals(400, statusOf(() -> service.submitApplication(applicant.getId(), dto)));
    }

    // ________________________________________________________

    @Test
    void submitRequiresVehicle() {
        DriverApplicationDTO dto = applicationDTO();
        dto.setVehicle(null);

        assertEquals(400, statusOf(() -> service.submitApplication(applicant.getId(), dto)));
    }

    // ________________________________________________________

    @Test
    void submitRequiresRegion() {
        DriverApplicationDTO dto = applicationDTO();
        dto.setRegion(null);

        assertEquals(400, statusOf(() -> service.submitApplication(applicant.getId(), dto)));
    }

    // ________________________________________________________

    @Test
    void submitRejectsHoursOutsideTheAllowedRange() {
        DriverApplicationDTO none = applicationDTO();
        none.setWeeklyHours(null);
        DriverApplicationDTO zero = applicationDTO();
        zero.setWeeklyHours(0);
        DriverApplicationDTO tooMany = applicationDTO();
        tooMany.setWeeklyHours(81);

        assertEquals(400, statusOf(() -> service.submitApplication(applicant.getId(), none)));
        assertEquals(400, statusOf(() -> service.submitApplication(applicant.getId(), zero)));
        assertEquals(400, statusOf(() -> service.submitApplication(applicant.getId(), tooMany)));
    }

    // ________________________________________________________

    @Test
    void submitRequiresAtLeastOneTimeOfDay() {
        DriverApplicationDTO empty = applicationDTO();
        empty.setTimesOfDay(Set.of());
        DriverApplicationDTO missing = applicationDTO();
        missing.setTimesOfDay(null);

        assertEquals(400, statusOf(() -> service.submitApplication(applicant.getId(), empty)));
        assertEquals(400, statusOf(() -> service.submitApplication(applicant.getId(), missing)));
    }

    // ________________________________________________________

    @Test
    void submitFailsForUnknownUser() {
        assertEquals(404, statusOf(() -> service.submitApplication(UUID.randomUUID(), applicationDTO())));
    }

    // ________________________________________________________

    @Test
    void getMyApplicationsReturnsOnlyTheApplicantsOwn() {
        User other = createUser("Peter", "Jensen", "+4511223344");
        DriverApplication mine = service.submitApplication(applicant.getId(), applicationDTO());
        service.submitApplication(other.getId(), applicationDTO());

        List<DriverApplication> result = service.getMyApplications(applicant.getId());

        assertEquals(1, result.size());
        assertEquals(mine.getId(), result.get(0).getId());
    }

    // ________________________________________________________

    @Test
    void getMyApplicationsListsNewestFirst() {
        DriverApplication first = service.submitApplication(applicant.getId(), applicationDTO());
        first.setCreatedAt(first.getCreatedAt().minusDays(2));
        applicationDAO.update(first);
        DriverApplication second = service.submitApplication(applicant.getId(), applicationDTO());

        List<DriverApplication> result = service.getMyApplications(applicant.getId());

        assertEquals(second.getId(), result.get(0).getId());
        assertEquals(first.getId(), result.get(1).getId());
    }

    // ________________________________________________________

    @Test
    void getApplicationFailsWhenMissing() {
        assertEquals(404, statusOf(() -> service.getApplication(UUID.randomUUID())));
    }

    // ________________________________________________________

    @Test
    void resubmitSetsStatusBackToPending() {
        DriverApplication application = service.submitApplication(applicant.getId(), applicationDTO());
        application.setStatus(ApplicationStatus.MORE_INFORMATION_NEEDED);
        application.setAdminMessage("Choose a region");
        applicationDAO.update(application);

        DriverApplicationDTO corrected = applicationDTO();
        corrected.setRegion(Region.ZEALAND);
        corrected.setWeeklyHours(35);
        corrected.setTimesOfDay(Set.of(TimeOfDay.MORNING));
        DriverApplication result = service.resubmitApplication(applicant.getId(), application.getId(), corrected);

        assertEquals(ApplicationStatus.PENDING, result.getStatus());
        assertEquals(Region.ZEALAND, result.getRegion());
        assertEquals(35, result.getWeeklyHours());
        assertEquals(Set.of(TimeOfDay.MORNING), result.getTimesOfDay());
    }

    // ________________________________________________________

    @Test
    void resubmitIsRejectedUnlessMoreInformationWasRequested() {
        DriverApplication application = service.submitApplication(applicant.getId(), applicationDTO());

        assertEquals(400, statusOf(() -> service.resubmitApplication(applicant.getId(), application.getId(), applicationDTO())));
    }

    // ________________________________________________________

    @Test
    void resubmitIsRejectedForAnotherUser() {
        User other = createUser("Peter", "Jensen", "+4511223344");
        DriverApplication application = service.submitApplication(applicant.getId(), applicationDTO());
        application.setStatus(ApplicationStatus.MORE_INFORMATION_NEEDED);
        applicationDAO.update(application);

        assertEquals(403, statusOf(() -> service.resubmitApplication(other.getId(), application.getId(), applicationDTO())));
    }

    // ________________________________________________________

    @Test
    void resubmitValidatesTheCorrection() {
        DriverApplication application = service.submitApplication(applicant.getId(), applicationDTO());
        application.setStatus(ApplicationStatus.MORE_INFORMATION_NEEDED);
        applicationDAO.update(application);

        DriverApplicationDTO invalid = applicationDTO();
        invalid.setTimesOfDay(Set.of());

        assertEquals(400, statusOf(() -> service.resubmitApplication(applicant.getId(), application.getId(), invalid)));
    }

    // ________________________________________________________

    private DriverApplicationDTO decision(ApplicationStatus status, String adminMessage) {
        return DriverApplicationDTO.builder().status(status).adminMessage(adminMessage).build();
    }

    // ________________________________________________________

    private boolean hasAgent(UUID userId) {
        return new DeliveryAgentDAO(em).existsByUserId(userId);
    }

    // ________________________________________________________

    @Test
    void approveCreatesTheDeliveryAgentAndGivesTheRole() {
        DriverApplication application = service.submitApplication(applicant.getId(), applicationDTO());

        DriverApplication result = service.decideApplication(application.getId(), decision(ApplicationStatus.APPROVED, null));

        assertEquals(ApplicationStatus.APPROVED, result.getStatus());
        assertTrue(hasAgent(applicant.getId()));
        assertTrue(userDAO.getById(applicant.getId()).getRoles().contains(Role.DELIVERY_AGENT));
    }

    // ________________________________________________________

    @Test
    void approveKeepsTheRolesTheApplicantAlreadyHas() {
        DriverApplication application = service.submitApplication(applicant.getId(), applicationDTO());

        service.decideApplication(application.getId(), decision(ApplicationStatus.APPROVED, null));

        assertTrue(userDAO.getById(applicant.getId()).getRoles().contains(Role.CUSTOMER));
    }

    // ________________________________________________________

    @Test
    void approveCopiesThePhoneNumberToTheDeliveryAgent() {
        DriverApplication application = service.submitApplication(applicant.getId(), applicationDTO());

        service.decideApplication(application.getId(), decision(ApplicationStatus.APPROVED, null));

        DeliveryAgent agent = new DeliveryAgentDAO(em).getAllWithUser().stream()
                .filter(candidate -> candidate.getUser().getId().equals(applicant.getId()))
                .findFirst().orElseThrow();
        assertEquals("+4528345678", agent.getPhoneNumber());
        assertTrue(agent.isActive());
    }

    // ________________________________________________________

    @Test
    void approveDoesNotCreateASecondAgentForTheSameUser() {
        DriverApplication first = service.submitApplication(applicant.getId(), applicationDTO());
        service.decideApplication(first.getId(), decision(ApplicationStatus.APPROVED, null));
        DriverApplication second = service.submitApplication(applicant.getId(), applicationDTO());

        DriverApplication result = service.decideApplication(second.getId(), decision(ApplicationStatus.APPROVED, null));

        assertEquals(ApplicationStatus.APPROVED, result.getStatus());
        long agents = new DeliveryAgentDAO(em).getAllWithUser().stream()
                .filter(candidate -> candidate.getUser().getId().equals(applicant.getId()))
                .count();
        assertEquals(1, agents);
    }

    // ________________________________________________________

    @Test
    void rejectKeepsTheReasonAndGivesNoRole() {
        DriverApplication application = service.submitApplication(applicant.getId(), applicationDTO());

        DriverApplication result = service.decideApplication(
                application.getId(), decision(ApplicationStatus.REJECTED, "Vehicle is not allowed"));

        assertEquals(ApplicationStatus.REJECTED, result.getStatus());
        assertEquals("Vehicle is not allowed", result.getAdminMessage());
        assertFalse(hasAgent(applicant.getId()));
        assertFalse(userDAO.getById(applicant.getId()).getRoles().contains(Role.DELIVERY_AGENT));
    }

    // ________________________________________________________

    @Test
    void rejectDoesNotRequireAReason() {
        DriverApplication application = service.submitApplication(applicant.getId(), applicationDTO());

        DriverApplication result = service.decideApplication(application.getId(), decision(ApplicationStatus.REJECTED, null));

        assertEquals(ApplicationStatus.REJECTED, result.getStatus());
    }

    // ________________________________________________________

    @Test
    void requestMoreInformationKeepsTheMessageAndGivesNoRole() {
        DriverApplication application = service.submitApplication(applicant.getId(), applicationDTO());

        DriverApplication result = service.decideApplication(
                application.getId(), decision(ApplicationStatus.MORE_INFORMATION_NEEDED, "Choose a region"));

        assertEquals(ApplicationStatus.MORE_INFORMATION_NEEDED, result.getStatus());
        assertEquals("Choose a region", result.getAdminMessage());
        assertFalse(hasAgent(applicant.getId()));
    }

    // ________________________________________________________

    @Test
    void requestMoreInformationRequiresAMessage() {
        DriverApplication application = service.submitApplication(applicant.getId(), applicationDTO());

        assertEquals(400, statusOf(() -> service.decideApplication(
                application.getId(), decision(ApplicationStatus.MORE_INFORMATION_NEEDED, " "))));
        assertEquals(ApplicationStatus.PENDING, service.getApplication(application.getId()).getStatus());
    }

    // ________________________________________________________

    @Test
    void decideRejectsPendingAndMissingDecisions() {
        DriverApplication application = service.submitApplication(applicant.getId(), applicationDTO());

        assertEquals(400, statusOf(() -> service.decideApplication(
                application.getId(), decision(ApplicationStatus.PENDING, null))));
        assertEquals(400, statusOf(() -> service.decideApplication(application.getId(), decision(null, null))));
    }

    // ________________________________________________________

    @Test
    void decideIsRejectedWhenTheApplicationIsNotPending() {
        DriverApplication application = service.submitApplication(applicant.getId(), applicationDTO());
        service.decideApplication(application.getId(), decision(ApplicationStatus.REJECTED, null));

        assertEquals(400, statusOf(() -> service.decideApplication(
                application.getId(), decision(ApplicationStatus.APPROVED, null))));
        assertFalse(hasAgent(applicant.getId()));
    }

    // ________________________________________________________

    @Test
    void decideFailsForAnUnknownApplication() {
        assertEquals(404, statusOf(() -> service.decideApplication(
                UUID.randomUUID(), decision(ApplicationStatus.APPROVED, null))));
    }

    // ________________________________________________________

    @Test
    void anApplicationThatNeededInformationCanBeDecidedAfterItIsSentAgain() {
        DriverApplication application = service.submitApplication(applicant.getId(), applicationDTO());
        service.decideApplication(application.getId(), decision(ApplicationStatus.MORE_INFORMATION_NEEDED, "Choose a region"));
        service.resubmitApplication(applicant.getId(), application.getId(), applicationDTO());

        DriverApplication result = service.decideApplication(application.getId(), decision(ApplicationStatus.APPROVED, null));

        assertEquals(ApplicationStatus.APPROVED, result.getStatus());
        assertTrue(hasAgent(applicant.getId()));
    }
}
