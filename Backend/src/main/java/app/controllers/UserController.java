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

import java.util.List;
import java.util.UUID;

import static io.javalin.apibuilder.ApiBuilder.*;

public class UserController extends BaseController<User, UserDTO> {

    private final UserDAO userDAO = new UserDAO(Setup.em);
    private final UserMapper userMapper = new UserMapper();
    private final UserService userService = new UserService();

    // ________________________________________________________

    public UserController() {
        super(User.class, new UserMapper());
    }

    // ________________________________________________________

    public static EndpointGroup registerRoutes() {
        UserController controller = new UserController();
        return () -> {
            get("/template", controller::getAll, Role.ADMIN);
            get("/template/{id}", controller::getByID, Role.ADMIN);
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
}
