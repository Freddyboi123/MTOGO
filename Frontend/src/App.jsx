import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing/Landing';
import useFeatureFlag from './featureFlags/useFeatureFlag';
import Restaurants from './pages/Restaurants';
import RestaurantMenu from './pages/RestaurantMenu';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Checkout from './pages/Checkout';
import ApplyRestaurant from './pages/ApplyRestaurant';
import ApplyCourier from './pages/ApplyCourier';
import Profile from './pages/Profile/Profile';
import FAQ from './pages/FAQ/FAQ';
import RestaurantPanel from './pages/RestaurantPanel/RestaurantPanel';
import CourierPanel from './pages/CourierPanel';
import AdminRestaurants from './pages/AdminRestaurants';
import AdminCouriers from './pages/AdminCouriers';
import AdminRestaurantApplication from './pages/AdminRestaurantApplication/AdminRestaurantApplication';
import AdminCourierApplication from './pages/AdminCourierApplication';

export default function App() {
  const restaurantOverview = useFeatureFlag('restaurantOverview');
  const deliveryOverview = useFeatureFlag('deliveryOverview');

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
      <Route path="/betaling" element={<Checkout />} />
      <Route path="/ansoeg/restaurant" element={<ApplyRestaurant />} />
      <Route path="/ansoeg/chauffoer" element={<ApplyCourier />} />
      <Route path="/min-profil" element={<Profile />} />
      <Route path="/help" element={<FAQ />} />
      <Route path="/restaurantpanel"element={<Navigate to="/min-profil" state={{ section: 'Mine restauranter' }} replace />}/>
      <Route path="/restaurantpanel/:id/*" element={<RestaurantPanel />} />
      {deliveryOverview && <Route path="/chauffoerpanel/*" element={<CourierPanel />} />}
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
