package app.services;

import java.math.BigDecimal;
import java.util.UUID;

public interface IPaymentService {

    boolean charge(UUID customerId, BigDecimal amount);
}
