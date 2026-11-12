package app.services;

import app.entities.User;
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

public class MailService {

    private static final String CONFIG = "config.properties";
    private static final Logger logger = LoggerFactory.getLogger(MailService.class);

    // ________________________________________________________

    public MailResult sendVerifyEmail(User user) {
        String companyName = Utils.getPropertyValue("COMPANY_NAME", CONFIG);
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
        String companyName = Utils.getPropertyValue("COMPANY_NAME", CONFIG);
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

    private String getBackendUrl() {
        boolean deployed = Boolean.parseBoolean(Utils.getPropertyValue("DEPLOYED", CONFIG));

        if (deployed) {
            return Utils.getPropertyValue("BACKEND_URL", CONFIG).replaceAll("/+$", "");
        }
        return "http://localhost:" + Utils.getPropertyValue("PORT", CONFIG);
    }

    // ________________________________________________________

    private String getFrontendUrl() {
        return Utils.getPropertyValue("FRONTEND_URL", CONFIG).replaceAll("/+$", "");
    }

    // ________________________________________________________

    public MailResult send(String to, String subject, String body) {
        String host = Utils.getPropertyValue("SMTP_HOST", CONFIG);
        String port = Utils.getPropertyValue("SMTP_PORT", CONFIG);
        String auth = Utils.getPropertyValue("SMTP_AUTH", CONFIG);
        String starttls = Utils.getPropertyValue("SMTP_STARTTLS", CONFIG);
        String timeout = Utils.getPropertyValue("SMTP_TIMEOUT", CONFIG);
        String username = Utils.getPropertyValue("SMTP_USERNAME", CONFIG);
        String password = Utils.getPropertyValue("SMTP_PASSWORD", CONFIG).replace(" ", "");
        String companyName = Utils.getPropertyValue("COMPANY_NAME", CONFIG);

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
            message.setFrom(new InternetAddress(username, companyName, "UTF-8"));
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

    public record MailResult(boolean sent, String message) {}
}
