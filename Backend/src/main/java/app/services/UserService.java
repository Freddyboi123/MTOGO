package app.services;

import app.daos.UserDAO;
import app.dtos.UserDTO;
import app.entities.User;
import app.enums.Notifications;
import app.enums.Role;
import app.exceptions.ApiException;
import app.mappers.UserMapper;
import app.security.SecurityService;
import app.server.Setup;
import app.utils.ErrorHandler;
import io.javalin.http.Context;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

public class UserService {

    private final UserDAO userDAO;
    private final MessageService messageService = new MessageService();
    private final SecurityService securityService = new SecurityService();
    private final UserMapper userMapper = new UserMapper();
    private final MailService mailService = new MailService();
    private static final int TOKEN_MINUTES = 30;

    // ________________________________________________________

    public UserService() {
        this(new UserDAO(Setup.em));
    }

    // ________________________________________________________

    public UserService(UserDAO userDAO) {
        this.userDAO = userDAO;
    }

    // ________________________________________________________

    public void register(Context ctx) {

        Map<String, String> body = ErrorHandler.tryBodyMap(ctx, Notifications.BODY_EMPTY.getDisplayName());

        String firstname = ErrorHandler.tryString(body.get("first_name"), Notifications.REGISTER_NO_FIRSTNAME.getDisplayName());
        String lastname = ErrorHandler.tryString(body.get("last_name"), Notifications.REGISTER_NO_LASTNAME.getDisplayName());
        String email = ErrorHandler.tryString(body.get("email"), Notifications.REGISTER_NO_EMAIL.getDisplayName());
        String password = ErrorHandler.tryString(body.get("password"), Notifications.REGISTER_NO_PASSWORD.getDisplayName());
        String password_repeat = ErrorHandler.tryString(body.get("repeat_password"), Notifications.REGISTER_NO_PASSWORD_REPEAT.getDisplayName());

        if(!password.equals(password_repeat)){
            ctx.status(400).json(Notifications.REGISTER_PASSWORD_MISMATCH.getDisplayName());
            return;
        }

        Role role = Role.USER;

        if (userDAO.existByColumn(email, "email")) {
            String message = messageService.buildMessage(Notifications.EMAIL_EXISTS, email);
            ctx.status(400).json(message);
            return;
        }

        User user = ErrorHandler.tryEntity(
                userDAO.create(User.builder()
                        .firstname(firstname)
                        .lastname(lastname)
                        .roles(Set.of(role))
                        .email(email)
                        .password(PasswordService.hashHelper(password))
                        .verifyToken(UUID.randomUUID().toString())
                        .verifyTokenExpiresAt(LocalDateTime.now().plusMinutes(TOKEN_MINUTES))
                        .build()),
                messageService.buildMessage(Notifications.EMAIL_EXISTS, email)
        );

        UserDTO dto = userMapper.toDTO(user);

        MailService.MailResult mailResult = mailService.sendVerifyEmail(user);

        String message = mailResult.sent()
                ? messageService.buildMessage(Notifications.REGISTER_SUCCESS, user.getEmail())
                : Notifications.MAIL_FAILED.getDisplayName();

        ctx.status(201).json(Map.of(
                "message", message,
                "data", dto
        ));
    }

    // ________________________________________________________

    public void login(Context ctx) {
        Map<String, String> body = ErrorHandler.tryBodyMap(ctx, Notifications.BODY_EMPTY.getDisplayName());

        String email = ErrorHandler.tryString(body.get("email"), Notifications.REGISTER_NO_EMAIL.getDisplayName());
        String password = ErrorHandler.tryString(body.get("password"), Notifications.REGISTER_NO_PASSWORD.getDisplayName());

        User user = userDAO.getByEmail(email);

        if (user == null || !PasswordService.passwordEquals(password, user.getPassword())) {
            throw new ApiException(401, Notifications.LOGIN_INVALID.getDisplayName());
        }

        if (!user.isVerified()) {
            throw new ApiException(403, Notifications.LOGIN_NOT_VERIFIED.getDisplayName());
        }

        UserDTO dto = userMapper.toDTO(user);
        dto.setRoles(user.getRoles());

        String token = securityService.createToken(dto);

        String message = messageService.buildMessage(
                Notifications.LOGGED_IN,
                dto.getName()
        );

        ctx.status(200).json(Map.of(
                "message", message,
                "token", token,
                "data", dto
        ));
    }

