import { useEffect, useMemo, useReducer } from 'react';
import { BasketContext } from './BasketContext';
import { basketCount, basketReducer, basketTotal, emptyBasket, isOtherRestaurant } from './basketReducer';

const STORAGE_KEY = 'basket';

function loadBasket() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved && Array.isArray(saved.lines) ? saved : emptyBasket;
  } catch {
    return emptyBasket;
  }
}

export default function BasketProvider({ children }) {
  const [basket, dispatch] = useReducer(basketReducer, undefined, loadBasket);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(basket));
    } catch {
      return;
    }
  }, [basket]);

  const value = useMemo(
    () => ({
      basket,
      total: basketTotal(basket),
      count: basketCount(basket),
      isOtherRestaurant: (restaurantId) => isOtherRestaurant(basket, restaurantId),
      add: (restaurant, item) => dispatch({ type: 'add', restaurant, item }),
      increase: (menuItemId) => dispatch({ type: 'increase', menuItemId }),
      decrease: (menuItemId) => dispatch({ type: 'decrease', menuItemId }),
      clear: () => dispatch({ type: 'clear' })
    }),
    [basket]
  );

  return <BasketContext.Provider value={value}>{children}</BasketContext.Provider>;
}
