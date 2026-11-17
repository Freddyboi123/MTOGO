import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import RestaurantMenu from './pages/RestaurantMenu';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import Checkout from './pages/Checkout';
import ApplyRestaurant from './pages/ApplyRestaurant';
import ApplyCourier from './pages/ApplyCourier';
import Profile from './pages/Profile';
import RestaurantPanel from './pages/RestaurantPanel';
import CourierPanel from './pages/CourierPanel';
import AdminRestaurants from './pages/AdminRestaurants';
import AdminCouriers from './pages/AdminCouriers';
import AdminRestaurantApplication from './pages/AdminRestaurantApplication';
import AdminCourierApplication from './pages/AdminCourierApplication';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/restaurant" element={<RestaurantMenu />} />
      <Route path="/login" element={<Login />} />
      <Route path="/opret-konto" element={<SignUp />} />
      <Route path="/glemt-adgangskode" element={<ForgotPassword />} />
      <Route path="/betaling" element={<Checkout />} />
      <Route path="/ansoeg/restaurant" element={<ApplyRestaurant />} />
      <Route path="/ansoeg/chauffoer" element={<ApplyCourier />} />
      <Route path="/min-profil" element={<Profile />} />
      <Route path="/restaurantpanel/*" element={<RestaurantPanel />} />
      <Route path="/chauffoerpanel/*" element={<CourierPanel />} />
      <Route path="/admin" element={<Navigate to="/admin/restauranter" replace />} />
      <Route path="/admin/restauranter" element={<AdminRestaurants />} />
      <Route path="/admin/chauffoerer" element={<AdminCouriers />} />
      <Route
        path="/admin/ansoegninger/restaurant"
        element={<AdminRestaurantApplication />}
      />
      <Route path="/admin/ansoegninger/chauffoer" element={<AdminCourierApplication />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
