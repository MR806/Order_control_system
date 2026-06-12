import React, { useContext } from 'react';
import { OrderContext } from '../context/OrderContext';
import OrderCard from './OrderCard';

const COLUMNS = [
  { id: 'New Request', label: 'New Request', theme: 'blue' },
  { id: 'In Progress', label: 'In Progress', theme: 'amber' },
  { id: 'Pending Delivery', label: 'Pending Delivery', theme: 'purple' },
  { id: 'Delivered', label: 'Delivered', theme: 'emerald' }
];

const KanbanBoard = ({ onOpenTicket }) => {
  const { orders } = useContext(OrderContext);

  return (
    <div className="kanban-board">
      {COLUMNS.map(col => {
        const columnOrders = orders.filter(o => o.status === col.id);
        return (
          <div key={col.id} className="kanban-column glass-panel">
            <div className={`kanban-column-header theme-${col.theme}`}>
              <h3>{col.label}</h3>
              <span className="order-count">
                {columnOrders.length}
              </span>
            </div>
            <div className="kanban-column-body">
              {columnOrders.map(order => (
                <OrderCard key={order.order_id} order={order} onOpenTicket={onOpenTicket} />
              ))}
              {columnOrders.length === 0 && (
                <div className="empty-state">
                  No orders in this stage
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
