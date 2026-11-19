package app.controllers;

import app.configs.TestHibernateConfig;
import app.enums.FeatureFlag;
import app.server.Setup;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManagerFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import static org.junit.jupiter.api.Assertions.*;

class FeatureFlagControllerTest {

    private static EntityManagerFactory emf;
    private static Setup setup;
    private static String baseUrl;

    // ________________________________________________________

    @BeforeAll
    static void startServer() {
        emf = TestHibernateConfig.getTestEmf();
        setup = new Setup(emf.createEntityManager(), 0);
        setup.initialize();
        baseUrl = "http://localhost:" + setup.getApp().port() + "/api";
    }

    // ________________________________________________________

    @AfterAll
    static void stopServer() {
        setup.endSession();
        emf.close();
    }

    // ________________________________________________________

    @Test
    void getFeaturesReturnsEveryFlagAsBoolean() throws Exception {
        HttpRequest request = HttpRequest.newBuilder(URI.create(baseUrl + "/features")).GET().build();
        HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());

        assertEquals(200, response.statusCode());
        JsonNode flags = new ObjectMapper().readTree(response.body()).get("data");
        for (FeatureFlag flag : FeatureFlag.values()) {
            assertTrue(flags.get(flag.getClientName()).isBoolean(), flag.getClientName());
        }
    }
}
