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
import java.util.HashSet;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

public class UserService {

    private final UserDAO userDAO;
    private final MessageService messageService = new MessageService();
    private final SecurityService securityService = new SecurityService();
    private final UserMapper userMapper = new UserMapper();
    private final MailService mailService = new MailService();
    private static final int TOKEN_MINUTES = 30;
    private static final String EMAIL_PATTERN = "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$";
    private static final String PHONE_PATTERN = "\\+?\\d{8,12}";

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

        PasswordService.passwordValidation(password);

        Role role = Role.CUSTOMER;

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

    // ________________________________________________________

    public void assignRole(Context ctx) {
        Map<String, String> body = ErrorHandler.tryBodyMap(ctx, Notifications.BODY_EMPTY.getDisplayName());

        UUID id = ErrorHandler.tryParseUUID(ctx.pathParam("id"), Notifications.USER_NOT_FOUND.getDisplayName());
        String roleName = ErrorHandler.tryString(body.get("role"), Notifications.ROLE_REQUIRED.getDisplayName());
        Role role = ErrorHandler.tryParseEnum(Role.class, roleName, Notifications.ROLE_INVALID.getDisplayName());

        User user = ErrorHandler.tryEntity(userDAO.getById(id), Notifications.USER_NOT_FOUND.getDisplayName());

        Set<Role> roles = new HashSet<>(user.getRoles());
        roles.add(role);
        user.setRoles(roles);
        userDAO.update(user);

        UserDTO dto = userMapper.toDTO(user);
        dto.setRoles(user.getRoles());

        String message = messageService.buildMessage(Notifications.ROLE_ASSIGNED, role.name(), user.getEmail());

        ctx.status(200).json(Map.of(
                "message", message,
                "data", dto
        ));
    }

    // ________________________________________________________

    public void getProfile(Context ctx, UserDTO tokenUser) {
        User user = ErrorHandler.tryEntity(userDAO.getById(tokenUser.getId()), Notifications.USER_NOT_FOUND.getDisplayName());

        ctx.status(200).json(Map.of("data", toDtoWithRoles(user)));
    }

    // ________________________________________________________

    public void updateProfile(Context ctx, UserDTO userDTO) {
        Map<String, String> body = ErrorHandler.tryBodyMap(ctx, Notifications.BODY_EMPTY.getDisplayName());
        User user = ErrorHandler.tryEntity(userDAO.getById(userDTO.getId()), Notifications.USER_NOT_FOUND.getDisplayName());

        boolean changed = false;

        if (body.containsKey("first_name")) {
            String firstname = ErrorHandler.tryString(body.get("first_name"), Notifications.PROFILE_FIRSTNAME_EMPTY.getDisplayName()).trim();
            if (!firstname.equals(user.getFirstname())) {
                user.setFirstname(firstname);
                changed = true;
            }
        }

        if (body.containsKey("last_name")) {
            String lastname = ErrorHandler.tryString(body.get("last_name"), Notifications.PROFILE_LASTNAME_EMPTY.getDisplayName()).trim();
            if (!lastname.equals(user.getLastname())) {
                user.setLastname(lastname);
                changed = true;
            }
        }

        if (body.containsKey("email")) {
            String email = ErrorHandler.tryString(body.get("email"), Notifications.PROFILE_EMAIL_INVALID.getDisplayName()).trim();
            if (!email.matches(EMAIL_PATTERN)) {
                throw new ApiException(400, Notifications.PROFILE_EMAIL_INVALID.getDisplayName());
            }
            if (!email.equals(user.getEmail())) {
                if (userDAO.existByColumn(email, "email")) {
                    throw new ApiException(400, messageService.buildMessage(Notifications.EMAIL_EXISTS, email));
                }
                user.setEmail(email);
                changed = true;
            }
        }

        if (body.containsKey("phone_number")) {
            String raw = body.get("phone_number");
            String phone = raw == null || raw.isBlank() ? null : raw.trim();
            if (phone != null && !phone.replaceAll("\\s", "").matches(PHONE_PATTERN)) {
                throw new ApiException(400, Notifications.PROFILE_PHONE_INVALID.getDisplayName());
            }
            if (!Objects.equals(phone, user.getPhoneNumber())) {
                user.setPhoneNumber(phone);
                changed = true;
            }
        }

        String newPassword = body.get("new_password");
        if (newPassword != null && !newPassword.isBlank()) {
            String currentPassword = ErrorHandler.tryString(body.get("current_password"), Notifications.PROFILE_CURRENT_PASSWORD_REQUIRED.getDisplayName());
            if (!PasswordService.passwordEquals(currentPassword, user.getPassword())) {
                throw new ApiException(400, Notifications.PROFILE_CURRENT_PASSWORD_WRONG.getDisplayName());
            }
            if (!newPassword.equals(body.get("repeat_password"))) {
                throw new ApiException(400, Notifications.REGISTER_PASSWORD_MISMATCH.getDisplayName());
            }
            PasswordService.passwordValidation(newPassword);
            user.setPassword(PasswordService.hashHelper(newPassword));
            changed = true;
        }

        if (changed) {
            userDAO.update(user);
        }

        UserDTO dto = toDtoWithRoles(user);
        Notifications result = changed ? Notifications.PROFILE_UPDATED : Notifications.PROFILE_NO_CHANGES;

        ctx.status(200).json(Map.of(
            "message", result.getDisplayName(),
            "token", securityService.createToken(dto),
            "data", dto
        ));
    }

    // ________________________________________________________

    private UserDTO toDtoWithRoles(User user) {
        UserDTO dto = userMapper.toDTO(user);
        dto.setRoles(user.getRoles());
        return dto;
    }

}
