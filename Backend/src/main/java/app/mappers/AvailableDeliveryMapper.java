package app.mappers;

import app.dtos.AvailableDeliveryDTO;
import app.entities.Address;
import app.entities.Order;

public class AvailableDeliveryMapper {

    public AvailableDeliveryDTO toDTO(Order order) {
        Address pickup = order.getRestaurant().getAddress();
        Address destination = order.getDeliveryAddress();

        return new AvailableDeliveryDTO(
                order.getId(),
                order.getRestaurant().getName(),
                pickup == null ? null : pickup.getStreet(),
                pickup == null ? null : pickup.getPostalCode(),
                pickup == null ? null : pickup.getCity(),
                destination == null ? null : destination.getStreet(),
                destination == null ? null : destination.getPostalCode(),
                destination == null ? null : destination.getCity(),
                order.getExpectedPickupAt() == null ? null : order.getExpectedPickupAt().toString()
        );
    }
}
