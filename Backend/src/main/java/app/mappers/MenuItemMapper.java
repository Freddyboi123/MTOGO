package app.mappers;

import app.dtos.MenuItemDTO;
import app.entities.MenuItem;
import app.mappers.generic.IMapper;

public class MenuItemMapper implements IMapper<MenuItem, MenuItemDTO> {

    @Override
    public MenuItem toEntity(MenuItemDTO dto) {
        return MenuItem.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .available(dto.getAvailable() == null || dto.getAvailable())
                .build();
    }

    @Override
    public MenuItemDTO toDTO(MenuItem entity) {
        return MenuItemDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .price(entity.getPrice())
                .available(entity.isAvailable())
                .build();
    }
}
