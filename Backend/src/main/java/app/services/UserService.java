package app.services;

import app.daos.UserDAO;
import app.server.Setup;

public class UserService {

    private final UserDAO userDAO;

    // ________________________________________________________

    public UserService() {
        this(new UserDAO(Setup.em));
    }

    // ________________________________________________________

    public UserService(UserDAO userDAO) {
        this.userDAO = userDAO;
    }

    // ________________________________________________________

}
