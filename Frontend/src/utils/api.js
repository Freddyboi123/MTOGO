import { API_URL } from '../api/config';
import { useEffect, useState } from 'react';

export async function api(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('token');
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        ...(body && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: body ? JSON.stringify(body) : undefined
    });
  } catch {
    throw Object.assign(new Error('Kunne ikke få forbindelse til serveren.'), { status: 0 });
  }

  const text = await res.text();
  let data = text;
  try {
    data = JSON.parse(text);
  } catch {
    
  }

  if (!res.ok) {
    const message = typeof data === 'string' ? data : data?.message;
    throw Object.assign(new Error(message || 'Noget gik galt.'), { status: res.status });
  }
  return data;
}

export const register = (body) => api('/users/auth/register', { method: 'POST', body });
export const login = (body) => api('/users/auth/login', { method: 'POST', body });
export const verifyEmail = (token) => api(`/users/auth/verify?token=${encodeURIComponent(token)}`);
export const resendVerify = (email) => api('/users/auth/resend-verify', { method: 'POST', body: { email } });
export const forgotPassword = (email) => api('/users/auth/forgot-password', { method: 'POST', body: { email } });
export const resetPassword = (body) => api('/users/auth/reset-password', { method: 'POST', body });

export const getProfile = () => api('/users/profile');
export const updateProfile = (body) => api('/users/profile', { method: 'PATCH', body });

export async function fetchRestaurants({ cuisine, query, latitude, longitude } = {}) {
  const params = new URLSearchParams();
  if (cuisine) params.set('cuisine', cuisine);
  if (query?.trim()) params.set('q', query.trim());
  if (latitude !== undefined && longitude !== undefined) {
    params.set('lat', latitude);
    params.set('lon', longitude);
  }

  const queryString = params.toString();
  const body = await api(queryString ? `/restaurants?${queryString}` : '/restaurants');
  return body?.data?.data ?? [];
}

export async function fetchRestaurant(id) {
  const body = await api(`/restaurant/${id}`);
  return body.data.data;
}

export async function fetchMenu(restaurantId) {
  const body = await api(`/restaurant/menu/${restaurantId}`);
  return body?.data ?? [];
}

export const getMyRestaurants = () => api('/my-restaurants');
export const getMyRestaurant = (id) => api(`/my-restaurants/${id}`);
export const setRestaurantVisibility = (id, active) =>
  api(`/my-restaurants/${id}/visibility`, { method: 'PUT', body: { active } });
export const getAvailableDeliveries = () => api('/deliveries/available');
export const placeOrder = (body) => api('/orders', { method: 'POST', body });
export const getRestaurantOrders = (restaurantId) => api(`/my-restaurants/${restaurantId}/orders`);
export const getMyOrders = () => api('/orders/mine');
export const updateOrderStatus = (orderId, status) =>
  api(`/orders/${orderId}/status`, { method: 'PUT', body: { status } });
export const addMenuItem = (categoryId, body) =>
  api(`/category/${categoryId}/items`, { method: 'POST', body });
export const updateMenuItem = (itemId, body) =>
  api(`/menu-item/${itemId}`, { method: 'PUT', body });

export const getRestaurantApplications = () => api('/restaurant-applications');
export const getMyRestaurantApplications = () => api('/my-restaurant-applications');
export const submitRestaurantApplication = (body) =>
  api('/restaurant-applications', { method: 'POST', body });
export const resubmitRestaurantApplication = (id, body) =>
  api(`/restaurant-application/${id}`, { method: 'PUT', body });
export const decideRestaurantApplication = (id, body) =>
  api(`/restaurant-application/${id}/decision`, { method: 'PUT', body });


export const getAdminOverview = () => api('/admin/overview');

export const getAdminRestaurants = () => api('/admin/restaurants');
export const updateAdminRestaurant = (id, body) =>
  api(`/admin/restaurants/${id}`, { method: 'PUT', body });
export const setAdminRestaurantVisibility = (id, active) =>
  api(`/admin/restaurants/${id}/visibility`, { method: 'PUT', body: { active } });
export const lockAdminRestaurant = (id, reason) =>
  api(`/admin/restaurants/${id}/lock`, { method: 'POST', body: { reason } });
export const unlockAdminRestaurant = (id) =>
  api(`/admin/restaurants/${id}/unlock`, { method: 'POST' });
export const deleteAdminRestaurant = (id) => api(`/admin/restaurants/${id}`, { method: 'DELETE' });

export const getAdminCouriers = () => api('/admin/couriers');
export const updateAdminCourier = (id, body) =>
  api(`/admin/couriers/${id}`, { method: 'PUT', body });
export const lockAdminCourier = (id, reason) =>
  api(`/admin/couriers/${id}/lock`, { method: 'POST', body: { reason } });
export const unlockAdminCourier = (id) => api(`/admin/couriers/${id}/unlock`, { method: 'POST' });
export const banAdminCourier = (id, reason) =>
  api(`/admin/couriers/${id}/ban`, { method: 'POST', body: { reason } });
export const deleteAdminCourier = (id) => api(`/admin/couriers/${id}`, { method: 'DELETE' });

export const getAdminCourierApplications = () => api('/admin/courier-applications');
export const getAdminOrders = (status) =>
  api(status ? `/admin/orders?status=${encodeURIComponent(status)}` : '/admin/orders');

let cachedCounts = { restaurants: 0, couriers: 0 };
export function useApplicationCounts() {
  const [counts, setCounts] = useState(cachedCounts);

  async function reload() {
    const [restaurants, couriers] = await Promise.all([
      getRestaurantApplications()
        .then((res) => res.data.data.filter((application) => application.status === 'PENDING').length)
        .catch(() => 0),
      getAdminCourierApplications()
        .then((res) => res.data.filter((application) => application.status === 'PENDING').length)
        .catch(() => 0)
    ]);
    cachedCounts = { restaurants, couriers };
    setCounts(cachedCounts);
  }

  useEffect(() => {
    reload();
  }, []);

  return { ...counts, total: counts.restaurants + counts.couriers, reload };
}

export const isLoggedIn = () => Boolean(localStorage.getItem('token'));

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user')) ?? {};
  } catch {
    return {};
  }
}

export function getUserName() {
  return getUser().name ?? null;
}

export function saveSession({ token, data }) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(data));
}

// US-10: authenticated delivery assignment.
export const getMyDeliveries = () => api('/deliveries/mine');
export const acceptDelivery = (orderId) =>
  api(`/deliveries/${encodeURIComponent(orderId)}/accept`, { method: 'POST' });

export const pickUpDelivery = (orderId) =>
  api(`/deliveries/${encodeURIComponent(orderId)}/pickup`, { method: 'POST' });
export const completeDelivery = (orderId) =>
  api(`/deliveries/${encodeURIComponent(orderId)}/deliver`, { method: 'POST' });
