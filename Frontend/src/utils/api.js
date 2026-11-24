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

export const getMyRestaurants = () => api('/my-restaurants');
export const getMyRestaurant = (id) => api(`/my-restaurants/${id}`);
export const setRestaurantVisibility = (id, active) =>
  api(`/my-restaurants/${id}/visibility`, { method: 'PUT', body: { active } });
export const getAvailableDeliveries = () => api('/deliveries/available');
export const placeOrder = (body) => api('/orders', { method: 'POST', body });
export const getRestaurantOrders = (restaurantId) => api(`/my-restaurants/${restaurantId}/orders`);
export const addMenuItem = (categoryId, body) =>
  api(`/category/${categoryId}/items`, { method: 'POST', body });

export const getRestaurantApplications = () => api('/restaurant-applications');
export const getMyRestaurantApplications = () => api('/my-restaurant-applications');
export const submitRestaurantApplication = (body) =>
  api('/restaurant-applications', { method: 'POST', body });
export const resubmitRestaurantApplication = (id, body) =>
  api(`/restaurant-application/${id}`, { method: 'PUT', body });
export const decideRestaurantApplication = (id, body) =>
  api(`/restaurant-application/${id}/decision`, { method: 'PUT', body });


let cachedRestaurantCount = 0;
export function useApplicationCounts() {
  const [restaurants, setRestaurants] = useState(cachedRestaurantCount);
  const couriers = 0;

  useEffect(() => {
    async function loadCounts() {
      try {
        const res = await getRestaurantApplications();
        cachedRestaurantCount = res.data.data.filter(
          (application) => application.status === 'PENDING'
        ).length;
      } catch {
        cachedRestaurantCount = 0;
      }
      setRestaurants(cachedRestaurantCount);
    }
    loadCounts();
  }, []);

  return { restaurants, couriers, total: restaurants + couriers };
}

export const isLoggedIn = () => Boolean(localStorage.getItem('token'));

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function getUserName() {
  try {
    return JSON.parse(localStorage.getItem('user'))?.name ?? null;
  } catch {
    return null;
  }
}

export function saveSession({ token, data }) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(data));
}

// US-10: authenticated delivery assignment.
export const getMyDeliveries = () => api('/deliveries/mine');
export const acceptDelivery = (orderId) =>
  api(`/deliveries/${encodeURIComponent(orderId)}/accept`, { method: 'POST' });
