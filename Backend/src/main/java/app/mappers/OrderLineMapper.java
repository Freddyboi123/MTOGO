package app.mappers;

import app.dtos.OrderLineDTO;
import app.entities.OrderLine;
import app.mappers.generic.IMapper;

public class OrderLineMapper implements IMapper<OrderLine, OrderLineDTO> {

    @Override
    public OrderLine toEntity(OrderLineDTO dto) {
        return OrderLine.builder()
                .itemName(dto.getItemName())
                .unitPrice(dto.getUnitPrice())
                .quantity(dto.getQuantity() == null ? 0 : dto.getQuantity())
                .build();
    }

    @Override
    public OrderLineDTO toDTO(OrderLine entity) {
        return OrderLineDTO.builder()
                .menuItemId(entity.getMenuItem() == null ? null : entity.getMenuItem().getId())
                .itemName(entity.getItemName())
                .unitPrice(entity.getUnitPrice())
                .quantity(entity.getQuantity())
                .build();
    }
}
