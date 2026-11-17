package app.controllers;

import app.controllers.generic.BaseController;
import app.daos.UserDAO;
import app.dtos.UserDTO;
import app.entities.User;
import app.enums.Role;
import app.mappers.UserMapper;
import app.server.Setup;
import app.services.UserService;
import io.javalin.apibuilder.EndpointGroup;
import io.javalin.http.Context;

import java.util.List;
import java.util.UUID;

import static io.javalin.apibuilder.ApiBuilder.*;

public class UserController extends BaseController<User, UserDTO> {

    private final UserDAO userDAO = new UserDAO(Setup.em);
    private final UserService userService = new UserService(userDAO);

    // ________________________________________________________

    public UserController() {
        super(User.class, new UserMapper());
    }

    // ________________________________________________________

    public static EndpointGroup registerRoutes() {
        UserController controller = new UserController();
        return () -> {
            get("/users", controller::getAll, Role.ADMIN, Role.OWNER);
            get("/user/{id}", controller::getByID, Role.ADMIN, Role.OWNER);
            post("users/auth/register", controller::registerUser, Role.ANYONE);
            post("users/auth/login", controller::login, Role.ANYONE);
            get("users/auth/verify", controller::verify, Role.ANYONE);
            post("users/auth/resend-verify", controller::resendVerify, Role.ANYONE);
            post("users/auth/forgot-password", controller::forgotPassword, Role.ANYONE);
            post("users/auth/reset-password", controller::resetPassword, Role.ANYONE);
            post("/user/{id}/roles", controller::assignRole, Role.ADMIN);
        };
    }

    // ________________________________________________________

    @Override
    protected List<User> getAllEntities() {
        return userDAO.getAll();
    }

    // ________________________________________________________

    @Override
    protected User getEntityById(UUID id) {
        return userDAO.getById(id);
    }

    // ________________________________________________________

    private void registerUser(Context ctx) {
        userService.register(ctx);
    }

    // ________________________________________________________

    private void login(Context ctx) {
        userService.login(ctx);
    }

    // ________________________________________________________

    private void verify(Context ctx) {
        userService.verify(ctx);
    }

    // ________________________________________________________

    private void resendVerify(Context ctx) {
        userService.resendVerify(ctx);
    }

    // ________________________________________________________

    private void forgotPassword(Context ctx) {
        userService.forgotPassword(ctx);
    }

    // ________________________________________________________

    private void resetPassword(Context ctx) {
        userService.resetPassword(ctx);
    }

    // ________________________________________________________

    private void assignRole(Context ctx) {
        userService.assignRole(ctx);
    }

    // ________________________________________________________
}
