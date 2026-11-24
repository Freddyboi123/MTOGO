export const emptyBasket = { restaurantId: null, restaurantName: null, lines: [] };

export function basketTotal(basket) {
  return basket.lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
}

export function basketCount(basket) {
  return basket.lines.reduce((sum, line) => sum + line.quantity, 0);
}

export function isOtherRestaurant(basket, restaurantId) {
  return basket.lines.length > 0 && basket.restaurantId !== restaurantId;
}

export function basketReducer(basket, action) {
  switch (action.type) {
    case 'add': {
      const { restaurant, item } = action;
      const start = isOtherRestaurant(basket, restaurant.id) ? emptyBasket : basket;
      const existing = start.lines.find((line) => line.menuItemId === item.id);
      const lines = existing
        ? start.lines.map((line) =>
            line.menuItemId === item.id ? { ...line, quantity: line.quantity + 1 } : line
          )
        : [...start.lines, { menuItemId: item.id, name: item.name, price: Number(item.price), quantity: 1 }];
      return { restaurantId: restaurant.id, restaurantName: restaurant.name, lines };
    }
    case 'increase':
      return {
        ...basket,
        lines: basket.lines.map((line) =>
          line.menuItemId === action.menuItemId ? { ...line, quantity: line.quantity + 1 } : line
        )
      };
    case 'decrease': {
      const lines = basket.lines
        .map((line) =>
          line.menuItemId === action.menuItemId ? { ...line, quantity: line.quantity - 1 } : line
        )
        .filter((line) => line.quantity > 0);
      return lines.length === 0 ? emptyBasket : { ...basket, lines };
    }
    case 'clear':
      return emptyBasket;
    default:
      return basket;
  }
}
