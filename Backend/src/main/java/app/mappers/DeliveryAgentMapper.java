package app.mappers;

import app.dtos.DeliveryAgentDTO;
import app.dtos.UserDTO;
import app.entities.DeliveryAgent;

public class DeliveryAgentMapper {

    private final UserMapper userMapper = new UserMapper();

    // ________________________________________________________

    public DeliveryAgentDTO toDTO(DeliveryAgent entity, String status) {
        UserDTO user = userMapper.toDTO(entity.getUser());
        if (entity.getPhoneNumber() != null) {
            user.setPhoneNumber(entity.getPhoneNumber());
        }

        return DeliveryAgentDTO.builder()
            .id(entity.getId())
            .user(user)
            .locked(entity.isLocked())
            .lockReason(entity.getLockReason())
            .status(status)
            .build();
    }
}
