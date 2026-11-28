import { Routes, Route, Navigate } from 'react-router-dom';
import { isLoggedIn } from './utils/api';
import Landing from './pages/Landing/Landing';
import useFeatureFlag from './featureFlags/useFeatureFlag';
import Restaurants from './pages/Restaurants/Restaurants';
import RestaurantMenu from './pages/RestaurantMenu';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Checkout from './pages/Checkout';
import ApplyCourier from './pages/ApplyCourier';
import Profile from './pages/Profile/Profile';
import FAQ from './pages/FAQ/FAQ';
import RestaurantPanel from './pages/RestaurantPanel/RestaurantPanel';
import CourierPanel from './pages/CourierPanel/CourierPanel';
import AdminPanel from './pages/AdminPanel/AdminPanel';

function ApplyRestaurantRedirect() {
  return isLoggedIn() ? (
    <Navigate to="/min-profil" state={{ section: 'Mine ansøgninger' }} replace />
  ) : (
    <Navigate to="/login" replace />
  );
}

export default function App() {
  const restaurantOverview = useFeatureFlag('restaurantOverview');
  const deliveryOverview = useFeatureFlag('deliveryOverview');
  const ordering = useFeatureFlag('ordering');

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      {restaurantOverview && <Route path="/restauranter" element={<Restaurants />} />}
      {restaurantOverview && <Route path="/restaurant/:id" element={<RestaurantMenu />} />}
      <Route path="/restaurant" element={<Navigate to="/restauranter" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/opret-konto" element={<SignUp />} />
      <Route path="/glemt-adgangskode" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      {ordering && <Route path="/betaling" element={<Checkout />} />}
      <Route
        path="/ansoeg/restaurant"
        element={<ApplyRestaurantRedirect />}
      />
      <Route path="/ansoeg/chauffoer" element={<ApplyCourier />} />
      <Route path="/min-profil" element={<Profile />} />
      <Route path="/help" element={<FAQ />} />
      <Route path="/restaurantpanel"element={<Navigate to="/min-profil" state={{ section: 'Mine restauranter' }} replace />}/>
      <Route path="/restaurantpanel/:id/*" element={<RestaurantPanel />} />
      {deliveryOverview && <Route path="/chauffoerpanel/*" element={<CourierPanel />} />}
      <Route path="/admin/*" element={<AdminPanel />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
