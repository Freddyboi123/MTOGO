package app.services;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class CommissionCalculatorTest {

    private final CommissionCalculator calculator = new CommissionCalculator();

    // ________________________________________________________

    @ParameterizedTest
    @CsvSource({
            "80, 4.80",
            "1200, 52.00",
            "0, 0.00",
            "100, 6.00",
            "500, 26.00",
            "1000, 46.00",
            "293.60, 15.68"
    })
    void calculatesCommissionWithTheSlidingScale(String total, String expected) {
        assertEquals(new BigDecimal(expected), calculator.calculate(new BigDecimal(total)));
    }

    // ________________________________________________________

    @Test
    void negativeTotalIsRejected() {
        assertThrows(IllegalArgumentException.class, () -> calculator.calculate(new BigDecimal("-1")));
    }

    // ________________________________________________________

    @Test
    void missingTotalIsRejected() {
        assertThrows(IllegalArgumentException.class, () -> calculator.calculate(null));
    }
}
