import React, { useContext, useState } from 'react';
import { OrderContext } from '../context/OrderContext';
import { ChevronRight, Printer, Trash2, AlertTriangle } from 'lucide-react';

const STATUS_FLOW = ['New Request', 'In Progress', 'Pending Delivery', 'Delivered'];

const OrderCard = ({ order, onOpenTicket }) => {
  const { updateOrderStatus, deleteOrder } = useContext(OrderContext);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const currentStatusIndex = STATUS_FLOW.indexOf(order.status);
  const nextStatus = STATUS_FLOW[currentStatusIndex + 1];

  const handleDelete = () => {
    deleteOrder(order.order_id);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="order-card" style={{ position: 'relative', overflow: 'hidden' }}>
      
      {/* Delete Confirmation Overlay */}
      {showDeleteConfirm && (
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(4px)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          textAlign: 'center'
        }} className="animate-fade-in">
          <AlertTriangle color="#ef4444" size={28} style={{ marginBottom: '8px' }} />
          <p style={{ fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>Delete Order?</p>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '12px' }}>This action cannot be undone.</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setShowDeleteConfirm(false)}
              style={{ backgroundColor: '#334155', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', transition: 'background 0.2s' }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#475569'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#334155'}
            >
              Cancel
            </button>
            <button 
              onClick={handleDelete}
              style={{ backgroundColor: '#ef4444', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', transition: 'background 0.2s' }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
            >
              Delete
            </button>
          </div>
        </div>
      )}

      <div className="order-card-header">
        <div>
          <span className="badge badge-blue">{order.order_id}</span>
          <h3 className="client-name">{order.client_name}</h3>
        </div>
        <p className="order-price">{order.total_price.toFixed(2)} MZN</p>
      </div>
      
      <div className="order-card-actions">
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onOpenTicket(order)}
            className="btn-icon"
            title="Digital Ticket"
          >
            <Printer size={16} />
          </button>
          
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="btn-icon"
            title="Delete Order"
            style={{ color: 'rgba(239, 68, 68, 0.7)' }}
            onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
            onMouseOut={(e) => e.currentTarget.style.color = 'rgba(239, 68, 68, 0.7)'}
          >
            <Trash2 size={16} />
          </button>
        </div>
        
        {nextStatus && (
          <button
            onClick={() => updateOrderStatus(order.order_id, nextStatus)}
            className="btn-icon btn-move"
          >
            <span>Move</span>
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
