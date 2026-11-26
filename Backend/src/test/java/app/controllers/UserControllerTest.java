package app.controllers;

import app.configs.TestHibernateConfig;
import app.daos.UserDAO;
import app.entities.User;
import app.server.Setup;
import app.services.MailService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class UserControllerTest {

    private static final HttpClient CLIENT = HttpClient.newHttpClient();
    private static final ObjectMapper JSON = new ObjectMapper();
    private static final String PASSWORD = "Password123!";
    private static final String[] TOKEN_SETTINGS = {"ISSUER", "TOKEN_EXPIRE_TIME", "SECRET_KEY"};

    private static EntityManagerFactory emf;
    private static Setup setup;
    private static String baseUrl;

    // ________________________________________________________

    @BeforeAll
    static void startServer() {
        System.setProperty(MailService.MAIL_DISABLED_PROPERTY, "true");
        System.setProperty("ISSUER", "MTOGO");
        System.setProperty("TOKEN_EXPIRE_TIME", "3600000");
        System.setProperty("SECRET_KEY", "test-secret-key-that-is-only-used-in-the-tests");
        emf = TestHibernateConfig.getTestEmf();
        setup = new Setup(emf.createEntityManager(), 0);
        setup.initialize();
        baseUrl = "http://localhost:" + setup.getApp().port() + "/api";
    }

    // ________________________________________________________

    @AfterAll
    static void stopServer() {
        setup.endSession();
        emf.close();
        System.clearProperty(MailService.MAIL_DISABLED_PROPERTY);
        for (String setting : TOKEN_SETTINGS) {
            System.clearProperty(setting);
        }
    }

    // ________________________________________________________

    private static HttpResponse<String> post(String path, Map<String, String> body) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder(URI.create(baseUrl + path))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(JSON.writeValueAsString(body)))
                .build();
        return CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
    }

    // ________________________________________________________

    private static HttpResponse<String> get(String path) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder(URI.create(baseUrl + path)).GET().build();
        return CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
    }

    // ________________________________________________________

    private static String newEmail() {
        return UUID.randomUUID() + "@test.dk";
    }

    // ________________________________________________________

    private static HttpResponse<String> register(String email, String password) throws IOException, InterruptedException {
        return post("/users/auth/register", Map.of(
                "first_name", "Test",
                "last_name", "User",
                "email", email,
                "password", password,
                "repeat_password", password
        ));
    }

    // ________________________________________________________

    private static HttpResponse<String> login(String email, String password) throws IOException, InterruptedException {
        return post("/users/auth/login", Map.of("email", email, "password", password));
    }

    // ________________________________________________________

    private static User findUser(String email) {
        EntityManager em = emf.createEntityManager();
        try {
            return new UserDAO(em).getByEmail(email);
        } finally {
            em.close();
        }
    }

    // ________________________________________________________

    private static void registerVerified(String email) throws IOException, InterruptedException {
        register(email, PASSWORD);
        get("/users/auth/verify?token=" + findUser(email).getVerifyToken());
    }

    // ________________________________________________________

    @Test
    void registerCreatesAnUnverifiedUserWithAHashedPassword() throws Exception {
        String email = newEmail();

        HttpResponse<String> response = register(email, PASSWORD);

        assertEquals(201, response.statusCode());
        User user = findUser(email);
        assertNotNull(user);
        assertFalse(user.isVerified());
        assertNotEquals(PASSWORD, user.getPassword());
    }

    // ________________________________________________________

    @Test
    void registerWithAnEmailThatExistsReturns400() throws Exception {
        String email = newEmail();
        register(email, PASSWORD);

        assertEquals(400, register(email, PASSWORD).statusCode());
    }

    // ________________________________________________________

    @Test
    void registerWithPasswordsThatDoNotMatchReturns400() throws Exception {
        HttpResponse<String> response = post("/users/auth/register", Map.of(
                "first_name", "Test",
                "last_name", "User",
                "email", newEmail(),
                "password", PASSWORD,
                "repeat_password", "Password123?"
        ));

        assertEquals(400, response.statusCode());
    }

    // ________________________________________________________

    @Test
    void registerWithAWeakPasswordReturns400() throws Exception {
        String email = newEmail();

        assertEquals(400, register(email, "abc").statusCode());
        assertNull(findUser(email));
    }

    // ________________________________________________________

    @Test
    void loginBeforeVerifyingReturns403() throws Exception {
        String email = newEmail();
        register(email, PASSWORD);

        assertEquals(403, login(email, PASSWORD).statusCode());
    }

    // ________________________________________________________

    @Test
    void loginAfterVerifyingReturnsAToken() throws Exception {
        String email = newEmail();
        registerVerified(email);

        HttpResponse<String> response = login(email, PASSWORD);

        assertEquals(200, response.statusCode());
        assertFalse(JSON.readTree(response.body()).get("token").asText().isBlank());
    }

    // ________________________________________________________

    @Test
    void loginWithAWrongPasswordReturns401() throws Exception {
        String email = newEmail();
        registerVerified(email);

        assertEquals(401, login(email, "Wrong123!").statusCode());
    }

    // ________________________________________________________

    @Test
    void verifyWithAnUnknownTokenReturns404() throws Exception {
        assertEquals(404, get("/users/auth/verify?token=" + UUID.randomUUID()).statusCode());
    }

    // ________________________________________________________

    @Test
    void forgotPasswordForAnUnknownEmailStillReturns200() throws Exception {
        assertEquals(200, post("/users/auth/forgot-password", Map.of("email", newEmail())).statusCode());
    }

    // ________________________________________________________

    @Test
    void resetPasswordWithTheTokenFromTheMailChangesThePassword() throws Exception {
        String email = newEmail();
        registerVerified(email);
        post("/users/auth/forgot-password", Map.of("email", email));
        String token = findUser(email).getResetToken();

        HttpResponse<String> response = post("/users/auth/reset-password", Map.of(
                "token", token,
                "password", "NewPassword1!",
                "repeat_password", "NewPassword1!"
        ));

        assertEquals(200, response.statusCode());
        assertEquals(200, login(email, "NewPassword1!").statusCode());
        assertEquals(401, login(email, PASSWORD).statusCode());
    }

    // ________________________________________________________

    @Test
    void resetPasswordWithAnUnknownTokenReturns400() throws Exception {
        HttpResponse<String> response = post("/users/auth/reset-password", Map.of(
                "token", UUID.randomUUID().toString(),
                "password", "NewPassword1!",
                "repeat_password", "NewPassword1!"
        ));

        assertEquals(400, response.statusCode());
    }

    // ________________________________________________________

    @Test
    void resetPasswordWithAWeakPasswordReturns400() throws Exception {
        String email = newEmail();
        registerVerified(email);
        post("/users/auth/forgot-password", Map.of("email", email));
        String token = findUser(email).getResetToken();

        HttpResponse<String> response = post("/users/auth/reset-password", Map.of(
                "token", token,
                "password", "abc",
                "repeat_password", "abc"
        ));

        assertEquals(400, response.statusCode());
    }

    // ________________________________________________________

    private static HttpResponse<String> patchProfile(String token, Map<String, String> body) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder(URI.create(baseUrl + "/users/profile"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + token)
                .method("PATCH", HttpRequest.BodyPublishers.ofString(JSON.writeValueAsString(body)))
                .build();
        return CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
    }

    // ________________________________________________________

    private static String loginToken(String email, String password) throws IOException, InterruptedException {
        return JSON.readTree(login(email, password).body()).get("token").asText();
    }

    // ________________________________________________________

    @Test
    void patchProfileWithoutATokenReturns401() throws Exception {
        HttpRequest request = HttpRequest.newBuilder(URI.create(baseUrl + "/users/profile"))
                .header("Content-Type", "application/json")
                .method("PATCH", HttpRequest.BodyPublishers.ofString("{}"))
                .build();

        assertEquals(401, CLIENT.send(request, HttpResponse.BodyHandlers.ofString()).statusCode());
    }

    // ________________________________________________________

    @Test
    void patchProfileUpdatesOnlyTheFieldsThatChanged() throws Exception {
        String email = newEmail();
        registerVerified(email);
        String token = loginToken(email, PASSWORD);

        HttpResponse<String> response = patchProfile(token, Map.of(
                "first_name", "Test",
                "last_name", "Newname",
                "phone_number", "12345678"
        ));

        assertEquals(200, response.statusCode());
        User user = findUser(email);
        assertEquals("Test", user.getFirstname());
        assertEquals("Newname", user.getLastname());
        assertEquals("12345678", user.getPhoneNumber());
    }

    // ________________________________________________________

    @Test
    void patchProfileWithTheSameValuesReportsNoChanges() throws Exception {
        String email = newEmail();
        registerVerified(email);
        String token = loginToken(email, PASSWORD);

        HttpResponse<String> response = patchProfile(token, Map.of("first_name", "Test", "email", email));

        assertEquals(200, response.statusCode());
        assertEquals("There was nothing to update", JSON.readTree(response.body()).get("message").asText());
    }

    // ________________________________________________________

    @Test
    void patchProfileWithAnEmptyPhoneNumberRemovesIt() throws Exception {
        String email = newEmail();
        registerVerified(email);
        String token = loginToken(email, PASSWORD);
        patchProfile(token, Map.of("phone_number", "12345678"));

        HttpResponse<String> response = patchProfile(token, Map.of("phone_number", ""));

        assertEquals(200, response.statusCode());
        assertNull(findUser(email).getPhoneNumber());
    }

    // ________________________________________________________

    @Test
    void patchProfileWithAnInvalidPhoneNumberReturns400() throws Exception {
        String email = newEmail();
        registerVerified(email);

        assertEquals(400, patchProfile(loginToken(email, PASSWORD), Map.of("phone_number", "abc")).statusCode());
    }

    // ________________________________________________________

    @Test
    void patchProfileWithAnEmailInUseReturns400() throws Exception {
        String email = newEmail();
        String other = newEmail();
        registerVerified(email);
        register(other, PASSWORD);

        assertEquals(400, patchProfile(loginToken(email, PASSWORD), Map.of("email", other)).statusCode());
        assertNotNull(findUser(email));
    }

    // ________________________________________________________

    @Test
    void patchProfileWithANewEmailReturnsATokenThatStillWorks() throws Exception {
        String email = newEmail();
        String newEmail = newEmail();
        registerVerified(email);

        HttpResponse<String> response = patchProfile(loginToken(email, PASSWORD), Map.of("email", newEmail));

        assertEquals(200, response.statusCode());
        String newToken = JSON.readTree(response.body()).get("token").asText();
        assertEquals(200, patchProfile(newToken, Map.of("first_name", "Test")).statusCode());
        assertNotNull(findUser(newEmail));
    }

    // ________________________________________________________

    @Test
    void patchProfileChangesThePasswordWhenTheCurrentOneIsCorrect() throws Exception {
        String email = newEmail();
        registerVerified(email);

        HttpResponse<String> response = patchProfile(loginToken(email, PASSWORD), Map.of(
                "current_password", PASSWORD,
                "new_password", "NewPassword1!",
                "repeat_password", "NewPassword1!"
        ));

        assertEquals(200, response.statusCode());
        assertEquals(401, login(email, PASSWORD).statusCode());
        assertEquals(200, login(email, "NewPassword1!").statusCode());
    }

    // ________________________________________________________

    @Test
    void patchProfileWithAWrongCurrentPasswordReturns400() throws Exception {
        String email = newEmail();
        registerVerified(email);

        HttpResponse<String> response = patchProfile(loginToken(email, PASSWORD), Map.of(
                "current_password", "Wrong123!",
                "new_password", "NewPassword1!",
                "repeat_password", "NewPassword1!"
        ));

        assertEquals(400, response.statusCode());
        assertEquals(200, login(email, PASSWORD).statusCode());
    }

    // ________________________________________________________

    @Test
    void patchProfileWithAWeakNewPasswordReturns400() throws Exception {
        String email = newEmail();
        registerVerified(email);

        HttpResponse<String> response = patchProfile(loginToken(email, PASSWORD), Map.of(
                "current_password", PASSWORD,
                "new_password", "abc",
                "repeat_password", "abc"
        ));

        assertEquals(400, response.statusCode());
    }

    // ________________________________________________________

    @Test
    void patchProfileSavesTheDeliveryAddress() throws Exception {
        String email = newEmail();
        registerVerified(email);

        HttpResponse<String> response = patchProfile(loginToken(email, PASSWORD), Map.of(
                "street", "Bytoften 1",
                "postal_code", "2650",
                "city", "Hvidovre",
                "floor_door", "2. th"
        ));

        assertEquals(200, response.statusCode());
        User user = findUser(email);
        assertEquals("Bytoften 1", user.getStreet());
        assertEquals("2650", user.getPostalCode());
        assertEquals("Hvidovre", user.getCity());
        assertEquals("2. th", user.getFloorDoor());
        assertEquals("Bytoften 1", JSON.readTree(response.body()).get("data").get("street").asText());
    }

    // ________________________________________________________

    @Test
    void getProfileReturnsTheSavedDeliveryAddress() throws Exception {
        String email = newEmail();
        registerVerified(email);
        String token = loginToken(email, PASSWORD);
        patchProfile(token, Map.of("street", "Bytoften 1", "postal_code", "2650", "city", "Hvidovre"));

        HttpRequest request = HttpRequest.newBuilder(URI.create(baseUrl + "/users/profile"))
                .header("Authorization", "Bearer " + token)
                .GET()
                .build();
        HttpResponse<String> response = CLIENT.send(request, HttpResponse.BodyHandlers.ofString());

        assertEquals(200, response.statusCode());
        assertEquals("Hvidovre", JSON.readTree(response.body()).get("data").get("city").asText());
    }

    // ________________________________________________________

    @Test
    void patchProfileWithAnIncompleteAddressReturns400() throws Exception {
        String email = newEmail();
        registerVerified(email);

        HttpResponse<String> response = patchProfile(loginToken(email, PASSWORD), Map.of("street", "Bytoften 1"));

        assertEquals(400, response.statusCode());
        assertNull(findUser(email).getStreet());
    }

    // ________________________________________________________

    @Test
    void patchProfileWithAnInvalidPostcodeReturns400() throws Exception {
        String email = newEmail();
        registerVerified(email);

        HttpResponse<String> response = patchProfile(loginToken(email, PASSWORD), Map.of(
                "street", "Bytoften 1",
                "postal_code", "12",
                "city", "Hvidovre"
        ));

        assertEquals(400, response.statusCode());
    }

    // ________________________________________________________

    @Test
    void patchProfileCanChangeTheFloorAndDoorWithoutTouchingTheAddress() throws Exception {
        String email = newEmail();
        registerVerified(email);
        String token = loginToken(email, PASSWORD);
        patchProfile(token, Map.of("street", "Bytoften 1", "postal_code", "2650", "city", "Hvidovre"));

        HttpResponse<String> response = patchProfile(token, Map.of("floor_door", "st. tv"));

        assertEquals(200, response.statusCode());
        User user = findUser(email);
        assertEquals("st. tv", user.getFloorDoor());
        assertEquals("Bytoften 1", user.getStreet());
    }

    // ________________________________________________________

    @Test
    void patchProfileWithAnEmptyAddressRemovesIt() throws Exception {
        String email = newEmail();
        registerVerified(email);
        String token = loginToken(email, PASSWORD);
        patchProfile(token, Map.of("street", "Bytoften 1", "postal_code", "2650", "city", "Hvidovre", "floor_door", "2. th"));

        HttpResponse<String> response = patchProfile(token, Map.of("street", "", "postal_code", "", "city", ""));

        assertEquals(200, response.statusCode());
        User user = findUser(email);
        assertNull(user.getStreet());
        assertNull(user.getPostalCode());
        assertNull(user.getCity());
        assertNull(user.getFloorDoor());
    }

    // ________________________________________________________

    @Test
    void loginIgnoresTheLetterCaseOfTheEmail() throws Exception {
        String email = newEmail();
        registerVerified(email);

        assertEquals(200, login(email.toUpperCase(), PASSWORD).statusCode());
    }

    // ________________________________________________________

    @Test
    void loginStillRequiresTheExactCaseOfThePassword() throws Exception {
        String email = newEmail();
        registerVerified(email);

        assertEquals(401, login(email, PASSWORD.toUpperCase()).statusCode());
    }

    // ________________________________________________________

    @Test
    void registerWithTheSameEmailInAnotherCaseReturns400() throws Exception {
        String email = newEmail();
        register(email, PASSWORD);

        assertEquals(400, register(email.toUpperCase(), PASSWORD).statusCode());
    }
}
