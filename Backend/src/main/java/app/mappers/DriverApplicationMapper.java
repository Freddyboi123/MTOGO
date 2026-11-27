package app.mappers;

import app.dtos.DriverApplicationDTO;
import app.entities.DriverApplication;
import app.mappers.generic.IMapper;

public class DriverApplicationMapper implements IMapper<DriverApplication, DriverApplicationDTO> {

    // ________________________________________________________

    @Override
    public DriverApplication toEntity(DriverApplicationDTO dto) {
        return DriverApplication.builder()
            .firstname(dto.getFirstname())
            .lastname(dto.getLastname())
            .email(dto.getEmail())
            .phoneNumber(dto.getPhoneNumber())
            .vehicle(dto.getVehicle())
            .area(dto.getArea())
            .build();
    }

    // ________________________________________________________

    @Override
    public DriverApplicationDTO toDTO(DriverApplication entity) {
        return DriverApplicationDTO.builder()
            .id(entity.getId())
            .firstname(entity.getFirstname())
            .lastname(entity.getLastname())
            .email(entity.getEmail())
            .phoneNumber(entity.getPhoneNumber())
            .vehicle(entity.getVehicle())
            .area(entity.getArea())
            .status(entity.getStatus())
            .createdAt(entity.getCreatedAt())
            .build();
    }
}
