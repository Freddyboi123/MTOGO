package app.daos;

import app.daos.generic.EntityManagerDAO;
import app.entities.MenuCategory;
import jakarta.persistence.EntityManager;

public class MenuCategoryDAO extends EntityManagerDAO<MenuCategory> {

    public MenuCategoryDAO(EntityManager em) {
        super(em, MenuCategory.class);
    }
}
