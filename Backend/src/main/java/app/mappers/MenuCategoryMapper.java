package app.mappers;

import app.dtos.MenuCategoryDTO;
import app.entities.MenuCategory;
import app.mappers.generic.IMapper;

public class MenuCategoryMapper implements IMapper<MenuCategory, MenuCategoryDTO> {

    private final MenuItemMapper itemMapper = new MenuItemMapper();

    // ________________________________________________________

    @Override
    public MenuCategory toEntity(MenuCategoryDTO dto) {
        return MenuCategory.builder()
                .name(dto.getName())
                .sortOrder(dto.getSortOrder())
                .build();
    }

    // ________________________________________________________

    @Override
    public MenuCategoryDTO toDTO(MenuCategory entity) {
        return MenuCategoryDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .sortOrder(entity.getSortOrder())
                .items(entity.getItems().stream().map(itemMapper::toDTO).toList())
                .build();
    }
}
