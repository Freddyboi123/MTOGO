export default function findStatusChanges(previousOrders, currentOrders) {
  const previousStatus = new Map(previousOrders.map((order) => [order.id, order.status]));

  return currentOrders.filter(
    (order) => previousStatus.has(order.id) && previousStatus.get(order.id) !== order.status
  );
}
