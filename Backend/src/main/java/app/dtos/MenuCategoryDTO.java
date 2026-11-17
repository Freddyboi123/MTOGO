package app.dtos;

import lombok.*;

import java.util.List;
import java.util.UUID;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class MenuCategoryDTO {

    private UUID id;
    private String name;
    private int sortOrder;
    private List<MenuItemDTO> items;

}