    // ________________________________________________________

    public void verify(Context ctx) {
        String token = ErrorHandler.tryString(ctx.queryParam("token"), Notifications.VERIFY_INVALID_TOKEN.getDisplayName());

        User user = ErrorHandler.tryEntity(
                userDAO.getByToken(token, "verifyToken"),
                Notifications.VERIFY_INVALID_TOKEN.getDisplayName()
        );

        if (user.isVerified()) {
            ctx.status(200).json(Map.of("message", Notifications.VERIFY_ALREADY.getDisplayName()));
            return;
        }

        if (user.getVerifyTokenExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ApiException(400, Notifications.VERIFY_EXPIRED.getDisplayName());
        }

        user.setVerified(true);
        user.setVerifyToken(null);
        user.setVerifyTokenExpiresAt(null);
        userDAO.update(user);

        ctx.status(200).json(Map.of("message", Notifications.VERIFY_SUCCESS.getDisplayName()));
    }

    // ________________________________________________________

    public void resendVerify(Context ctx) {
        Map<String, String> body = ErrorHandler.tryBodyMap(ctx, Notifications.BODY_EMPTY.getDisplayName());

        String email = ErrorHandler.tryString(body.get("email"), Notifications.REGISTER_NO_EMAIL.getDisplayName());

        User user = userDAO.getByEmail(email);

        if (user != null && !user.isVerified()) {
            user.setVerifyToken(UUID.randomUUID().toString());
            user.setVerifyTokenExpiresAt(LocalDateTime.now().plusMinutes(TOKEN_MINUTES));
            userDAO.update(user);

            mailService.sendVerifyEmail(user);
        }

        String message = messageService.buildMessage(Notifications.VERIFY_RESENT, email);

        ctx.status(200).json(Map.of("message", message));
    }

    // ________________________________________________________

    public void forgotPassword(Context ctx) {
        Map<String, String> body = ErrorHandler.tryBodyMap(ctx, Notifications.BODY_EMPTY.getDisplayName());

        String email = ErrorHandler.tryString(body.get("email"), Notifications.REGISTER_NO_EMAIL.getDisplayName());

        User user = userDAO.getByEmail(email);

        if (user != null) {
            user.setResetToken(UUID.randomUUID().toString());
            user.setResetTokenExpiresAt(LocalDateTime.now().plusMinutes(TOKEN_MINUTES));
            userDAO.update(user);

            mailService.sendResetPasswordEmail(user);
        }

        String message = messageService.buildMessage(Notifications.RESET_LINK_SENT, email);

        ctx.status(200).json(Map.of("message", message));
    }

    // ________________________________________________________

    public void resetPassword(Context ctx) {
        Map<String, String> body = ErrorHandler.tryBodyMap(ctx, Notifications.BODY_EMPTY.getDisplayName());

        String token = ErrorHandler.tryString(body.get("token"), Notifications.RESET_NO_TOKEN.getDisplayName());
        String password = ErrorHandler.tryString(body.get("password"), Notifications.REGISTER_NO_PASSWORD.getDisplayName());
        String password_repeat = ErrorHandler.tryString(body.get("repeat_password"), Notifications.REGISTER_NO_PASSWORD_REPEAT.getDisplayName());

        if (!password.equals(password_repeat)) {
            throw new ApiException(400, Notifications.REGISTER_PASSWORD_MISMATCH.getDisplayName());
        }

        PasswordService.passwordValidation(password);

        User user = userDAO.getByToken(token, "resetToken");

        if (user == null || user.getResetTokenExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ApiException(400, Notifications.RESET_INVALID_TOKEN.getDisplayName());
        }

        user.setPassword(PasswordService.hashHelper(password));
        user.setResetToken(null);
        user.setResetTokenExpiresAt(null);
        userDAO.update(user);

        ctx.status(200).json(Map.of("message", Notifications.RESET_SUCCESS.getDisplayName()));
    }

}
