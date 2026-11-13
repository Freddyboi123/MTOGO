import DashboardLayout from './DashboardLayout';

const items = [
  { to: '/admin', label: 'Overblik' },
  { to: '/admin/restauranter', label: 'Restauranter' },
  { to: '/admin/chauffoerer', label: 'Chauffører' },
  { to: '/admin/ansoegninger/restaurant', label: 'Ansøgninger', count: '6' },
  { to: '/admin/ordrer', label: 'Ordrer' },
  { to: '/admin/indstillinger', label: 'Indstillinger' }
];

export default function AdminLayout({ breadcrumb, children }) {
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
