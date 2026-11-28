package app.mappers;

import app.dtos.DriverApplicationDTO;
import app.entities.DriverApplication;
import app.enums.TimeOfDay;
import app.mappers.generic.IMapper;

import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.stream.Collectors;

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
            .region(dto.getRegion())
            .weeklyHours(dto.getWeeklyHours())
            .timesOfDay(dto.getTimesOfDay() == null ? new HashSet<>() : new HashSet<>(dto.getTimesOfDay()))
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
            .region(entity.getRegion())
            .weeklyHours(entity.getWeeklyHours())
            .timesOfDay(entity.getTimesOfDay().stream().sorted().collect(Collectors.toCollection(LinkedHashSet<TimeOfDay>::new)))
            .status(entity.getStatus())
            .adminMessage(entity.getAdminMessage())
            .createdAt(entity.getCreatedAt())
            .build();
    }
}
