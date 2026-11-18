const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:6969/api';

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
export const addMenuItem = (categoryId, body) =>
  api(`/category/${categoryId}/items`, { method: 'POST', body });

export const getMyRestaurantApplications = () => api('/my-restaurant-applications');
export const submitRestaurantApplication = (body) =>
  api('/restaurant-applications', { method: 'POST', body });
export const resubmitRestaurantApplication = (id, body) =>
  api(`/restaurant-application/${id}`, { method: 'PUT', body });

export const isLoggedIn = () => Boolean(localStorage.getItem('token'));

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function saveSession({ token, data }) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(data));
}
