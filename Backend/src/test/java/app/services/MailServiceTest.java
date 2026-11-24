package app.services;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

class MailServiceTest {

    @AfterEach
    void restoreProperty() {
        System.clearProperty(MailService.MAIL_DISABLED_PROPERTY);
    }

    // ________________________________________________________

    @Test
    void sendSkipsDeliveryWhenMailIsDisabled() {
        System.setProperty(MailService.MAIL_DISABLED_PROPERTY, "true");

        MailService.MailResult result = new MailService().send("someone@example.com", "Subject", "Body");

        assertTrue(result.sent());
    }
}
