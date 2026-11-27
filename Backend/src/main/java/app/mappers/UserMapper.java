package app.mappers;

import app.dtos.UserDTO;
import app.entities.User;
import app.mappers.generic.IMapper;

public class UserMapper implements IMapper<User, UserDTO> {

    @Override
    public User toEntity(UserDTO dto) {
        return User.builder()
                .id(dto.getId())
                .firstname(dto.getName())
                .lastname(dto.getLastName())
                .email(dto.getEmail())
                .phoneNumber(dto.getPhoneNumber())
                .street(dto.getStreet())
                .postalCode(dto.getPostalCode())
                .city(dto.getCity())
                .floorDoor(dto.getFloorDoor())
                .build();
    }

    @Override
    public UserDTO toDTO(User entity) {
        return UserDTO.builder().id(entity.getId())
                .name(entity.getFirstname())
                .lastName(entity.getLastname())
                .email(entity.getEmail())
                .pendingEmail(entity.getPendingEmail())
                .phoneNumber(entity.getPhoneNumber())
                .street(entity.getStreet())
                .postalCode(entity.getPostalCode())
                .city(entity.getCity())
                .floorDoor(entity.getFloorDoor())
                .build();
    }
}