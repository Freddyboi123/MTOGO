package app.services;

import app.entities.RestaurantApplication;
import app.entities.User;
import app.enums.ApplicationStatus;
import com.icegreen.greenmail.util.GreenMail;
import com.icegreen.greenmail.util.ServerSetupTest;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class MailServiceTest {

    private static final String LOGIN = "login@relay.test";
    private static final String PASSWORD = "secret";
    private static final String RECIPIENT = "customer@example.com";

    private GreenMail greenMail;
    private Map<String, String> config;

    @BeforeEach
    void setUp() {
        System.clearProperty(MailService.MAIL_DISABLED_PROPERTY);

        greenMail = new GreenMail(ServerSetupTest.SMTP.dynamicPort());
        greenMail.start();
        greenMail.setUser(LOGIN, LOGIN, PASSWORD);

        // Points MailService at the in-memory server. No STARTTLS, since GreenMail runs plain SMTP.
        config = new HashMap<>();
        config.put("DEPLOYED", "false");
        config.put("SMTP_HOST", "localhost");
        config.put("SMTP_PORT", String.valueOf(greenMail.getSmtp().getPort()));
        config.put("SMTP_STARTTLS", "false");
        config.put("SMTP_TIMEOUT", "5000");
        config.put("SMTP_USERNAME", LOGIN);
        config.put("SMTP_PASSWORD", PASSWORD);
    }

    @AfterEach
    void tearDown() {
        greenMail.stop();
        System.clearProperty(MailService.MAIL_DISABLED_PROPERTY);
    }

    private MailService mailService() {
        return new MailService(config::get);
    }

    private MimeMessage onlyReceivedMessage() {
        MimeMessage[] messages = greenMail.getReceivedMessages();
        assertEquals(1, messages.length);
        return messages[0];
    }

    private User user() {
        return User.builder()
                .firstname("Anna")
                .lastname("Jensen")
                .email(RECIPIENT)
                .verifyToken("verify-token-123")
                .resetToken("reset-token-456")
                .build();
    }

    // ________________________________________________________

    @Test
    void sendSkipsDeliveryWhenMailIsDisabled() {
        System.setProperty(MailService.MAIL_DISABLED_PROPERTY, "true");

        MailService.MailResult result = mailService().send(RECIPIENT, "Subject", "Body");

        assertTrue(result.sent());
        assertEquals(0, greenMail.getReceivedMessages().length);
    }

    // ________________________________________________________

    @Test
    void sendDeliversMailThroughSmtp() throws Exception {
        MailService.MailResult result = mailService().send(RECIPIENT, "Hello", "Body text");

        assertTrue(result.sent());
        MimeMessage message = onlyReceivedMessage();
        assertEquals(RECIPIENT, message.getAllRecipients()[0].toString());
        assertEquals("Hello", message.getSubject());
        assertTrue(message.getContent().toString().contains("Body text"));
    }

    // ________________________________________________________

    @Test
    void sendUsesSmtpFromAsSenderWhenSet() throws Exception {
        config.put("SMTP_FROM", "noreply@mtogo.test");

        mailService().send(RECIPIENT, "Subject", "Body");

        InternetAddress from = (InternetAddress) onlyReceivedMessage().getFrom()[0];
        assertEquals("noreply@mtogo.test", from.getAddress());
    }

    // ________________________________________________________

    @Test
    void sendFallsBackToUsernameAsSenderWithoutSmtpFrom() throws Exception {
        mailService().send(RECIPIENT, "Subject", "Body");

        InternetAddress from = (InternetAddress) onlyReceivedMessage().getFrom()[0];
        assertEquals(LOGIN, from.getAddress());
    }

    // ________________________________________________________

    @Test
    void sendUsesDefaultCompanyNameAsSenderName() throws Exception {
        mailService().send(RECIPIENT, "Subject", "Body");

        InternetAddress from = (InternetAddress) onlyReceivedMessage().getFrom()[0];
        assertEquals("MTOGO", from.getPersonal());
    }

    // ________________________________________________________

    @Test
    void sendFailsWithoutCredentials() {
        config.remove("SMTP_USERNAME");
        config.remove("SMTP_PASSWORD");

        MailService.MailResult result = mailService().send(RECIPIENT, "Subject", "Body");

        assertFalse(result.sent());
        assertTrue(result.message().contains("SMTP_USERNAME"));
        assertEquals(0, greenMail.getReceivedMessages().length);
    }

    // ________________________________________________________

    @Test
    void sendFailsWhenSmtpServerIsUnreachable() {
        greenMail.stop();

        MailService.MailResult result = mailService().send(RECIPIENT, "Subject", "Body");

        assertFalse(result.sent());
    }

    // ________________________________________________________

    @Test
    void verifyEmailLinksToLocalBackendWhenNotDeployed() throws Exception {
        config.put("PORT", "6969");

        MailService.MailResult result = mailService().sendVerifyEmail(user());

        assertTrue(result.sent());
        MimeMessage message = onlyReceivedMessage();
        assertEquals("MTOGO: Godkend bruger", message.getSubject());
        assertTrue(message.getContent().toString()
                .contains("http://localhost:6969/api/users/auth/verify?token=verify-token-123"));
    }

    // ________________________________________________________

    @Test
    void verifyEmailLinksToBackendUrlWhenDeployed() throws Exception {
        config.put("DEPLOYED", "true");
        config.put("BACKEND_URL", "https://api.mtogo.test/");
        config.put("COMPANY_NAME", "TestCo");

        mailService().sendVerifyEmail(user());

        MimeMessage message = onlyReceivedMessage();
        assertEquals("TestCo: Godkend bruger", message.getSubject());
        assertTrue(message.getContent().toString()
                .contains("https://api.mtogo.test/api/users/auth/verify?token=verify-token-123"));
    }

    // ________________________________________________________

    @Test
    void resetPasswordEmailFallsBackToLocalFrontendWhenNotDeployed() throws Exception {
        mailService().sendResetPasswordEmail(user());

        assertTrue(onlyReceivedMessage().getContent().toString()
                .contains("http://localhost:5173/reset-password?token=reset-token-456"));
    }

    // ________________________________________________________

    @Test
    void applicationStatusEmailIncludesRejectionReason() throws Exception {
        RestaurantApplication application = RestaurantApplication.builder()
                .restaurantName("Test Pizzeria")
                .status(ApplicationStatus.REJECTED)
                .adminMessage("CVR number is invalid")
                .applicant(user())
                .build();

        MailService.MailResult result = mailService().sendApplicationStatusEmail(application);

        assertTrue(result.sent());
        String body = onlyReceivedMessage().getContent().toString();
        assertTrue(body.contains("Test Pizzeria"));
        assertTrue(body.contains("CVR number is invalid"));
    }

    // ________________________________________________________

    @Test
    void applicationStatusEmailIsNotSentForPendingStatus() {
        RestaurantApplication application = RestaurantApplication.builder()
                .restaurantName("Test Pizzeria")
                .status(ApplicationStatus.PENDING)
                .applicant(user())
                .build();

        MailService.MailResult result = mailService().sendApplicationStatusEmail(application);

        assertFalse(result.sent());
        assertEquals(0, greenMail.getReceivedMessages().length);
    }
}
