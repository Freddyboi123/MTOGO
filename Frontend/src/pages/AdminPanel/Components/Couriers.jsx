import { useCallback, useEffect, useMemo, useState } from 'react';
import Panel from '../../../components/Panel';
import DataTable from '../../../components/DataTable';
import styles from '../AdminPanel.module.css';
import {
  banAdminCourier,
  deleteAdminCourier,
  getAdminCouriers,
  lockAdminCourier,
  unlockAdminCourier,
  updateAdminCourier
} from '../../../utils/api';
import PageHead from './PageHead';
import StatusTag from './StatusTag';
import Notice, { makeNotice } from './Notice';
import EditModal from './EditModal';
import ConfirmModal from './ConfirmModal';
import RowActions from './RowActions';

const statusOptions = [
  { value: '', label: 'Alle statusser' },
  { value: 'EN_ROUTE_TO_ORDER', label: 'På vej til ordre' },
  { value: 'DELIVERING', label: 'Levering i gang' },
  { value: 'OFFLINE', label: 'Offline' },
  { value: 'AVAILABLE', label: 'Tilgængelig' },
  { value: 'FROZEN', label: 'Frosset' }
];

const fields = [
  { key: 'name', label: 'Fornavn' },
  { key: 'lastName', label: 'Efternavn' },
  { key: 'email', label: 'E-mail', type: 'email', wide: true },
  { key: 'phoneNumber', label: 'Telefon', wide: true }
];

const fullName = (courier) => `${courier.user?.name ?? ''} ${courier.user?.lastName ?? ''}`.trim();

function matchesSearch(courier, text) {
  if (!text) return true;
  return [fullName(courier), courier.user?.email, courier.user?.phoneNumber]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .includes(text);
}

export default function Couriers() {
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState(null);
  const closeNotice = useCallback(() => setNotice(null), []);

  const load = useCallback(() => {
    return getAdminCouriers()
      .then((res) => setCouriers(res.data))
      .catch((err) => setNotice(makeNotice('Chauffører kunne ikke hentes', err.message, true)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const text = search.trim().toLowerCase();
    return couriers.filter(
      (courier) => (!status || courier.status === status) && matchesSearch(courier, text)
    );
  }, [couriers, search, status]);

  function replace(updated) {
    setCouriers((current) => current.map((c) => (c.id === updated.id ? updated : c)));
  }

  function mailText(result) {
    return result.mailSent
      ? 'Chaufføren er blevet notificeret på mail.'
      : 'Ændringen er gemt, men mailen til chaufføren kunne ikke sendes.';
  }

  async function save(courier, values) {
    const res = await updateAdminCourier(courier.id, values);
    replace(res.data);
    setModal(null);
    setNotice(makeNotice(`${fullName(res.data)} er opdateret`));
  }

  async function lock(courier, reason) {
    const res = await lockAdminCourier(courier.id, reason);
    replace(res.data.item);
    setModal(null);
    setNotice(makeNotice(`${fullName(courier)} er låst`, mailText(res.data)));
  }

  async function unlock(courier) {
    const res = await unlockAdminCourier(courier.id);
    replace(res.data.item);
    setModal(null);
    setNotice(makeNotice(`${fullName(courier)} er låst op`, mailText(res.data)));
  }

  async function remove(courier) {
    await deleteAdminCourier(courier.id);
    setCouriers((current) => current.filter((c) => c.id !== courier.id));
    setModal(null);
    setNotice(makeNotice(`${fullName(courier)} er slettet`));
  }

  async function ban(courier, reason) {
    await banAdminCourier(courier.id, reason);
    await load();
    setModal(null);
    setNotice(
      makeNotice(
        `${fullName(courier)} er banlyst`,
        'E-mailen er spærret, så personen ikke kan oprette sig som chauffør igen.'
      )
    );
  }

  const columns = [
    {
      key: 'name',
      label: 'Chauffør',
      render: (row) => (
        <>
          <strong>{fullName(row)}</strong>
          <div className={styles.cellNote}>{row.user?.email}</div>
        </>
      )
    },
    { key: 'email', label: 'E-mail', render: (row) => row.user?.email },
    { key: 'phoneNumber', label: 'Telefon', render: (row) => row.user?.phoneNumber },
    { key: 'status', label: 'Status', render: (row) => <StatusTag status={row.status} /> },
    {
      key: 'actions',
      label: 'Handling',
      render: (row) => (
        <RowActions
          actions={[
            { label: 'Rediger', onClick: () => setModal({ kind: 'edit', row }) },
            row.locked
              ? { label: 'Lås op', onClick: () => setModal({ kind: 'unlock', row }) }
              : { label: 'Lås', onClick: () => setModal({ kind: 'lock', row }) },
            {
              label: 'Banlys',
              danger: true,
              onClick: () => setModal({ kind: 'ban', row })
            },
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
        title="Chauffører"
        subtitle="Ret oplysninger, lås, slet eller banlys chauffører. Chauffører oprettes ikke her, de administreres kun."
      />
      <Notice notice={notice} onClose={closeNotice} />

      <Panel
        controls={
          <>
            <input
              className={styles.searchInput}
              placeholder="Søg på navn, e-mail eller telefon…"
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
        right={`${visible.length} af ${couriers.length} chauffører`}
      >
        {loading ? (
          <p className={styles.emptyText}>Henter chauffører…</p>
        ) : visible.length === 0 ? (
          <p className={styles.emptyText}>Ingen chauffører matcher din søgning.</p>
        ) : (
          <DataTable columns={columns} rows={visible} rowKey="id" />
        )}
      </Panel>

      {modal?.kind === 'edit' && (
        <EditModal
          title={`Rediger ${fullName(row)}`}
          subtitle={row.user?.email}
          fields={fields}
          initial={row.user}
          onSave={(values) => save(row, values)}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.kind === 'lock' && (
        <ConfirmModal
          title={`Lås ${fullName(row)}`}
          message="Chaufføren sættes offline og kan ikke tage ordrer, før du låser op igen. Begrundelsen sendes på mail."
          reasonLabel="Hvorfor låses chaufføren, og hvad skal ændres?"
          reasonPlaceholder="Fx: Dit kørekort er udløbet. Send nyt kørekort og svar på denne mail."
          confirmLabel="Lås og send mail"
          danger
          onConfirm={(reason) => lock(row, reason)}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.kind === 'unlock' && (
        <ConfirmModal
          title={`Lås ${fullName(row)} op?`}
          message="Chaufføren kan komme online igen og får besked på mail."
          confirmLabel="Lås op"
          onConfirm={() => unlock(row)}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.kind === 'ban' && (
        <ConfirmModal
          title={`Banlys ${fullName(row)}?`}
          message="E-mailen spærres permanent, så personen ikke kan oprette sig som chauffør igen. Chaufføren mister adgangen med det samme."
          reasonLabel="Begrundelse (valgfri)"
          reasonRequired={false}
          confirmLabel="Banlys chauffør"
          danger
          onConfirm={(reason) => ban(row, reason)}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.kind === 'delete' && (
        <ConfirmModal
          title={`Slet ${fullName(row)}?`}
          message="Chaufføren slettes permanent. Chauffører med leveringer kan ikke slettes, og skal i stedet låses eller banlyses. Sletning forhindrer ikke, at personen kan oprette sig igen."
          confirmLabel="Slet chauffør"
          danger
          onConfirm={() => remove(row)}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
