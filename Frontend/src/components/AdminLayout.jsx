import DashboardLayout from './DashboardLayout';
import { courierApplications, restaurantApplications } from '../data/mtogo';

export default function AdminLayout({ breadcrumb, children }) {
  const pendingApplications = restaurantApplications.length + courierApplications.length;

  const items = [
    { to: '/admin', label: 'Overblik' },
    { to: '/admin/restauranter', label: 'Restauranter' },
    { to: '/admin/chauffoerer', label: 'Chauffører' },
    {
      to: '/admin/ansoegninger/restaurant',
      label: 'Ansøgninger',
      count: pendingApplications
    },
    { to: '/admin/ordrer', label: 'Ordrer' },
    { to: '/admin/indstillinger', label: 'Indstillinger' }
  ];

  return (
    <DashboardLayout
      role="Administration"
      items={items}
      breadcrumb={breadcrumb}
      user="Administrator"
    >
      {children}
    </DashboardLayout>
  );
}
