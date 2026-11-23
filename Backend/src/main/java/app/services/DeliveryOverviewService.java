package app.services;

import app.daos.OrderDAO;
import app.dtos.AvailableDeliveryDTO;
import app.mappers.AvailableDeliveryMapper;

import java.util.List;

public class DeliveryOverviewService {

    private final OrderDAO orderDAO;
    private final AvailableDeliveryMapper mapper = new AvailableDeliveryMapper();

    public DeliveryOverviewService(OrderDAO orderDAO) {
        this.orderDAO = orderDAO;
    }

    public List<AvailableDeliveryDTO> getAvailableDeliveries() {
        return orderDAO.getAvailableForDelivery().stream()
                .map(mapper::toDTO)
                .toList();
    }
}
