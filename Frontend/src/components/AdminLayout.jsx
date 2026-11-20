import DashboardLayout from './DashboardLayout';
import { useApplicationCounts } from '../utils/api';

export default function AdminLayout({ breadcrumb, children }) {
  const counts = useApplicationCounts();

  const items = [
    { to: '/admin', label: 'Overblik' },
    { to: '/admin/restauranter', label: 'Restauranter' },
    { to: '/admin/chauffoerer', label: 'Chauffører' },
    {
      to: '/admin/ansoegninger/restaurant',
      label: 'Ansøgninger',
      activePath: '/admin/ansoegninger',
      count: counts.total
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
