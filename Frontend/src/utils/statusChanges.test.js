import { describe, expect, it } from 'vitest';
import findStatusChanges from './statusChanges';

describe('findStatusChanges', () => {
  it('finds an order whose status changed', () => {
    const previous = [{ id: 'a', status: 'RECEIVED' }];
    const current = [{ id: 'a', status: 'PREPARING' }];

    expect(findStatusChanges(previous, current)).toEqual([{ id: 'a', status: 'PREPARING' }]);
  });

  it('ignores orders with the same status', () => {
    const orders = [{ id: 'a', status: 'RECEIVED' }];

    expect(findStatusChanges(orders, orders)).toEqual([]);
  });

  it('ignores new orders that were not there before', () => {
    const previous = [{ id: 'a', status: 'RECEIVED' }];
    const current = [{ id: 'a', status: 'RECEIVED' }, { id: 'b', status: 'RECEIVED' }];

    expect(findStatusChanges(previous, current)).toEqual([]);
  });

  it('finds nothing on the first load', () => {
    expect(findStatusChanges([], [{ id: 'a', status: 'PREPARING' }])).toEqual([]);
  });
});
