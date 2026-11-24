import { useContext } from 'react';
import { BasketContext } from './BasketContext';

export default function useBasket() {
  return useContext(BasketContext);
}
