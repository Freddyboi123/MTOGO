package app.services;

import app.entities.RestaurantApplication;
import app.entities.User;
import app.enums.Notifications;
import app.exceptions.ApiException;
import app.utils.ErrorHandler;
import app.utils.Utils;
import jakarta.mail.Authenticator;
import jakarta.mail.Message;
import jakarta.mail.PasswordAuthentication;
import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Properties;
import java.util.function.UnaryOperator;

public class MailService {

    public static final String MAIL_DISABLED_PROPERTY = "mail.disabled";
    private static final String CONFIG = "config.properties";
    private static final String DEFAULT_COMPANY_NAME = "MTOGO";
    private static final String DEV_FRONTEND_URL = "http://localhost:5173";
    private static final Logger logger = LoggerFactory.getLogger(MailService.class);

    // Looks up a config key and returns null when it is missing. Tests pass their own lookup.
    private final UnaryOperator<String> config;

    public MailService() {
        this(MailService::readConfig);
    }

    MailService(UnaryOperator<String> config) {
        this.config = config;
    }

    private static String readConfig(String key) {
        try {
            return Utils.getPropertyValue(key, CONFIG);
        } catch (ApiException e) {
            return null;
        }
    }

    // ________________________________________________________

    public MailResult sendVerifyEmail(User user) {
        String companyName = getCompanyName();
        String link = getBackendUrl() + "/api/users/auth/verify?token=" + user.getVerifyToken();

        String subject = String.format("%s: Godkend bruger", companyName);
        String body = String.format("""
            Hej %s %s,

            Velkommen til %s!
            For at færdiggøre din registrering skal du godkende din bruger ved at trykke på linket herunder.

            Linket udløber automatisk om 30 minutter:
            %s

            Venlig hilsen
            %s
            """,
            user.getFirstname(),
            user.getLastname(),
            companyName,
            link,
            companyName
        );

        return send(user.getEmail(), subject, body);
    }

    // ________________________________________________________

    public void sendResetPasswordEmail(User user) {
        String companyName = getCompanyName();
        String link = getFrontendUrl() + "/reset-password?token=" + user.getResetToken();

        String subject = String.format("%s: Nulstil adgangskode", companyName);
        String body = String.format("""
            Hej %s %s,

            Vi har modtaget en anmodning om at nulstille din adgangskode.
            Tryk på linket herunder for at vælge en ny adgangskode.

            Linket udløber automatisk om 30 minutter:
            %s

            Hvis det ikke var dig, kan du bare ignorere denne mail.

            Venlig hilsen
            %s
            """,
            user.getFirstname(),
            user.getLastname(),
            link,
            companyName
        );

        send(user.getEmail(), subject, body);
    }

    // ________________________________________________________

    public MailResult sendApplicationStatusEmail(RestaurantApplication application) {

        String companyName = getCompanyName();
        User applicant = application.getApplicant();
        String adminMessage = application.getAdminMessage();
        String statusText;
        String details = "";

        switch (application.getStatus()) {
            case APPROVED -> statusText = "godkendt. Din restaurant er nu oprettet, og du kan begynde at oprette din menu.";
            case REJECTED -> {
                statusText = "afvist.";

                if (adminMessage != null && !adminMessage.isBlank()) {
                    details = "\nBegrundelse:\n" + adminMessage + "\n";
                }

            }
            case MORE_INFORMATION_NEEDED -> {

                statusText = "sat på pause, fordi vi mangler yderligere oplysninger.";

                details = String.format("""
                \nVi har brug for følgende: %s 
                \n\nLog ind, ret din ansøgning og send den ind igen."""
                , adminMessage);

            }
            default -> {
                return new MailResult(false, "No mail for status " + application.getStatus());
            }
        }

        String subject = String.format("%s: Din ansøgning er ændret", companyName);
        String body = String.format("""
            Hej %s %s,

            Din ansøgning for %s er blevet %s
            %s
            Venlig hilsen
            %s
            """,
            applicant.getFirstname(),
            applicant.getLastname(),
            application.getRestaurantName(),
            statusText,
            details,
            companyName
        );

        return send(applicant.getEmail(), subject, body);
    }

