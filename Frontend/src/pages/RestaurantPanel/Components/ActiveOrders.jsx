import { useEffect, useState } from 'react';
import { restaurantMenu, restaurantOrderTexts } from '../../../data/mtogo';
import { getRestaurantOrders } from '../../../utils/api';
import Panel from '../../../components/Panel';
import DataTable from '../../../components/DataTable';
import ui from '../../../styles/shared.module.css';

const texts = restaurantOrderTexts;

function formatPrice(price) {
  return `${Number(price).toLocaleString('da-DK', { maximumFractionDigits: 2 })} ${restaurantMenu.currency}`;
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

  useEffect(() => {
    setStatus('loading');
    getRestaurantOrders(restaurantId)
      .then((res) => {
        setOrders(res.data ?? []);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, [restaurantId]);

  return (
    <Panel title={texts.title} right={`${orders.length} ${texts.count}`}>
      {status === 'loading' && <p className={ui.fieldHint}>{texts.loading}</p>}
      {status === 'error' && <p className={ui.fieldHint}>{texts.error}</p>}
      {status === 'ready' && orders.length === 0 && <p className={ui.fieldHint}>{texts.empty}</p>}
      {status === 'ready' && orders.length > 0 && (
        <DataTable columns={orderColumns} rows={orders} rowKey="id" />
      )}
    </Panel>
  );
}
