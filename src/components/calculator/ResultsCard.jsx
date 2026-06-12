import React, { useState } from 'react';
import { Save, CheckCircle } from 'lucide-react';

export default function ResultsCard({ results, formData, saveBudget, resetForm }) {
  const [showToast, setShowToast] = useState(false);

  const formatMZN = (value) => {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN'
    }).format(value);
  };

  const handleSave = () => {
    if (!formData.name) return;
    saveBudget();
    resetForm();
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const obterAnaliseConcorrencia = () => {
    if (!formData.precoConcorrente || Number(formData.precoConcorrente) <= 0) return null;

    const precoFinal = results.sellPrice;
    const precoConcorrenteNum = Number(formData.precoConcorrente);
    const diferenca = precoFinal - precoConcorrenteNum;
    const diferencaPercentual = (diferenca / precoConcorrenteNum) * 100;

    if (precoFinal <= precoConcorrenteNum) {
      return {
        titulo: "Highly Competitive",
        mensagem: `Your price is ${formatMZN(Math.abs(diferenca))} below the market.`,
        estilo: "bg-green-500/20 text-green-400 border-green-500/30"
      };
    } else if (diferencaPercentual <= 15) {
      return {
        titulo: "Slightly Above Market",
        mensagem: `Your price is ${diferencaPercentual.toFixed(1)}% above the market.`,
        estilo: "bg-amber-500/20 text-amber-400 border-amber-500/30"
      };
    } else {
      return {
        titulo: "Out of Market",
        mensagem: `Warning: your price is ${diferencaPercentual.toFixed(1)}% above the market.`,
        estilo: "bg-red-500/20 text-red-400 border-red-500/30"
      };
    }
  };

  const analise = obterAnaliseConcorrencia();

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '24px' }}>
      <h2 className="panel-title" style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Cost Summary</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
          <span>Material</span>
          <span style={{ color: 'white' }}>{formatMZN(results.materialCost)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
          <span>Energy</span>
          <span style={{ color: 'white' }}>{formatMZN(results.energyCost)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
          <span>Packaging</span>
          <span style={{ color: 'white' }}>{formatMZN(formData.packaging || 0)}</span>
        </div>
        
        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)', marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Manufacturing Cost</span>
            <span style={{ fontWeight: 'bold' }}>{formatMZN(results.manufacturingCost)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Profit ({formData.margin}%)</span>
            <span style={{ fontWeight: 'bold', color: 'var(--color-emerald)' }}>+{formatMZN(results.profit)}</span>
          </div>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
        <div style={{ fontSize: '0.875rem', color: 'var(--color-blue)', marginBottom: '0.25rem' }}>Suggested Sell Price</div>
        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>
          {formatMZN(results.sellPrice)}
        </div>

        {analise && (
          <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '0.5rem', border: '1px solid', ...getStyles(analise.estilo) }} className="animate-fade-in">
            <h3 style={{ fontWeight: 'bold', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{analise.titulo}</h3>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.4' }}>{analise.mensagem}</p>
          </div>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={!formData.name}
        className="btn btn-primary"
        style={{ 
          width: '100%', 
          justifyContent: 'center', 
          opacity: formData.name ? 1 : 0.5,
          cursor: formData.name ? 'pointer' : 'not-allowed',
          display: formData.name ? 'flex' : 'none'
        }}
      >
        <Save size={18} />
        Save Product
      </button>
      
      {!formData.name && (
        <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Enter a project name to save.
        </div>
      )}

      {showToast && (
        <div style={{ 
          position: 'absolute', top: '-40px', left: 0, right: 0, 
          background: 'var(--color-emerald)', color: 'white', 
          padding: '0.75rem', borderRadius: '0.5rem', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          boxShadow: '0 4px 12px rgba(52, 211, 153, 0.4)'
        }} className="animate-fade-in">
          <CheckCircle size={18} />
          <span style={{ fontWeight: 'bold' }}>Saved successfully!</span>
        </div>
      )}
    </div>
  );
}

function getStyles(classStr) {
  const isGreen = classStr.includes('green');
  const isAmber = classStr.includes('amber');
  const isRed = classStr.includes('red');
  
  if (isGreen) return { backgroundColor: 'rgba(52, 211, 153, 0.1)', color: 'var(--color-emerald)', borderColor: 'rgba(52, 211, 153, 0.3)' };
  if (isAmber) return { backgroundColor: 'rgba(251, 191, 36, 0.1)', color: 'var(--color-amber)', borderColor: 'rgba(251, 191, 36, 0.3)' };
  if (isRed) return { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' };
  return {};
}
