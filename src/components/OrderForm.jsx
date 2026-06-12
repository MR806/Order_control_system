import React, { useState, useContext } from 'react';
import { OrderContext } from '../context/OrderContext';
import { PlusCircle, ShoppingCart } from 'lucide-react';

const OrderForm = () => {
  const { products, addOrder } = useContext(OrderContext);
  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);

  const selectedProduct = selectedProductId ? products[selectedProductId] : null;
  const itemPrice = selectedProduct ? selectedProduct.calculated_price : 0;
  const totalPrice = itemPrice * quantity;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!clientName || !selectedProductId) return;

    addOrder({
      client_name: clientName,
      client_contact: clientContact,
      items: [{ product_id: selectedProductId, quantity, price: itemPrice }],
      total_price: totalPrice,
      status: 'New Request'
    });

    setClientName('');
    setClientContact('');
    setSelectedProductId('');
    setQuantity(1);
  };

  return (
    <div className="glass-panel order-form-container">
      <h2 className="panel-title">
        <PlusCircle className="icon-blue" />
        New Order Intake
      </h2>
      <form onSubmit={handleSubmit} className="order-form">
        <div className="form-group">
          <label>Client Name</label>
          <input
            type="text"
            required
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="John Doe"
          />
        </div>
        <div className="form-group">
          <label>Contact Info</label>
          <input
            type="text"
            value={clientContact}
            onChange={(e) => setClientContact(e.target.value)}
            placeholder="Email or Phone"
          />
        </div>
        <div className="form-group">
          <label>Product</label>
          <select
            required
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
          >
            <option value="" disabled>Select a product...</option>
            {Object.values(products).map(p => (
              <option key={p.product_id} value={p.product_id}>
                {p.name} - {p.filament_type}
              </option>
            ))}
          </select>
        </div>
        
        {selectedProduct && (
          <div className="form-row animate-fade-in">
            <div className="form-group flex-1">
              <label>Quantity</label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="form-group flex-1">
              <label>Unit Price</label>
              <div className="price-display">
                {itemPrice.toFixed(2)} MZN
              </div>
            </div>
          </div>
        )}

        <div className="form-actions">
          <div className="total-wrapper">
            <p>Total Price</p>
            <p className="total-price">{totalPrice.toFixed(2)} MZN</p>
          </div>
          <button type="submit" className="btn btn-primary">
            <ShoppingCart size={18} />
            Add Order
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrderForm;
