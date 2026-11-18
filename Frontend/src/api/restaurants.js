import { getJson } from './client';

export async function fetchRestaurants() {
  const body = await getJson('/restaurants');
  return body?.data?.data ?? [];
}

export async function fetchRestaurant(id) {
  const body = await getJson(`/restaurant/${id}`);
  return body.data.data;
}

export async function fetchMenu(restaurantId) {
  const body = await getJson(`/restaurant/menu/${restaurantId}`);
  return body?.data ?? [];
}
