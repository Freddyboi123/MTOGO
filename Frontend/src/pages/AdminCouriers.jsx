import { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import StatCard from '../components/StatCard';
import Panel from '../components/Panel';
import DataTable from '../components/DataTable';
import cx from '../utils/cx';
import ui from '../styles/shared.module.css';
import dash from '../components/DashboardLayout.module.css';
import styles from './Admin.module.css';
import {
  adminCouriers,
  courierApplications,
  courierTotals,
  selectedAdminCourier
} from '../data/mtogo';

const statuses = ['Alle statusser', 'Tilgængelig', 'På levering', 'Offline', 'Pauset'];

export default function AdminCouriers() {
  const [selected, setSelected] = useState(adminCouriers[0]);

  const columns = [
    { key: 'name', label: 'Chauffør' },
    { key: 'email', label: 'E-mail' },
    { key: 'vehicle', label: 'Køretøj' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={row.status === 'Tilgængelig' ? ui.tag : ui.tagWarn}>{row.status}</span>
      )
    },
    { key: 'action', label: 'Handling', render: () => 'Rediger →' }
  ];

  return (
    <AdminLayout breadcrumb="Administration  /  Chauffører">
      <div className={dash.head}>
        <div>
          <p className={ui.eyebrow}>Partneradministration</p>
          <h1 className={dash.title}>Chauffører</h1>
          <p className={dash.subtitle}>
            Administrer adgang, leveringsområder og dine aktive chauffører.
          </p>
        </div>
        <button className={cx(ui.btn, ui.btnDark, ui.btnSmall)}>+ Tilføj chauffør</button>
      </div>

      <div className={dash.statGrid}>
        <StatCard
          label="Godkendte chauffører"
          value={courierTotals.approved}
          note="Klar til at levere"
        />
        <StatCard
          label="Online lige nu"
          value={courierTotals.online}
          note={`${courierTotals.onTrip} på tur · ${courierTotals.available} tilgængelige`}
        />
        <StatCard
          label="Nye ansøgninger"
          value={courierApplications.length}
          note="Afventer behandling"
        />
      </div>

      <Panel
        controls={
          <>
            <input
              className={styles.searchInput}
              placeholder="Søg efter navn eller e-mail…"
              aria-label="Søg"
            />
            <select className={styles.selectInput} defaultValue={statuses[0]} aria-label="Status">
              {statuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </>
        }
        right={`${adminCouriers.length} af ${courierTotals.approved} chauffører`}
      >
        <DataTable
          columns={columns}
          rows={adminCouriers}
          rowKey="name"
          selectedKey={selected.name}
          onSelect={setSelected}
          footLeft={`Viser 1–${adminCouriers.length} af ${courierTotals.approved} chauffører`}
          footRight="←  Forrige     1   2   3     Næste →"
        />
      </Panel>

      <div className={styles.detail}>
        <div>
          <h3>{selectedAdminCourier.name}</h3>
          <p>
            Chauffør-ID {selectedAdminCourier.id} · {selectedAdminCourier.area} ·{' '}
            {selectedAdminCourier.approved}
          </p>
          <p>Kontakt: {selectedAdminCourier.contact}</p>
          <p>{selectedAdminCourier.record}</p>
        </div>
        <div className={styles.detailActions}>
          <button className={cx(ui.btn, ui.btnDark, ui.btnSmall)}>Rediger chauffør</button>
          <button className={cx(ui.btn, ui.btnOutline, ui.btnSmall)}>Deaktiver adgang</button>
        </div>
      </div>
    </AdminLayout>
  );
}
