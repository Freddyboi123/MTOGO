import { useEffect, useState } from 'react';
import { getRestaurantOrders, updateOrderStatus } from '../../../utils/api';
import useFeatureFlag from '../../../featureFlags/useFeatureFlag';
import Panel from '../../../components/Panel';
import DataTable from '../../../components/DataTable';
import cx from '../../../utils/cx';
import ui from '../../../styles/shared.module.css';

const restaurantOrderTexts = {
  title: 'Aktive ordrer',
  count: 'ordrer',
  loading: 'Henter ordrer…',
  error: 'Ordrerne kunne ikke hentes.',
  empty: 'Der er ingen ordrer endnu.',
  columns: {
    received: 'Modtaget',
    items: 'Indhold',
    address: 'Leveringsadresse',
    total: 'Beløb',
    status: 'Status',
    action: 'Handling'
  },
  startPreparing: 'Start tilberedning',
  markReady: 'Klar til afhentning',
  statusError: 'Status kunne ikke opdateres.',
  statuses: {
    RECEIVED: 'Ny ordre',
    PENDING: 'Afventer',
    ACCEPTED: 'Accepteret',
    PREPARING: 'Tilberedes',
    READY_FOR_PICKUP: 'Klar til afhentning',
    OUT_FOR_DELIVERY: 'På vej',
    DELIVERED: 'Leveret',
    CANCELLED: 'Annulleret'
  }
};

const texts = restaurantOrderTexts;

const nextStep = {
  RECEIVED: { status: 'PREPARING', label: texts.startPreparing },
  ACCEPTED: { status: 'PREPARING', label: texts.startPreparing },
  PREPARING: { status: 'READY_FOR_PICKUP', label: texts.markReady }
};

function formatPrice(price) {
  return `${Number(price).toLocaleString('da-DK', { maximumFractionDigits: 2 })} kr.`;
}

function formatTime(createdAt) {
  return createdAt
    ? new Date(createdAt).toLocaleString('da-DK', { dateStyle: 'short', timeStyle: 'short' })
    : '';
}

const orderColumns = [
  { key: 'createdAt', label: texts.columns.received, render: (order) => formatTime(order.createdAt) },
  {
    key: 'lines',
    label: texts.columns.items,
    render: (order) => (order.lines ?? []).map((line) => `${line.quantity} × ${line.itemName}`).join(', ')
  },
  {
    key: 'address',
    label: texts.columns.address,
    render: (order) => [order.street, [order.postalCode, order.city].filter(Boolean).join(' ')].filter(Boolean).join(', ')
  },
  { key: 'total', label: texts.columns.total, render: (order) => formatPrice(order.total) },
  { key: 'status', label: texts.columns.status, render: (order) => texts.statuses[order.status] ?? order.status }
];

export default function ActiveOrders({ restaurantId }) {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const orderStatus = useFeatureFlag('orderStatus');

  useEffect(() => {
    setStatus('loading');
    getRestaurantOrders(restaurantId)
      .then((res) => {
        setOrders(res.data ?? []);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, [restaurantId]);

  async function changeStatus(order, next) {
    setError('');
    try {
      const res = await updateOrderStatus(order.id, next);
      setOrders((current) => current.map((item) => (item.id === order.id ? res.data : item)));
    } catch {
      setError(texts.statusError);
    }
  }

  const actionColumn = {
    key: 'action',
    label: texts.columns.action,
    render: (order) => {
      const step = nextStep[order.status];
      return step ? (
        <button
          type="button"
          className={cx(ui.btn, ui.btnOutline, ui.btnSmall)}
          onClick={() => changeStatus(order, step.status)}
        >
          {step.label}
        </button>
      ) : null;
    }
  };

  const columns = orderStatus ? [...orderColumns, actionColumn] : orderColumns;

  return (
    <Panel title={texts.title} right={`${orders.length} ${texts.count}`}>
      {status === 'loading' && <p className={ui.fieldHint}>{texts.loading}</p>}
      {status === 'error' && <p className={ui.fieldHint}>{texts.error}</p>}
      {error && <p className={ui.fieldHint}>{error}</p>}
      {status === 'ready' && orders.length === 0 && <p className={ui.fieldHint}>{texts.empty}</p>}
      {status === 'ready' && orders.length > 0 && <DataTable columns={columns} rows={orders} rowKey="id" />}
    </Panel>
  );
}
