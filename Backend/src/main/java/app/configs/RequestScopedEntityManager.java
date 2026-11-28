package app.configs;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Proxy;


public final class RequestScopedEntityManager {

    private final EntityManagerFactory emf;
    private final ThreadLocal<EntityManager> current = new ThreadLocal<>();
    private final EntityManager em;

    // ________________________________________________________

    public RequestScopedEntityManager(EntityManagerFactory emf) {
        this.emf = emf;
        this.em = (EntityManager) Proxy.newProxyInstance(
            EntityManager.class.getClassLoader(),
            new Class<?>[]{EntityManager.class},
            new Handler());
    }

    // ________________________________________________________

    public EntityManager proxy() {
        return em;
    }

    // ________________________________________________________

    public void release() {
        EntityManager em = current.get();
        current.remove();
        if (em == null || !em.isOpen()) return;
        try {
            if (em.getTransaction().isActive()) em.getTransaction().rollback();
        } finally {
            em.close();
        }
    }

    // ________________________________________________________

    private EntityManager currentOrOpen() {
        EntityManager em = current.get();
        if (em == null || !em.isOpen()) {
            em = emf.createEntityManager();
            current.set(em);
        }
        return em;
    }

    // ________________________________________________________

    private final class Handler implements InvocationHandler {
        @Override
        public Object invoke(Object self, java.lang.reflect.Method method, Object[] args) throws Throwable {
            switch (method.getName()) {
                case "close" -> {
                    release();
                    return null;
                }
                case "getEntityManagerFactory" -> {
                    return emf;
                }
                case "isOpen" -> {
                    return true;
                }
                case "hashCode" -> {
                    return System.identityHashCode(self);
                }
                case "equals" -> {
                    return self == args[0];
                }
                case "toString" -> {
                    return "RequestScopedEntityManager";
                }
                default -> {
                    try {
                        return method.invoke(currentOrOpen(), args);
                    } catch (InvocationTargetException e) {
                        throw e.getCause();
                    }
                }
            }
        }
    }
}
