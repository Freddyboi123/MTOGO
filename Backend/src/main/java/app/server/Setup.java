package app.server;

import app.enums.Role;
import app.exceptions.ApiException;
import app.services.MessageService;
import app.security.AccessService;
import io.javalin.Javalin;
import io.javalin.config.JavalinConfig;
import io.micrometer.core.instrument.Timer;
import io.micrometer.core.instrument.binder.jvm.JvmGcMetrics;
import io.micrometer.core.instrument.binder.jvm.JvmMemoryMetrics;
import io.micrometer.core.instrument.binder.jvm.JvmThreadMetrics;
import io.micrometer.core.instrument.binder.system.ProcessorMetrics;
import io.micrometer.core.instrument.binder.system.UptimeMetrics;
import io.micrometer.prometheusmetrics.PrometheusConfig;
import io.micrometer.prometheusmetrics.PrometheusMeterRegistry;
import jakarta.persistence.EntityManager;
import lombok.Getter;

import java.util.concurrent.TimeUnit;


@Getter
public class Setup {

    public static EntityManager em;
    public static final PrometheusMeterRegistry registry = new PrometheusMeterRegistry(PrometheusConfig.DEFAULT);

    private final Javalin app;
    private final AccessService accessService;
    private final MessageService messageService;

    // ________________________________________________________

    public Setup(EntityManager em, int port) {
        this.em = em;
        this.accessService = new AccessService();
        this.messageService = new MessageService();

        this.app = Javalin.create(Setup::configuration)
                .beforeMatched(accessService::accessHandler)
                .start(port);
    }

    // ________________________________________________________

    public static void configuration(JavalinConfig config) {
        config.showJavalinBanner = false;
        config.bundledPlugins.enableRouteOverview("/routes", Role.ANYONE);

        config.bundledPlugins.enableCors(cors ->
                cors.addRule(rule -> {
                    rule.anyHost();
                })
        );
        config.bundledPlugins.enableHttpAllowedMethodsOnRoutes();
        //TODO: Add more configs maybe???
    }

    // ________________________________________________________

    public void initialize(){

        app.exception(ApiException.class, (e, ctx) -> {
            System.out.println(e.getMessage());
            System.out.println(e.getStatus());
            ctx.result(e.getMessage()).status(e.getStatus());
        });

        // Gives me error message
        app.exception(Exception.class, (e, ctx) -> ctx.status(500).result(e.getMessage()));

        initializeMetrics();

        app.unsafeConfig().router.apiBuilder(Routing.registerRoutes());
    }

    // ________________________________________________________

    private void initializeMetrics() {

        // JVM / system metrics
        new JvmMemoryMetrics().bindTo(registry);
        new JvmGcMetrics().bindTo(registry);
        new JvmThreadMetrics().bindTo(registry);
        new ProcessorMetrics().bindTo(registry);
        new UptimeMetrics().bindTo(registry);

        // Time every HTTP request
        app.before(ctx -> ctx.attribute("startTime", System.nanoTime()));

        app.after(ctx -> {
            Long start = ctx.attribute("startTime");
            if (start == null || ctx.path().equals("/metrics")) return;

            String route;
            try {
                route = ctx.endpointHandlerPath();   // e.g. /api/orders/{id}
            } catch (Exception e) {
                route = "unmatched";                 // 404s etc.
            }

            Timer.builder("http_server_requests")
                    .tag("method", ctx.method().name())
                    .tag("route", route)
                    .tag("status", String.valueOf(ctx.statusCode()))
                    .publishPercentileHistogram()
                    .register(registry)
                    .record(System.nanoTime() - start, TimeUnit.NANOSECONDS);
        });

        // Endpoint Prometheus scrapes (public, no token needed)
        app.get("/metrics", ctx -> ctx
                .contentType("text/plain; version=0.0.4")
                .result(registry.scrape()), Role.ANYONE);
    }

    // ________________________________________________________

    // Should it ever end? It has been added to end the session!
    public void endSession() {
        em.close();
        if (app != null) app.stop();
    }
}