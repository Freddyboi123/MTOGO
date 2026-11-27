import { useEffect, useRef, useState } from 'react';
import { getMyOrders } from '../../../utils/api';
import { orderHistoryTexts, restaurantMenu, restaurantOrderTexts } from '../../../data/mtogo';
import useFeatureFlag from '../../../featureFlags/useFeatureFlag';
import findStatusChanges from '../../../utils/statusChanges';
import DataTable from '../../../components/DataTable';
import OrderDetailsModal from './OrderDetailsModal';
import ui from '../../../styles/shared.module.css';
import styles from '../Profile.module.css';

const texts = orderHistoryTexts;
const REFRESH_MS = 30000;

function formatPrice(price) {
  return `${Number(price).toLocaleString('da-DK', { maximumFractionDigits: 2 })} ${restaurantMenu.currency}`;
}

function statusText(status) {
  return restaurantOrderTexts.statuses[status] ?? status;
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
  { key: 'status', label: texts.columns.status, render: (order) => statusText(order.status) }
];

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('loading');
  const [notices, setNotices] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const previousOrders = useRef([]);
  const orderStatus = useFeatureFlag('orderStatus');

  useEffect(() => {
    function loadOrders() {
      getMyOrders()
        .then((res) => {
          const current = res.data ?? [];
          const changed = findStatusChanges(previousOrders.current, current);
          if (changed.length > 0) {
            setNotices((existing) => [...changed.map((order) => ({ id: `${order.id}-${order.status}`, order })), ...existing]);
          }
          previousOrders.current = current;
          setOrders(current);
          setStatus('ready');
        })
        .catch(() => setStatus('error'));
    }

    loadOrders();
    if (!orderStatus) {
      return undefined;
    }
    const timer = setInterval(loadOrders, REFRESH_MS);
    return () => clearInterval(timer);
  }, [orderStatus]);

  // Looked up in the list, so the modal shows the newest status when the list refreshes.
  const selectedOrder = orders.find((order) => order.id === selectedId);

  return (
    <div className={ui.block}>
      <h2>{texts.title}</h2>
      <p className={styles.sectionHint}>{texts.hint}</p>
      {notices.length > 0 && (
        <ul className={styles.notices}>
          {notices.map(({ id, order }) => (
            <li key={id} className={styles.notice}>
              {texts.statusChangedPrefix} {order.restaurantName} {texts.statusChangedMiddle} {statusText(order.status)}
            </li>
          ))}
        </ul>
      )}
      {status === 'loading' && <p className={ui.fieldHint}>{texts.loading}</p>}
      {status === 'error' && <p className={ui.fieldHint}>{texts.error}</p>}
      {status === 'ready' && orders.length === 0 && <p className={ui.fieldHint}>{texts.empty}</p>}
      {status === 'ready' && orders.length > 0 && (
        <DataTable
          columns={columns}
          rows={orders}
          rowKey="id"
          selectedKey={selectedId}
          onSelect={(order) => setSelectedId(order.id)}
        />
      )}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          formatPrice={formatPrice}
          statusText={statusText}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
