import { describe, expect, it } from 'vitest';
import { buildApiUrl } from './config';

describe('buildApiUrl', () => {
  it.each([
    ['https://mtogo.api.roneu.dk', 'https://mtogo.api.roneu.dk/api'],
    ['https://mtogo.api.roneu.dk/', 'https://mtogo.api.roneu.dk/api'],
    ['https://mtogo.api.roneu.dk/api', 'https://mtogo.api.roneu.dk/api'],
    ['https://mtogo.api.roneu.dk/api/', 'https://mtogo.api.roneu.dk/api'],
    [undefined, 'http://localhost:6969/api'],
    ['', 'http://localhost:6969/api']
  ])('%s -> %s', (input, expected) => {
    expect(buildApiUrl(input)).toBe(expected);
  });
});
