import { Navigate, Route, Routes } from 'react-router-dom';
import { isLoggedIn } from '../../utils/api';
import AdminLayout from './Components/AdminLayout';
import Overview from './Components/Overview';
import Restaurants from './Components/Restaurants';
import Couriers from './Components/Couriers';
import Applications from './Components/Applications';
import Orders from './Components/Orders';

const sections = [
  { path: '/', label: 'Overblik' },
  { path: '/restauranter', label: 'Restauranter' },
  { path: '/chauffoerer', label: 'Chauffører' },
  { path: '/ansoegninger/*', label: 'Ansøgninger' },
  { path: '/ordrer', label: 'Ordrer' }
];


export default function AdminPanel() {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      {sections.map((section) => (
        <Route
          key={section.path}
          path={section.path}
          element={
            <AdminLayout breadcrumb={`Administration  /  ${section.label}`}>
              {section.path === '/' && <Overview />}
              {section.path === '/restauranter' && <Restaurants />}
              {section.path === '/chauffoerer' && <Couriers />}
              {section.path === '/ansoegninger/*' && (
                <Routes>
                  <Route path="restaurant" element={<Applications type="restaurant" />} />
                  <Route path="chauffoer" element={<Applications type="chauffoer" />} />
                  <Route path="*" element={<Navigate to="restaurant" replace />} />
                </Routes>
              )}
              {section.path === '/ordrer' && <Orders />}
            </AdminLayout>
          }
        />
      ))}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
