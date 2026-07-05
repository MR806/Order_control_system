import React, { useRef } from 'react';
import { Box, Clock, Zap, Target, Package, Image as ImageIcon, UploadCloud, X } from 'lucide-react';

export default function CalculatorForm({ formData, handleChange, handlePhotoChange, categories = [] }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (handlePhotoChange) {
          handlePhotoChange(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removePhoto = () => {
    if (handlePhotoChange) handlePhotoChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="glass-panel order-form-container">
      
      {/* Dados Técnicos Section */}
      <div className="mb-6">
        <h2 className="panel-title" style={{ marginBottom: '1.25rem' }}>
          <Box className="icon-blue" />
          Technical Data
        </h2>
        
        <div className="order-form">
          <div className="form-row">
            <div className="form-group flex-1">
              <label>Project Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Headphone Stand"
              />
            </div>
            <div className="form-group flex-1">
              <label>Category</label>
              <input
                type="text"
                name="category"
                value={formData.category || ''}
                onChange={handleChange}
                placeholder="e.g. Organizers, Toys, Deco"
                list="category-suggestions"
              />
              <datalist id="category-suggestions">
                {categories.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group flex-1">
              <label>Weight (g)</label>
              <input
                type="number"
                name="weight"
                value={formData.weight || ''}
                onChange={handleChange}
                min="0"
                step="any"
              />
            </div>
            
            <div className="form-group flex-1">
              <label>Print Time (hrs)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  name="time"
                  value={formData.time || ''}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  style={{ width: '100%' }}
                />
                <Clock size={16} className="icon-muted" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr style={{ borderColor: 'var(--border-color)', margin: '1.5rem 0' }} />

      {/* Product Image Section */}
      <div className="mb-6">
        <h2 className="panel-title" style={{ marginBottom: '1.25rem', fontSize: '1.25rem' }}>
          <ImageIcon className="icon-blue" />
          Product Image
        </h2>
        
        <div>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: 'none' }}
          />
          
          {formData.photo ? (
            <div style={{ position: 'relative', display: 'inline-block', borderRadius: '0.75rem', overflow: 'hidden' }}>
              <img 
                src={formData.photo} 
                alt="Preview" 
                style={{ height: '160px', objectFit: 'cover' }}
              />
              <button
                type="button"
                onClick={removePhoto}
                style={{ position: 'absolute', top: '8px', right: '8px', background: '#ef4444', color: 'white', padding: '4px', borderRadius: '50%', border: 'none', cursor: 'pointer' }}
                title="Remove photo"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div 
              onClick={triggerFileInput}
              style={{
                border: '2px dashed rgba(255,255,255,0.2)',
                borderRadius: '0.75rem',
                padding: '2rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: 'rgba(255,255,255,0.02)',
                transition: 'border-color 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.borderColor = 'var(--color-blue)'}
              onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
            >
              <UploadCloud size={32} className="icon-blue" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontWeight: '500', color: 'white' }}>Click to upload image</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PNG, JPG or WEBP (max 5MB)</div>
            </div>
          )}
        </div>
      </div>

      <hr style={{ borderColor: 'var(--border-color)', margin: '1.5rem 0' }} />

      {/* Extra Costs & Profit Section */}
      <div>
        <h2 className="panel-title" style={{ marginBottom: '1.25rem', fontSize: '1.25rem' }}>
          <Target className="icon-blue" />
          Costs & Profit
        </h2>
        
        <div className="order-form">
          <div className="form-row">
            <div className="form-group flex-1">
              <label>Packaging (MZN)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  name="packaging"
                  value={formData.packaging || ''}
                  onChange={handleChange}
                  min="0"
                  step="any"
                  style={{ width: '100%' }}
                />
                <Package size={16} className="icon-muted" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>
            
            <div className="form-group flex-1">
              <label>Energy (MZN/kWh)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  name="energyTariff"
                  value={formData.energyTariff}
                  onChange={handleChange}
                  min="0"
                  step="any"
                  style={{ width: '100%' }}
                />
                <Zap size={16} className="icon-muted" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label>Market Reference (MZN)</label>
              <input
                type="number"
                name="precoConcorrente"
                min="0"
                placeholder="e.g. 1500"
                value={formData.precoConcorrente}
                onChange={handleChange}
              />
            </div>

            <div className="form-group flex-1">
              <label>Final Price Override (MZN)</label>
              <input
                type="number"
                name="finalPrice"
                min="0"
                placeholder="e.g. 2000"
                value={formData.finalPrice}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ margin: 0 }}>Profit Margin</label>
              <span style={{ fontWeight: 'bold', color: 'var(--color-blue)' }}>{formData.margin}%</span>
            </div>
            <input
              type="range"
              name="margin"
              min="0"
              max="1000"
              value={formData.margin}
              onChange={handleChange}
              style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--color-blue)' }}
            />
          </div>
        </div>
      </div>

    </div>
  );
}
