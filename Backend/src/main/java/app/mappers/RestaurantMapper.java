package app.mappers;

import app.dtos.RestaurantDTO;
import app.entities.Address;
import app.entities.Restaurant;
import app.mappers.generic.IMapper;

public class RestaurantMapper implements IMapper<Restaurant, RestaurantDTO> {

    private final MenuCategoryMapper categoryMapper = new MenuCategoryMapper();

    // ________________________________________________________

    @Override
    public Restaurant toEntity(RestaurantDTO dto) {
        Address address = Address.builder()
                .street(dto.getStreet())
                .postalCode(dto.getPostalCode())
                .city(dto.getCity())
                .build();

        return Restaurant.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .phoneNumber(dto.getPhoneNumber())
                .address(address)
                .build();
    }

    // ________________________________________________________

    @Override
    public RestaurantDTO toDTO(Restaurant entity) {
        Address address = entity.getAddress();

        return RestaurantDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .phoneNumber(entity.getPhoneNumber())
                .street(address == null ? null : address.getStreet())
                .postalCode(address == null ? null : address.getPostalCode())
                .city(address == null ? null : address.getCity())
                .active(entity.isActive())
                .categories(entity.getCategories().stream().map(categoryMapper::toDTO).toList())
                .build();
    }
}
