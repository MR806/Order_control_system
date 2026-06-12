import React, { useState } from 'react';
import { Trash2, TrendingUp, Cpu, ChevronDown, ChevronUp, Package, Percent, Target, Edit3, Star } from 'lucide-react';

export default function HistoryView({ history, deleteBudget, onEdit, toggleFavorite, isFavoritesView }) {
  const [expandedId, setExpandedId] = useState(null);

  const formatMZN = (value) => 
    new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(value);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleEdit = (e, budget) => {
    e.stopPropagation();
    onEdit(budget);
  };

  if (!history || history.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
          {isFavoritesView ? <Star size={48} className="text-amber" /> : <Cpu size={48} className="icon-muted" />}
        </div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          {isFavoritesView ? "No favorites yet" : "No saved products"}
        </h3>
        <p style={{ color: 'var(--text-muted)' }}>
          {isFavoritesView 
            ? "You haven't favored any products. Click the star on a product to add it here!" 
            : "Saved products will appear here. Use the calculator to create your first!"}
        </p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
          {isFavoritesView ? "Favorites" : "Product Database"}
        </h2>
        <span className="badge badge-blue">
          {history.length} saved
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {history.map((budget) => {
          const isExpanded = expandedId === budget.id;

          return (
            <div 
              key={budget.id} 
              className="order-card"
              style={{ cursor: 'pointer', borderColor: isExpanded ? 'var(--color-blue)' : 'var(--border-input)', padding: 0 }}
              onClick={() => toggleExpand(budget.id)}
            >
              <div style={{ padding: '1.5rem', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.25rem' }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(budget.id, budget.isFavorite); }}
                    className="btn-icon"
                    style={{ color: budget.isFavorite ? 'var(--color-amber)' : 'var(--text-muted)' }}
                  >
                    <Star size={18} fill={budget.isFavorite ? "currentColor" : "none"} />
                  </button>
                  <button 
                    onClick={(e) => handleEdit(e, budget)}
                    className="btn-icon"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteBudget(budget.id); }}
                    className="btn-icon"
                    style={{ color: '#ef4444' }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '1rem', paddingRight: '100px' }}>
                  {budget.photo && (
                    <img src={budget.photo} alt={budget.name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', marginRight: '12px' }} />
                  )}
                  <div>
                    <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem', lineHeight: 1.2, marginBottom: '4px' }}>{budget.name}</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(budget.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {isExpanded && budget.photo && (
                  <div className="animate-fade-in" style={{ marginBottom: '1rem' }}>
                    <img src={budget.photo} alt={budget.name} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px' }} />
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Material ({budget.weight}g)</span>
                    <span>{formatMZN(budget.materialCost)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Energy ({budget.time}h)</span>
                    <span>{formatMZN(budget.energyCost)}</span>
                  </div>
                  
                  {isExpanded && (
                    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-input)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Packaging</span>
                        <span>{formatMZN(budget.packaging || 0)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Margin</span>
                        <span>{budget.margin}%</span>
                      </div>
                    </div>
                  )}

                  <div style={{ borderTop: '1px solid var(--border-input)', paddingTop: '0.5rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 'bold' }}>
                    <span>Mfg. Cost</span>
                    <span>{formatMZN(budget.manufacturingCost)}</span>
                  </div>
                </div>

                <div style={{ background: isExpanded ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-input)', borderRadius: '0.75rem', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: isExpanded ? 'var(--color-blue)' : 'var(--text-muted)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <TrendingUp size={12} />
                      {budget.finalPrice ? 'Defined Price' : 'Suggested Price'}
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>
                      {formatMZN(budget.finalPrice ? budget.finalPrice : budget.sellPrice)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold' }}>Profit</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--color-emerald)' }}>
                      +{formatMZN(budget.finalPrice ? (budget.finalPrice - budget.manufacturingCost) : budget.profit)}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
