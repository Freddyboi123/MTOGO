package app.daos;

import app.daos.generic.EntityManagerDAO;
import app.entities.MenuItem;
import jakarta.persistence.EntityManager;

public class MenuItemDAO extends EntityManagerDAO<MenuItem> {

    public MenuItemDAO(EntityManager em) {
        super(em, MenuItem.class);
    }
}
