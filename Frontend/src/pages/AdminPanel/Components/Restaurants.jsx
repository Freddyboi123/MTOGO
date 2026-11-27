import { useCallback, useEffect, useMemo, useState } from 'react';
import Panel from '../../../components/Panel';
import DataTable from '../../../components/DataTable';
import { cuisines } from '../../../components/RestaurantFilters';
import styles from '../AdminPanel.module.css';
import {deleteAdminRestaurant,getAdminRestaurants,lockAdminRestaurant,setAdminRestaurantVisibility,unlockAdminRestaurant,updateAdminRestaurant} from '../../../utils/api';
import PageHead from './PageHead';
import StatusTag from './StatusTag';
import Notice, { makeNotice } from './Notice';
import EditModal from './EditModal';
import ConfirmModal from './ConfirmModal';
import RowActions from './RowActions';

const statusOptions = [
  { value: '', label: 'Alle statusser' },
  { value: 'ACTIVE', label: 'Aktiv' },
  { value: 'PAUSED', label: 'Pause' },
  { value: 'FROZEN', label: 'Frosset' }
];

const fields = [
  { key: 'name', label: 'Restaurantnavn', wide: true },
  { key: 'phoneNumber', label: 'Telefon' },
  {
    key: 'cuisine',
    label: 'Køkken',
    type: 'select',
    options: [{ value: '', label: 'Intet valgt' }, ...cuisines]
  },
  { key: 'street', label: 'Vej og husnummer', wide: true },
  { key: 'postalCode', label: 'Postnummer' },
  { key: 'city', label: 'By' },
  { key: 'description', label: 'Beskrivelse', type: 'textarea', wide: true }
];

const contactPerson = (restaurant) =>
  `${restaurant.owner?.name ?? ''} ${restaurant.owner?.lastName ?? ''}`.trim();

