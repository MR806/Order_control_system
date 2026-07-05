import React, { useContext, useState } from 'react';
import { OrderContext } from '../context/OrderContext';
import OrderCard from './OrderCard';

const COLUMNS = [
  { id: 'New Request',       label: 'New Request',       theme: 'blue' },
  { id: 'In Progress',       label: 'In Progress',       theme: 'amber' },
  { id: 'Pending Delivery',  label: 'Pending Delivery',  theme: 'purple' },
  { id: 'Delivered',         label: 'Delivered',         theme: 'emerald' },
];

const THEME_COLORS = {
  blue:    { active: '#3b82f6', bg: 'rgba(59,130,246,0.15)',  border: 'rgba(59,130,246,0.5)' },
  amber:   { active: '#fbbf24', bg: 'rgba(251,191,36,0.15)',  border: 'rgba(251,191,36,0.5)' },
  purple:  { active: '#a855f7', bg: 'rgba(168,85,247,0.15)',  border: 'rgba(168,85,247,0.5)' },
  emerald: { active: '#34d399', bg: 'rgba(52,211,153,0.15)',  border: 'rgba(52,211,153,0.5)' },
};

const KanbanBoard = ({ onOpenTicket }) => {
  const { orders, ordersLoading } = useContext(OrderContext);
  const [mobileCol, setMobileCol] = useState('New Request');

  if (ordersLoading) {
    return (
      <div className="kanban-board" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted, #94a3b8)' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(99,102,241,0.3)',
            borderTop: '3px solid #6366f1',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 12px'
          }} />
          <p style={{ fontSize: '0.9rem' }}>Loading orders…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ── Mobile Column Tabs ──────────────────────────────────── */}
      <div className="kanban-mobile-tabs">
        {COLUMNS.map((col) => {
          const count = orders.filter((o) => o.status === col.id).length;
          const colors = THEME_COLORS[col.theme];
          const isActive = mobileCol === col.id;
          return (
            <button
              key={col.id}
              className="kanban-mobile-tab"
              onClick={() => setMobileCol(col.id)}
              style={{
                borderColor: isActive ? colors.active : 'transparent',
                background: isActive ? colors.bg : 'rgba(30,41,59,0.4)',
                color: isActive ? colors.active : 'var(--text-muted)',
              }}
            >
              <span className="kanban-mobile-tab-label">{col.label}</span>
              <span
                className="kanban-mobile-tab-badge"
                style={{
                  background: isActive ? colors.active : 'rgba(255,255,255,0.08)',
                  color: isActive ? '#0f172a' : 'var(--text-muted)',
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Desktop: all columns / Mobile: single active column ── */}
      <div className="kanban-board">
        {COLUMNS.map((col) => {
          const columnOrders = orders.filter((o) => o.status === col.id);
          return (
            <div
              key={col.id}
              className={`kanban-column glass-panel kanban-col-${col.id === mobileCol ? 'active' : 'hidden'}`}
            >
              <div className={`kanban-column-header theme-${col.theme}`}>
                <h3>{col.label}</h3>
                <span className="order-count">{columnOrders.length}</span>
              </div>
              <div className="kanban-column-body">
                {columnOrders.map((order) => (
                  <OrderCard key={order.order_id} order={order} onOpenTicket={onOpenTicket} />
                ))}
                {columnOrders.length === 0 && (
                  <div className="empty-state">No orders in this stage</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default KanbanBoard;
