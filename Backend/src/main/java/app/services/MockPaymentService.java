package app.services;

import java.math.BigDecimal;
import java.util.UUID;

public class MockPaymentService implements IPaymentService {

    @Override
    public boolean charge(UUID customerId, BigDecimal amount) {
        return true;
    }
}
