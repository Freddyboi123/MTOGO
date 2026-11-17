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
  adminRestaurants,
  restaurantApplications,
  restaurantTotals,
  selectedAdminRestaurant
} from '../data/mtogo';

const statuses = ['Alle statusser', 'Aktiv', 'Pauset'];

export default function AdminRestaurants() {
  const [selected, setSelected] = useState(adminRestaurants[0]);

  const columns = [
    { key: 'name', label: 'Restaurant' },
    { key: 'contact', label: 'Kontaktperson' },
    { key: 'area', label: 'Område' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={row.status === 'Aktiv' ? ui.tag : ui.tagWarn}>{row.status}</span>
      )
    },
    { key: 'action', label: 'Handling', render: () => 'Rediger →' }
  ];

  return (
    <AdminLayout breadcrumb="Administration  /  Restauranter">
      <div className={dash.head}>
        <div>
          <p className={ui.eyebrow}>Partneradministration</p>
          <h1 className={dash.title}>Restauranter</h1>
          <p className={dash.subtitle}>
            Hold styr på dine restaurantpartnere, åbning og tilgængelighed.
          </p>
        </div>
        <button className={cx(ui.btn, ui.btnDark, ui.btnSmall)}>+ Tilføj restaurant</button>
      </div>

      <div className={dash.statGrid}>
        <StatCard
          label="Restauranter i alt"
          value={restaurantTotals.all}
          note={restaurantTotals.area}
        />
        <StatCard
          label="Aktive partnere"
          value={restaurantTotals.active}
          note={`${restaurantTotals.paused} restauranter er pauset`}
        />
        <StatCard
          label="Nye ansøgninger"
          value={restaurantApplications.length}
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
        right={`${adminRestaurants.length} af ${restaurantTotals.all} restauranter`}
      >
        <DataTable
          columns={columns}
          rows={adminRestaurants}
          rowKey="name"
          selectedKey={selected.name}
          onSelect={setSelected}
          footLeft={`Viser 1–${adminRestaurants.length} af ${restaurantTotals.all} restauranter`}
          footRight="←  Forrige     1   2   3     Næste →"
        />
      </Panel>

      <div className={styles.detail}>
        <div>
          <h3>{selectedAdminRestaurant.name}</h3>
          <p>
            Restaurant-ID {selectedAdminRestaurant.id} · {selectedAdminRestaurant.address}
          </p>
          <p>Kontakt: {selectedAdminRestaurant.contact}</p>
          <p>{selectedAdminRestaurant.opening}</p>
        </div>
        <div className={styles.detailActions}>
          <button className={cx(ui.btn, ui.btnDark, ui.btnSmall)}>Rediger oplysninger</button>
          <button className={cx(ui.btn, ui.btnOutline, ui.btnSmall)}>Pause restaurant</button>
        </div>
      </div>
    </AdminLayout>
  );
}
