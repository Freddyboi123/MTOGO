import { useEffect, useState } from 'react';
import { getMyOrders } from '../../../utils/api';
import { orderHistoryTexts, restaurantMenu, restaurantOrderTexts } from '../../../data/mtogo';
import DataTable from '../../../components/DataTable';
import ui from '../../../styles/shared.module.css';
import styles from '../Profile.module.css';

const texts = orderHistoryTexts;

function formatPrice(price) {
  return `${Number(price).toLocaleString('da-DK', { maximumFractionDigits: 2 })} ${restaurantMenu.currency}`;
}

const columns = [
  {
    key: 'createdAt',
    label: texts.columns.date,
    render: (order) =>
      order.createdAt ? new Date(order.createdAt).toLocaleDateString('da-DK', { dateStyle: 'medium' }) : ''
  },
  { key: 'restaurantName', label: texts.columns.restaurant },
  { key: 'total', label: texts.columns.total, render: (order) => formatPrice(order.total) },
  {
    key: 'status',
    label: texts.columns.status,
    render: (order) => restaurantOrderTexts.statuses[order.status] ?? order.status
  }
];

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    getMyOrders()
      .then((res) => {
        setOrders(res.data ?? []);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  return (
    <div className={ui.block}>
      <h2>{texts.title}</h2>
      <p className={styles.sectionHint}>{texts.hint}</p>
      {status === 'loading' && <p className={ui.fieldHint}>{texts.loading}</p>}
      {status === 'error' && <p className={ui.fieldHint}>{texts.error}</p>}
      {status === 'ready' && orders.length === 0 && <p className={ui.fieldHint}>{texts.empty}</p>}
      {status === 'ready' && orders.length > 0 && <DataTable columns={columns} rows={orders} rowKey="id" />}
    </div>
  );
}
