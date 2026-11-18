package app.mappers;

import app.dtos.RestaurantApplicationDTO;
import app.entities.Address;
import app.entities.RestaurantApplication;
import app.mappers.generic.IMapper;

public class RestaurantApplicationMapper implements IMapper<RestaurantApplication, RestaurantApplicationDTO> {

    // ________________________________________________________

    @Override
    public RestaurantApplication toEntity(RestaurantApplicationDTO dto) {
        Address address = Address.builder()
            .street(dto.getStreet())
            .postalCode(dto.getPostalCode())
            .city(dto.getCity())
            .build();

        return RestaurantApplication.builder()
            .restaurantName(dto.getRestaurantName())
            .cvr(dto.getCvr())
            .address(address)
            .email(dto.getEmail())
            .phoneNumber(dto.getPhoneNumber())
            .description(dto.getDescription())
            .build();
    }

    // ________________________________________________________

    @Override
    public RestaurantApplicationDTO toDTO(RestaurantApplication entity) {
        Address address = entity.getAddress();

        return RestaurantApplicationDTO.builder()
            .id(entity.getId())
            .restaurantName(entity.getRestaurantName())
            .cvr(entity.getCvr())
            .street(address == null ? null : address.getStreet())
            .postalCode(address == null ? null : address.getPostalCode())
            .city(address == null ? null : address.getCity())
            .email(entity.getEmail())
            .phoneNumber(entity.getPhoneNumber())
            .description(entity.getDescription())
            .status(entity.getStatus())
            .adminMessage(entity.getAdminMessage())
            .createdAt(entity.getCreatedAt().toString())
            .build();
    }
}
