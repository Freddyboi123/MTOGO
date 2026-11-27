import { useEffect, useState } from 'react';
import Panel from '../../../components/Panel';
import DataTable from '../../../components/DataTable';
import styles from '../AdminPanel.module.css';
import { getAdminOrders } from '../../../utils/api';
import PageHead from './PageHead';
import StatusTag from './StatusTag';

const filters = [
  { value: '', label: 'Alle' },
  { value: 'COMPLETED', label: 'Afsluttet' },
  { value: 'CANCELLED', label: 'Annulleret' },
  { value: 'PROCESSING', label: 'Under behandling' },
  { value: 'REFUNDED', label: 'Refunderet' },
  { value: 'REQUEST', label: 'Anmodning' }
];

const money = new Intl.NumberFormat('da-DK', { style: 'currency', currency: 'DKK' });

const columns = [
  {
    key: 'id',
    label: 'Ordre',
    render: (row) => <strong>#{row.id.slice(0, 8).toUpperCase()}</strong>
  },
  { key: 'restaurantName', label: 'Restaurant' },
  {
    key: 'customer',
    label: 'Kunde',
    render: (row) => `${row.customer?.name ?? ''} ${row.customer?.lastName ?? ''}`.trim()
  },
  {
    key: 'address',
    label: 'Leveringsadresse',
    render: (row) => [row.street, [row.postalCode, row.city].filter(Boolean).join(' ')].filter(Boolean).join(', ')
  },
  { key: 'total', label: 'Total', render: (row) => (row.total == null ? '–' : money.format(row.total)) },
  {
    key: 'createdAt',
    label: 'Oprettet',
    render: (row) => new Date(row.createdAt).toLocaleString('da-DK', { dateStyle: 'short', timeStyle: 'short' })
  },
  { key: 'adminStatus', label: 'Status', render: (row) => <StatusTag status={row.adminStatus} /> }
];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let current = true;
    setLoading(true);
    getAdminOrders(filter)
      .then((res) => {
        if (!current) return;
        setOrders(res.data);
        setError('');
      })
      .catch((err) => current && setError(err.message))
      .finally(() => current && setLoading(false));
    return () => {
      current = false;
    };
  }, [filter]);

  return (
    <>
      <PageHead title="Ordrer" subtitle="Alle ordrer på tværs af restauranter. Sortér efter status." />
      {error && <p className={styles.errorText}>{error}</p>}

      <Panel
        controls={
          <div className={styles.chips}>
            {filters.map((item) => (
              <button
                key={item.value}
                type="button"
                className={filter === item.value ? styles.chipActive : styles.chip}
                onClick={() => setFilter(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        }
        right={`${orders.length} ordrer`}
      >
        {loading ? (
          <p className={styles.emptyText}>Henter ordrer…</p>
        ) : orders.length === 0 ? (
          <p className={styles.emptyText}>Ingen ordrer med den status.</p>
        ) : (
          <DataTable columns={columns} rows={orders} rowKey="id" />
        )}
      </Panel>
    </>
  );
}