function matchesSearch(restaurant, text) {
  if (!text) return true;
  const haystack = [
    restaurant.name,
    contactPerson(restaurant),
    restaurant.street,
    restaurant.postalCode,
    restaurant.city
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(text);
}

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState(null);
  const closeNotice = useCallback(() => setNotice(null), []);

  useEffect(() => {
    getAdminRestaurants()
      .then((res) => setRestaurants(res.data))
      .catch((err) => setNotice(makeNotice('Restauranter kunne ikke hentes', err.message, true)))
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => {
    const text = search.trim().toLowerCase();
    return restaurants.filter(
      (restaurant) => (!status || restaurant.status === status) && matchesSearch(restaurant, text)
    );
  }, [restaurants, search, status]);

  function replace(updated) {
    setRestaurants((current) => current.map((r) => (r.id === updated.id ? updated : r)));
  }

  function mailText(result) {
    return result.mailSent
      ? 'Restaurantens ejer er blevet notificeret på mail.'
      : 'Ændringen er gemt, men mailen til ejeren kunne ikke sendes.';
  }

  async function save(restaurant, values) {
    const res = await updateAdminRestaurant(restaurant.id, values);
    replace(res.data);
    setModal(null);
    setNotice(makeNotice(`${res.data.name} er opdateret`));
  }

  async function toggleVisibility(restaurant) {
    const res = await setAdminRestaurantVisibility(restaurant.id, !restaurant.active);
    replace(res.data);
    setModal(null);
    setNotice(makeNotice(`${res.data.name} er nu ${res.data.active ? 'synlig' : 'skjult'}`));
  }

  async function lock(restaurant, reason) {
    const res = await lockAdminRestaurant(restaurant.id, reason);
    replace(res.data.item);
    setModal(null);
    setNotice(makeNotice(`${restaurant.name} er låst`, mailText(res.data)));
  }

  async function unlock(restaurant) {
    const res = await unlockAdminRestaurant(restaurant.id);
    replace(res.data.item);
    setModal(null);
    setNotice(makeNotice(`${restaurant.name} er låst op`, mailText(res.data)));
  }

  async function remove(restaurant) {
    await deleteAdminRestaurant(restaurant.id);
    setRestaurants((current) => current.filter((r) => r.id !== restaurant.id));
    setModal(null);
    setNotice(makeNotice(`${restaurant.name} er slettet`));
  }

  const columns = [
    {
      key: 'name',
      label: 'Restaurant',
      render: (row) => (
        <>
          <strong>{row.name}</strong>
          <div className={styles.cellNote}>{row.owner?.email}</div>
        </>
      )
    },
    { key: 'contactPerson', label: 'Kontaktperson', render: (row) => contactPerson(row) },
    {
      key: 'address',
      label: 'Adresse',
      render: (row) => [row.street, [row.postalCode, row.city].filter(Boolean).join(' ')].filter(Boolean).join(', ')
    },
    { key: 'status', label: 'Status', render: (row) => <StatusTag status={row.status} /> },
    {
      key: 'actions',
      label: 'Handling',
      render: (row) => (
        <RowActions
          actions={[
            { label: 'Rediger', onClick: () => setModal({ kind: 'edit', row }) },
            {
              label: row.active ? 'Skjul' : 'Vis',
              disabled: row.locked,
              onClick: () => setModal({ kind: 'visibility', row })
            },
            row.locked
              ? { label: 'Lås op', onClick: () => setModal({ kind: 'unlock', row }) }
              : { label: 'Lås', onClick: () => setModal({ kind: 'lock', row }) },
            { label: 'Slet', danger: true, onClick: () => setModal({ kind: 'delete', row }) }
          ]}
        />
      )
    }
  ];

  const row = modal?.row;

  return (
    <>
      <PageHead
        title="Restauranter"
        subtitle="Ret oplysninger, skjul, lås eller slet restauranter. Låste restauranter kan først ændres igen, når du låser op."
      />
      <Notice notice={notice} onClose={closeNotice} />

      <Panel
        controls={
          <>
            <input
              className={styles.searchInput}
              placeholder="Søg på navn, kontaktperson eller adresse…"
              aria-label="Søg"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className={styles.selectInput}
              aria-label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </>
        }
        right={`${visible.length} af ${restaurants.length} restauranter`}
      >
        {loading ? (
          <p className={styles.emptyText}>Henter restauranter…</p>
        ) : visible.length === 0 ? (
          <p className={styles.emptyText}>Ingen restauranter matcher din søgning.</p>
        ) : (
          <DataTable columns={columns} rows={visible} rowKey="id" />
        )}
      </Panel>

      {modal?.kind === 'edit' && (
        <EditModal
          title={`Rediger ${row.name}`}
          subtitle={`Kontaktperson: ${contactPerson(row)} · ${row.owner?.email}`}
          fields={fields}
          initial={row}
          onSave={(values) => save(row, values)}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.kind === 'visibility' && (
        <ConfirmModal
          title={row.active ? `Skjul ${row.name}?` : `Vis ${row.name}?`}
          message={
            row.active
              ? 'Restauranten forsvinder fra oversigten og kan ikke modtage nye ordrer, indtil den vises igen.'
              : 'Restauranten bliver synlig for kunderne igen.'
          }
          confirmLabel={row.active ? 'Skjul restaurant' : 'Vis restaurant'}
          onConfirm={() => toggleVisibility(row)}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.kind === 'lock' && (
        <ConfirmModal
          title={`Lås ${row.name}`}
          message="Restauranten skjules og kan ikke ændre noget, før du låser op igen. Begrundelsen sendes til ejeren på mail."
          reasonLabel="Hvorfor låses restauranten, og hvad skal ændres?"
          reasonPlaceholder="Fx: Åbningstiderne mangler. Opdater dem og svar på denne mail."
          confirmLabel="Lås og send mail"
          danger
          onConfirm={(reason) => lock(row, reason)}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.kind === 'unlock' && (
        <ConfirmModal
          title={`Lås ${row.name} op?`}
          message="Restauranten bliver synlig igen, og ejeren kan ændre i den. Ejeren får besked på mail."
          confirmLabel="Lås op"
          onConfirm={() => unlock(row)}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.kind === 'delete' && (
        <ConfirmModal
          title={`Slet ${row.name}?`}
          message="Restauranten og dens menu slettes permanent og kan ikke gendannes. Restauranter med ordrer kan ikke slettes, og skal i stedet låses."
          confirmLabel="Slet restaurant"
          danger
          onConfirm={() => remove(row)}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
