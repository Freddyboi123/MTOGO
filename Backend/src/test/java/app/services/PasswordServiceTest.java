package app.services;

import app.exceptions.ApiException;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class PasswordServiceTest {

    @Test
    void validPasswordIsAccepted() {
        assertDoesNotThrow(() -> PasswordService.passwordValidation("Password123!"));
    }

    // ________________________________________________________

    @ParameterizedTest
    @ValueSource(strings = {"Pass1!", "Password123!Password123!Password", "password123!", "PASSWORD123!", "Password123"})
    void invalidPasswordIsRejected(String password) {
        ApiException exception = assertThrows(ApiException.class, () -> PasswordService.passwordValidation(password));

        assertEquals(400, exception.getStatus());
    }

    // ________________________________________________________

    @Test
    void hashedPasswordMatchesTheOriginal() {
        String hash = PasswordService.hashHelper("Password123!");

        assertNotEquals("Password123!", hash);
        assertTrue(PasswordService.passwordEquals("Password123!", hash));
    }

    // ________________________________________________________

    @Test
    void wrongPasswordDoesNotMatchTheHash() {
        String hash = PasswordService.hashHelper("Password123!");

        assertFalse(PasswordService.passwordEquals("Wrong123!", hash));
    }
}
