import { describe, expect, it } from 'vitest';
import { basketCount, basketReducer, basketTotal, emptyBasket, isOtherRestaurant } from './basketReducer';

const pizzeria = { id: 'r1', name: 'Pizzeria' };
const burgers = { id: 'r2', name: 'Burger Barn' };
const margherita = { id: 'm1', name: 'Margherita', price: 119 };
const burrata = { id: 'm2', name: 'Burrata', price: '129.00' };
const cheeseburger = { id: 'b1', name: 'Cheeseburger', price: 99 };

const add = (basket, restaurant, item) => basketReducer(basket, { type: 'add', restaurant, item });

describe('basket', () => {
  it('adds an item and shows the updated total', () => {
    const basket = add(emptyBasket, pizzeria, margherita);

    expect(basket.restaurantId).toBe('r1');
    expect(basket.lines).toEqual([{ menuItemId: 'm1', name: 'Margherita', price: 119, quantity: 1 }]);
    expect(basketTotal(basket)).toBe(119);
  });

  it('adds the same item twice as one line with quantity 2', () => {
    const basket = add(add(emptyBasket, pizzeria, margherita), pizzeria, margherita);

    expect(basket.lines).toHaveLength(1);
    expect(basket.lines[0].quantity).toBe(2);
    expect(basketTotal(basket)).toBe(238);
  });

  it('turns prices from the API into numbers', () => {
    const basket = add(emptyBasket, pizzeria, burrata);

    expect(basketTotal(basket)).toBe(129);
  });

  it('updates the total when the quantity changes', () => {
    let basket = add(add(emptyBasket, pizzeria, margherita), pizzeria, burrata);
    basket = basketReducer(basket, { type: 'increase', menuItemId: 'm2' });

    expect(basketTotal(basket)).toBe(377);
    expect(basketCount(basket)).toBe(3);
  });

  it('removes a line when the quantity reaches 0', () => {
    let basket = add(add(emptyBasket, pizzeria, margherita), pizzeria, burrata);
    basket = basketReducer(basket, { type: 'decrease', menuItemId: 'm1' });

    expect(basket.lines.map((line) => line.name)).toEqual(['Burrata']);
  });

  it('empties the basket when the last line is removed', () => {
    let basket = add(emptyBasket, pizzeria, margherita);
    basket = basketReducer(basket, { type: 'decrease', menuItemId: 'm1' });

    expect(basket).toEqual(emptyBasket);
  });

  it('knows when an item is from another restaurant', () => {
    const basket = add(emptyBasket, pizzeria, margherita);

    expect(isOtherRestaurant(basket, 'r2')).toBe(true);
    expect(isOtherRestaurant(basket, 'r1')).toBe(false);
    expect(isOtherRestaurant(emptyBasket, 'r2')).toBe(false);
  });

  it('starts a new basket when an item from another restaurant is added', () => {
    let basket = add(emptyBasket, pizzeria, margherita);
    basket = add(basket, burgers, cheeseburger);

    expect(basket.restaurantId).toBe('r2');
    expect(basket.lines.map((line) => line.name)).toEqual(['Cheeseburger']);
  });

  it('clears the basket', () => {
    const basket = basketReducer(add(emptyBasket, pizzeria, margherita), { type: 'clear' });

    expect(basket).toEqual(emptyBasket);
  });
});
