import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CourierPanel from './CourierPanel';
import { acceptDelivery, completeDelivery, getAvailableDeliveries, getMyDeliveries, pickUpDelivery } from '../utils/api';

vi.mock('../components/DashboardLayout', () => ({
  default: ({ children }) => children
}));
vi.mock('../utils/api', () => ({
  acceptDelivery: vi.fn(),
  completeDelivery: vi.fn(),
  getAvailableDeliveries: vi.fn(),
  getMyDeliveries: vi.fn(),
  isLoggedIn: () => Boolean(localStorage.getItem('token')),
  pickUpDelivery: vi.fn()
}));

const assigned = {
  orderId: 'order-1', deliveryId: 'delivery-1', restaurantName: 'Test Pizza',
  deliveryStatus: 'ASSIGNED', orderStatus: 'READY_FOR_PICKUP'
};
const pickedUp = { ...assigned, deliveryStatus: 'PICKED_UP', orderStatus: 'OUT_FOR_DELIVERY' };
const delivered = { ...pickedUp, deliveryStatus: 'DELIVERED', orderStatus: 'DELIVERED' };

let container;
let root;

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  localStorage.setItem('token', 'test-token');
  localStorage.setItem('user', JSON.stringify({ name: 'Test', roles: ['DELIVERY_AGENT'] }));
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  localStorage.clear();
  vi.unstubAllGlobals();
});

const button = (label) => [...container.querySelectorAll('button')].find((item) => item.textContent === label);
async function click(label) {
  const target = button(label);
  expect(target).toBeDefined();
  await act(async () => target.click());
}
async function render(path = '/chauffoerpanel/ture') {
  await act(async () => root.render(<MemoryRouter initialEntries={[path]}><CourierPanel /></MemoryRouter>));
}

describe('US-11 courier status actions', () => {
  it('shows pickup first, then delivery, and removes only the completed trip', async () => {
    const other = { ...assigned, orderId: 'order-2', deliveryId: 'delivery-2' };
    getMyDeliveries.mockResolvedValue({ data: [assigned, other] });
    pickUpDelivery.mockResolvedValue({ data: pickedUp });
    completeDelivery.mockResolvedValue({ data: delivered });
    await render();
    await click('Se detaljer');
    expect(button('Markér som leveret')).toBeUndefined();
    await click('Markér som afhentet');
    expect(pickUpDelivery).toHaveBeenCalledTimes(1);
    expect(pickUpDelivery).toHaveBeenCalledWith('order-1');
    expect(button('Markér som afhentet')).toBeUndefined();
    expect(container.textContent).toContain('På vej');
    await click('Markér som leveret');
    expect(completeDelivery).toHaveBeenCalledTimes(1);
    expect(completeDelivery).toHaveBeenCalledWith('order-1');
    expect(container.querySelectorAll('article')).toHaveLength(1);
    expect(container.textContent).toContain('order-2');
    expect(container.textContent).not.toContain('order-1');
  });

  it('shows the backend notification and keeps the original state after rejected pickup', async () => {
    getMyDeliveries.mockResolvedValue({ data: [assigned] });
    pickUpDelivery.mockRejectedValue(Object.assign(new Error('Only the assigned delivery agent can update this delivery'), { status: 403 }));
    await render();
    await click('Se detaljer');
    await click('Markér som afhentet');
    expect(container.querySelector('[role="alert"]').textContent).toContain('Only the assigned delivery agent');
    expect(button('Markér som afhentet')).toBeDefined();
    expect(button('Markér som leveret')).toBeUndefined();
    expect(completeDelivery).not.toHaveBeenCalled();
  });

  it('prevents repeat completion while the request is pending and preserves a failed trip', async () => {
    getMyDeliveries.mockResolvedValue({ data: [pickedUp] });
    let reject;
    completeDelivery.mockReturnValue(new Promise((_, failure) => { reject = failure; }));
    await render();
    await click('Se detaljer');
    await click('Markér som leveret');
    expect(button('Opdaterer...').disabled).toBe(true);
    expect(button('Opdater listen').disabled).toBe(true);
    await act(async () => button('Opdaterer...').click());
    expect(completeDelivery).toHaveBeenCalledTimes(1);
    await act(async () => reject(Object.assign(new Error('This delivery cannot be updated from its current status'), { status: 409 })));
    expect(container.querySelector('[role="alert"]').textContent).toContain('cannot be updated');
    expect(container.querySelectorAll('article')).toHaveLength(1);
    expect(button('Markér som leveret').disabled).toBe(false);
  });

  it.each([
    { ...assigned, orderStatus: 'CANCELLED' },
    { ...pickedUp, orderStatus: 'CANCELLED' },
    { ...assigned, orderStatus: 'OUT_FOR_DELIVERY' },
    { ...pickedUp, orderStatus: 'READY_FOR_PICKUP' }
  ])('does not expose status actions for inconsistent or cancelled orders', async (delivery) => {
    getMyDeliveries.mockResolvedValue({ data: [delivery] });
    await render();
    await click('Se detaljer');
    expect(button('Markér som afhentet')).toBeUndefined();
    expect(button('Markér som leveret')).toBeUndefined();
    expect(pickUpDelivery).not.toHaveBeenCalled();
    expect(completeDelivery).not.toHaveBeenCalled();
  });

  it('does not expose status actions on an available order', async () => {
    getAvailableDeliveries.mockResolvedValue({ data: [{ ...assigned, deliveryStatus: null }] });
    await render('/chauffoerpanel');
    await click('Se detaljer');
    expect(button('Accepter levering')).toBeDefined();
    expect(button('Markér som afhentet')).toBeUndefined();
    expect(button('Markér som leveret')).toBeUndefined();
    expect(acceptDelivery).not.toHaveBeenCalled();
  });
});
