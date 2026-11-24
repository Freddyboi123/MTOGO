import { restaurantOrders } from '../../../data/mtogo';
import Panel from '../../../components/Panel';
import DataTable from '../../../components/DataTable';

const orderColumns = [
  { key: 'id', label: 'Ordre' },
  { key: 'customer', label: 'Kunde' },
  { key: 'items', label: 'Indhold' },
  { key: 'amount', label: 'Beløb' },
  { key: 'status', label: 'Status' },
  { key: 'action', label: 'Handling' }
];

export default function ActiveOrders() {
  return (
    <Panel title="Aktive ordrer" right={`${restaurantOrders.length} ordrer`}>
      <DataTable columns={orderColumns} rows={restaurantOrders} rowKey="id" />
    </Panel>
  );
}
