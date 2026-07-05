import React, { useState, useContext, useRef, useEffect } from 'react';
import { OrderContext } from '../context/OrderContext';
import { PlusCircle, ShoppingCart, ChevronDown, ChevronUp, Search, X } from 'lucide-react';

const OrderForm = () => {
  const { products, addOrder } = useContext(OrderContext);
  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showError, setShowError] = useState(false);
  
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const selectedProduct = selectedProductId ? products[selectedProductId] : null;
  const itemPrice = selectedProduct ? selectedProduct.calculated_price : 0;
  const totalPrice = itemPrice * quantity;

  // Sort products alphabetically
  const sortedProducts = Object.values(products).sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );

  // Filter products by search query
  const filteredProducts = sortedProducts.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.filament_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedProductId) {
      setShowError(true);
      return;
    }
    if (!clientName) return;

    addOrder({
      client_name: clientName,
      client_contact: clientContact,
      items: [{ product_id: selectedProductId, quantity, price: itemPrice }],
      total_price: totalPrice,
      status: 'New Request',
      notes: notes.trim(),
    });

    setClientName('');
    setClientContact('');
    setSelectedProductId('');
    setQuantity(1);
    setNotes('');
    setShowError(false);
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
        
        {/* Custom Searchable Product Select */}
        <div className="form-group" style={{ position: 'relative' }} ref={dropdownRef}>
          <label>Product</label>
          <button
            type="button"
            className="form-group-select-trigger"
            onClick={() => setIsOpen(!isOpen)}
            style={{
              width: '100%',
              background: 'var(--bg-input)',
              border: `1px solid ${showError ? '#ef4444' : isOpen ? 'var(--color-blue)' : 'var(--border-input)'}`,
              borderRadius: '0.5rem',
              padding: '0.5rem 1rem',
              color: selectedProduct ? 'white' : 'var(--text-muted)',
              textAlign: 'left',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.2s',
              boxShadow: isOpen ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : 'none',
            }}
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selectedProduct ? `${selectedProduct.name} - ${selectedProduct.filament_type}` : 'Select a product...'}
            </span>
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {showError && (
            <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              Please select a product.
            </p>
          )}

          {isOpen && (
            <div
              className="glass-panel animate-fade-in"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '4px',
                zIndex: 100,
                padding: '0.5rem',
                background: '#0f172a',
                border: '1px solid rgba(51, 65, 85, 0.9)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div style={{ position: 'relative' }}>
                <Search
                  size={14}
                  style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid var(--border-input)',
                    borderRadius: '0.375rem',
                    padding: '0.375rem 0.75rem 0.375rem 2rem',
                    color: 'white',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div
                style={{
                  maxHeight: '200px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                {filteredProducts.map((p) => {
                  const isSelected = p.product_id === selectedProductId;
                  return (
                    <button
                      key={p.product_id}
                      type="button"
                      onClick={() => {
                        setSelectedProductId(p.product_id);
                        setIsOpen(false);
                        setSearchTerm('');
                        setShowError(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        textAlign: 'left',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        border: 'none',
                        cursor: 'pointer',
                        background: isSelected ? 'var(--color-blue)' : 'transparent',
                        color: 'white',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div style={{ fontWeight: '600' }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: isSelected ? 'rgba(255, 255, 255, 0.8)' : 'var(--text-muted)' }}>
                        {p.filament_type} • {p.calculated_price.toFixed(2)} MZN
                      </div>
                    </button>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    No products found
                  </div>
                )}
              </div>
            </div>
          )}
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

        <div className="form-group">
          <label>Notes / Instructions</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any special instructions, colours, finishes…"
            rows={3}
            style={{
              width: '100%',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-input)',
              borderRadius: '0.5rem',
              padding: '0.5rem 1rem',
              color: 'white',
              resize: 'vertical',
              fontFamily: 'inherit',
              fontSize: '0.875rem',
              lineHeight: '1.5',
              outline: 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--color-blue)';
              e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border-input)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

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
