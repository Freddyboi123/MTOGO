package app.mappers;

import app.dtos.OrderDTO;
import app.entities.Address;
import app.entities.Order;
import app.mappers.generic.IMapper;

public class OrderMapper implements IMapper<Order, OrderDTO> {

    private final OrderLineMapper lineMapper = new OrderLineMapper();
    private final UserMapper userMapper = new UserMapper();

    // ________________________________________________________

    @Override
    public Order toEntity(OrderDTO dto) {
        return Order.builder()
            .deliveryAddress(Address.builder()
                .street(dto.getStreet())
                .postalCode(dto.getPostalCode())
                .city(dto.getCity())
                .build())
            .build();
    }

    // ________________________________________________________

    @Override
    public OrderDTO toDTO(Order entity) {
        Address address = entity.getDeliveryAddress();

        return OrderDTO.builder()
            .id(entity.getId())
            .restaurantId(entity.getRestaurant().getId())
            .restaurantName(entity.getRestaurant().getName())
            .street(address == null ? null : address.getStreet())
            .postalCode(address == null ? null : address.getPostalCode())
            .city(address == null ? null : address.getCity())
            .status(entity.getStatus())
            .paymentStatus(entity.getPayment() == null ? null : entity.getPayment().getStatus())
            .total(entity.getTotalInclVat())
            .createdAt(entity.getCreatedAt())
            .lines(entity.getLines().stream().map(lineMapper::toDTO).toList())
            .build();
    }

    // ________________________________________________________

    public OrderDTO toAdminDTO(Order entity, String adminStatus) {
        Address address = entity.getDeliveryAddress();

        return OrderDTO.builder()
            .id(entity.getId())
            .restaurantId(entity.getRestaurant().getId())
            .restaurantName(entity.getRestaurant().getName())
            .street(address == null ? null : address.getStreet())
            .postalCode(address == null ? null : address.getPostalCode())
            .city(address == null ? null : address.getCity())
            .status(entity.getStatus())
            .paymentStatus(entity.getPayment() == null ? null : entity.getPayment().getStatus())
            .total(entity.getTotalInclVat())
            .createdAt(entity.getCreatedAt())
            .customer(userMapper.toDTO(entity.getCustomer()))
            .adminStatus(adminStatus)
            .build();
    }
}
