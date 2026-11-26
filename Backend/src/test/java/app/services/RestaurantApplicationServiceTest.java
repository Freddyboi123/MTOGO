package app.services;

import app.configs.TestHibernateConfig;
import app.daos.RestaurantApplicationDAO;
import app.daos.RestaurantDAO;
import app.daos.UserDAO;
import app.dtos.RestaurantApplicationDTO;
import app.entities.RestaurantApplication;
import app.entities.User;
import app.enums.ApplicationStatus;
import app.enums.Role;
import app.exceptions.ApiException;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class RestaurantApplicationServiceTest {

    private static EntityManagerFactory emf;
    private static EntityManager em;

    private UserDAO userDAO;
    private RestaurantDAO restaurantDAO;
    private RestaurantApplicationService service;
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
        restaurantDAO = new RestaurantDAO(em);
        service = new RestaurantApplicationService(new RestaurantApplicationDAO(em), restaurantDAO, userDAO);
        applicant = createUser();
    }

    // ________________________________________________________

    private User createUser() {
        return userDAO.create(User.builder()
                .email(UUID.randomUUID() + "@test.dk")
                .roles(Set.of(Role.CUSTOMER))
                .build());
    }

    // ________________________________________________________

    private RestaurantApplicationDTO applicationDTO() {
        return RestaurantApplicationDTO.builder()
                .restaurantName("Testeria " + UUID.randomUUID())
                .cvr("12345678")
                .street("Testvej 1")
                .postalCode("2800")
                .city("Kongens Lyngby")
                .email("kontakt@testeria.dk")
                .phoneNumber("12345678")
                .description("Pizza og pasta")
                .build();
    }

    // ________________________________________________________

    private RestaurantApplicationDTO decision(ApplicationStatus status, String message) {
        return RestaurantApplicationDTO.builder()
                .status(status)
                .adminMessage(message)
                .build();
    }

    // ________________________________________________________

    @Test
    void submittedApplicationIsPending() {
        RestaurantApplication application = service.submitApplication(applicant.getId(), applicationDTO());

        assertEquals(ApplicationStatus.PENDING, application.getStatus());
        assertEquals(applicant.getId(), application.getApplicant().getId());
    }

    // ________________________________________________________

    @Test
    void applicationWithAnInvalidCvrIsRejected() {
        RestaurantApplicationDTO dto = applicationDTO();
        dto.setCvr("1234");

        ApiException exception = assertThrows(ApiException.class, () -> service.submitApplication(applicant.getId(), dto));

        assertEquals(400, exception.getStatus());
    }

    // ________________________________________________________

    @Test
    void applicationWithAnInvalidEmailIsRejected() {
        RestaurantApplicationDTO dto = applicationDTO();
        dto.setEmail("kontakt");

        ApiException exception = assertThrows(ApiException.class, () -> service.submitApplication(applicant.getId(), dto));

        assertEquals(400, exception.getStatus());
    }

    // ________________________________________________________

    @Test
    void applicationWithAnInvalidPhoneNumberIsRejected() {
        RestaurantApplicationDTO dto = applicationDTO();
        dto.setPhoneNumber("12");

        ApiException exception = assertThrows(ApiException.class, () -> service.submitApplication(applicant.getId(), dto));

        assertEquals(400, exception.getStatus());
    }

    // ________________________________________________________

    @Test
    void approvingCreatesTheRestaurantAndMakesTheApplicantAnOwner() {
        RestaurantApplicationDTO dto = applicationDTO();
        RestaurantApplication application = service.submitApplication(applicant.getId(), dto);

        RestaurantApplication approved = service.decideApplication(application.getId(), decision(ApplicationStatus.APPROVED, null));

        assertEquals(ApplicationStatus.APPROVED, approved.getStatus());
        assertTrue(restaurantDAO.existsByNameAndCity(dto.getRestaurantName(), dto.getCity()));
        assertTrue(approved.getApplicant().getRoles().contains(Role.RESTAURANT_OWNER));
    }

    // ________________________________________________________

    @Test
    void rejectingKeepsTheMessageAndCreatesNoRestaurant() {
        RestaurantApplicationDTO dto = applicationDTO();
        RestaurantApplication application = service.submitApplication(applicant.getId(), dto);

        RestaurantApplication rejected = service.decideApplication(application.getId(), decision(ApplicationStatus.REJECTED, "Not in our area"));

        assertEquals(ApplicationStatus.REJECTED, rejected.getStatus());
        assertEquals("Not in our area", rejected.getAdminMessage());
        assertFalse(restaurantDAO.existsByNameAndCity(dto.getRestaurantName(), dto.getCity()));
    }

    // ________________________________________________________

    @Test
    void askingForMoreInformationRequiresAMessage() {
        RestaurantApplication application = service.submitApplication(applicant.getId(), applicationDTO());

        ApiException exception = assertThrows(ApiException.class,
                () -> service.decideApplication(application.getId(), decision(ApplicationStatus.MORE_INFORMATION_NEEDED, null)));

        assertEquals(400, exception.getStatus());
        assertEquals(ApplicationStatus.PENDING, application.getStatus());
    }

    // ________________________________________________________

    @Test
    void decidedApplicationCanNotBeDecidedAgain() {
        RestaurantApplication application = service.submitApplication(applicant.getId(), applicationDTO());
        service.decideApplication(application.getId(), decision(ApplicationStatus.REJECTED, null));

        ApiException exception = assertThrows(ApiException.class,
                () -> service.decideApplication(application.getId(), decision(ApplicationStatus.APPROVED, null)));

        assertEquals(400, exception.getStatus());
    }

    // ________________________________________________________

    @Test
    void applicantCanResubmitWhenMoreInformationIsNeeded() {
        RestaurantApplication application = service.submitApplication(applicant.getId(), applicationDTO());
        service.decideApplication(application.getId(), decision(ApplicationStatus.MORE_INFORMATION_NEEDED, "Add a phone number"));
        RestaurantApplicationDTO changes = applicationDTO();

        RestaurantApplication resubmitted = service.resubmitApplication(applicant.getId(), application.getId(), changes);

        assertEquals(ApplicationStatus.PENDING, resubmitted.getStatus());
        assertEquals(changes.getRestaurantName(), resubmitted.getRestaurantName());
    }

    // ________________________________________________________

    @Test
    void otherUserCanNotResubmitTheApplication() {
        RestaurantApplication application = service.submitApplication(applicant.getId(), applicationDTO());
        service.decideApplication(application.getId(), decision(ApplicationStatus.MORE_INFORMATION_NEEDED, "Add a phone number"));
        User other = createUser();

        ApiException exception = assertThrows(ApiException.class,
                () -> service.resubmitApplication(other.getId(), application.getId(), applicationDTO()));

        assertEquals(403, exception.getStatus());
    }

    // ________________________________________________________

    @Test
    void pendingApplicationCanNotBeResubmitted() {
        RestaurantApplication application = service.submitApplication(applicant.getId(), applicationDTO());

        ApiException exception = assertThrows(ApiException.class,
                () -> service.resubmitApplication(applicant.getId(), application.getId(), applicationDTO()));

        assertEquals(400, exception.getStatus());
    }
}
