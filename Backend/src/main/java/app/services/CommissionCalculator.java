package app.services;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

public class CommissionCalculator {

    private record Bracket(BigDecimal upTo, BigDecimal rate) {
    }

    private static final List<Bracket> BRACKETS = List.of(
            new Bracket(new BigDecimal("100"), new BigDecimal("0.06")),
            new Bracket(new BigDecimal("500"), new BigDecimal("0.05")),
            new Bracket(new BigDecimal("1000"), new BigDecimal("0.04")),
            new Bracket(null, new BigDecimal("0.03"))
    );

    // ________________________________________________________

    public BigDecimal calculate(BigDecimal totalExclVat) {
        if (totalExclVat == null || totalExclVat.signum() < 0) {
            throw new IllegalArgumentException("The order total must be zero or more");
        }

        BigDecimal commission = BigDecimal.ZERO;
        BigDecimal lowerBound = BigDecimal.ZERO;

        for (Bracket bracket : BRACKETS) {
            if (totalExclVat.compareTo(lowerBound) <= 0) {
                break;
            }

            BigDecimal upperBound = bracket.upTo() == null ? totalExclVat : bracket.upTo().min(totalExclVat);
            commission = commission.add(upperBound.subtract(lowerBound).multiply(bracket.rate()));
            lowerBound = upperBound;
        }

        return commission.setScale(2, RoundingMode.HALF_UP);
    }
}