    // ________________________________________________________

    private String getBackendUrl() {
        if (isDeployed()) {
            return getRequired("BACKEND_URL").replaceAll("/+$", "");
        }
        return "http://localhost:" + getOptional("PORT", "6969");
    }

    // ________________________________________________________

    // Deployed environments must set FRONTEND_URL. Locally it falls back to the Vite dev server.
    private String getFrontendUrl() {
        String url = isDeployed()
                ? getRequired("FRONTEND_URL")
                : getOptional("FRONTEND_URL", DEV_FRONTEND_URL);
        return url.replaceAll("/+$", "");
    }

    // ________________________________________________________

    private boolean isDeployed() {
        return Boolean.parseBoolean(getOptional("DEPLOYED", "false"));
    }

    // ________________________________________________________

    // Reads a key from env/config and returns the fallback when it is missing or blank.
    private String getOptional(String key, String fallback) {
        String value = config.apply(key);
        return value == null || value.isBlank() ? fallback : value.trim();
    }

    // ________________________________________________________

    private String getRequired(String key) {
        String value = config.apply(key);
        if (value == null || value.isBlank()) {
            throw new ApiException(500, String.format("Property %s not found in %s", key, CONFIG));
        }
        return value.trim();
    }

    // ________________________________________________________

    public MailResult send(String to, String subject, String body) {
        if (ErrorHandler.tryParseBoolean(System.getProperty(MAIL_DISABLED_PROPERTY), Notifications.MAIL_SENDER_BOOLEAN_FAILED.getDisplayName())) {
            logger.info("Mail disabled, skipping email to {}", to);
            return new MailResult(true, "Mail skipped");
        }

        String username = getOptional("SMTP_USERNAME", "");
        String password = getOptional("SMTP_PASSWORD", "").replace(" ", "");

        if (username.isBlank() || password.isBlank()) {
            logger.error("SMTP_USERNAME/SMTP_PASSWORD not set, cannot send email to {}", to);
            return new MailResult(false, "Could not send email. SMTP_USERNAME and SMTP_PASSWORD must be set in config.properties or as environment variables.");
        }

        // Defaults match Gmail, so a dev only needs the username and app password.
        String host = getOptional("SMTP_HOST", "smtp.gmail.com");
        String port = getOptional("SMTP_PORT", "587");
        String auth = getOptional("SMTP_AUTH", "true");
        String starttls = getOptional("SMTP_STARTTLS", "true");
        String timeout = getOptional("SMTP_TIMEOUT", "10000");
        String companyName = getCompanyName();
        // SMTP_FROM is optional: relay providers use a login that is not the sender address.
        String from = getOptional("SMTP_FROM", username);

        Properties props = new Properties();
        props.put("mail.smtp.auth", auth);
        props.put("mail.smtp.starttls.enable", starttls);
        props.put("mail.smtp.starttls.required", starttls);
        props.put("mail.smtp.host", host);
        props.put("mail.smtp.port", port);
        props.put("mail.smtp.ssl.trust", host);
        props.put("mail.smtp.connectiontimeout", timeout);
        props.put("mail.smtp.timeout", timeout);
        props.put("mail.smtp.writetimeout", timeout);

        Session session = Session.getInstance(props, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(username, password);
            }
        });

        try {
            MimeMessage message = new MimeMessage(session);
            message.setFrom(new InternetAddress(from, companyName, "UTF-8"));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(to));
            message.setSubject(subject, "UTF-8");
            message.setText(body, "UTF-8");
            Transport.send(message);
            logger.info("Email sent to {}", to);
            return new MailResult(true, "Mail sent");
        } catch (Exception e) {
            logger.error("Could not send email to {}", to, e);
            return new MailResult(false, "Could not send email. Check the SMTP settings in config (SMTP_PASSWORD must be a Gmail app password).");
        }
    }

    // ________________________________________________________

    private String getCompanyName() {
        return getOptional("COMPANY_NAME", DEFAULT_COMPANY_NAME);
    }

    // ________________________________________________________

    public record MailResult(boolean sent, String message) {}
}
