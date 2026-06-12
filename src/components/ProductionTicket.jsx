import React, { useContext, useRef } from 'react';
import { OrderContext } from '../context/OrderContext';
import { X, Download } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const ProductionTicket = ({ order, onClose }) => {
  const { products } = useContext(OrderContext);
  const printRef = useRef();

  if (!order) return null;

  const handleDownloadPDF = () => {
    const element = printRef.current;
    const opt = {
      margin:       0.5,
      filename:     `Order_${order.order_id}_Ticket.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>
            <Download size={20} className="icon-muted" />
            Digital Ticket
          </h2>
          <button onClick={onClose} className="btn-close">
            <X size={24} />
          </button>
        </div>
        
        <div className="modal-body">
          {/* We wrap the PDF content in a ref to only export this specific part */}
          <div ref={printRef} style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '10px', color: '#f8fafc' }}>
            <div className="ticket-meta" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '20px' }}>
              <div>
                <p className="meta-label">Order ID</p>
                <p className="meta-value text-blue">{order.order_id}</p>
              </div>
              <div className="text-right">
                <p className="meta-label">Queue Status</p>
                <span className="badge badge-outline">
                  {order.status}
                </span>
              </div>
            </div>

            <div className="ticket-items">
              <h3 className="section-title">Print Items</h3>
              {order.items.map((item, idx) => {
                const product = products[item.product_id];
                if (!product) return null;
                
                return (
                  <div key={idx} className="ticket-item" style={{ background: 'rgba(255,255,255,0.05)', display: 'flex', gap: '15px', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
                    
                    {product.photo && (
                      <div style={{ width: '80px', height: '80px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden', backgroundColor: '#000' }}>
                        <img 
                          src={product.photo} 
                          alt={product.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      </div>
                    )}
                    
                    <div className="item-quantity" style={{ height: 'fit-content' }}>
                      <span>{item.quantity}x</span>
                    </div>
                    
                    <div className="item-details" style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <p className="item-name" style={{ margin: 0 }}>{product.name}</p>
                        <p className="order-price" style={{ margin: 0, fontSize: '1.1rem' }}>
                          {(product.calculated_price * item.quantity).toFixed(2)} MZN
                        </p>
                      </div>
                      <div className="item-specs" style={{ display: 'flex', gap: '15px', marginTop: '10px', fontSize: '0.9rem', color: '#94a3b8' }}>
                        <p><span>Filament:</span> <span className="text-emerald" style={{ color: '#34d399' }}>{product.filament_type}</span></p>
                        <p><span>Time:</span> <span className="text-amber" style={{ color: '#fbbf24' }}>{product.print_time_hours}h</span></p>
                        <p><span>Unit:</span> <span style={{ color: '#cbd5e1' }}>{product.calculated_price.toFixed(2)} MZN</span></p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px', textAlign: 'right' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 5px 0' }}>Total Price</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#34d399', margin: 0 }}>
                {order.total_price.toFixed(2)} MZN
              </p>
            </div>
            
          </div>
        </div>
        
        <div className="modal-footer print-hidden">
          <button 
            onClick={handleDownloadPDF} 
            className="btn btn-secondary"
            style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
          >
            <Download size={18} />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductionTicket;
