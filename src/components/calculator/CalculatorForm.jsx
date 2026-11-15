import React, { useRef, useState } from 'react';
import {
  Box, Clock, Zap, Target, Package, Image as ImageIcon,
  UploadCloud, X, FileCode2, CheckCircle2, AlertCircle,
  Loader2, Scale, RefreshCw, CloudUpload, ExternalLink,
  Palette, Check,
} from 'lucide-react';
import { parse3mf } from '../../utils/parse3mf';
import { use3mfUpload } from '../../hooks/use3mfUpload';

const PRESET_COLORS = [
  { name: 'Black', hex: '#111827' },
  { name: 'White', hex: '#f8fafc' },
  { name: 'Grey', hex: '#64748b' },
  { name: 'Red', hex: '#ef4444' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Green', hex: '#10b981' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Gold', hex: '#d97706' },
  { name: 'Cyan', hex: '#06b6d4' },
];

export default function CalculatorForm({ formData, handleChange, handlePhotoChange, categories = [], onApply3mf, handleColorChange }) {
  const photoInputRef = useRef(null);
  const threemfInputRef = useRef(null);
  const { upload3mf, uploadProgress, uploadError, resetUpload } = use3mfUpload();

  // 3MF parse + upload state
  const [parseState, setParseState] = useState('idle'); // 'idle'|'parsing'|'ready'|'uploading'|'done'|'error'
  const [threemfData, setThreemfData] = useState(null);
  const [threemfFile, setThreemfFile] = useState(null);
  const [threemfUrl, setThreemfUrl] = useState(null);  // Firebase Storage URL
  const [parseError, setParseError] = useState('');

  // ── Photo handlers ────────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { if (handlePhotoChange) handlePhotoChange(reader.result); };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    if (handlePhotoChange) handlePhotoChange('');
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  // ── 3MF parse ─────────────────────────────────────────────────────────────
  const handle3mfChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (threemfInputRef.current) threemfInputRef.current.value = '';

    setThreemfFile(file);
    setParseState('parsing');
    setThreemfData(null);
    setThreemfUrl(null);
    setParseError('');
    resetUpload();

    try {
      const data = await parse3mf(file);
      setThreemfData(data);
      setParseState('ready');
    } catch (err) {
      console.error('3MF parse error:', err);
      setParseError(err.message || 'Could not parse 3MF file.');
      setParseState('error');
    }
  };

  // ── Apply parsed data to form ─────────────────────────────────────────────
  const applyData = () => {
    if (!threemfData || !onApply3mf) return;
    onApply3mf({ ...threemfData, threemfUrl });
  };

  // ── Upload to Firebase Storage ────────────────────────────────────────────
  const handleUpload = async () => {
    if (!threemfFile) return;
    setParseState('uploading');
    try {
      const url = await upload3mf(threemfFile);
      setThreemfUrl(url);
      setParseState('done');
      // Auto-apply with the storage URL included
      if (onApply3mf && threemfData) {
        onApply3mf({ ...threemfData, threemfUrl: url });
      }
    } catch {
      setParseState('error');
      setParseError(uploadError || 'Upload to Firebase failed.');
    }
  };

  // ── Dismiss / reset ───────────────────────────────────────────────────────
  const dismiss3mf = () => {
    setParseState('idle');
    setThreemfData(null);
    setThreemfFile(null);
    setThreemfUrl(null);
    setParseError('');
    resetUpload();
  };

  const sourceLabel = {
    'bambu/orca': 'Bambu / Orca Slicer',
    prusa: 'PrusaSlicer',
    generic: 'Generic 3MF',
  };

  const hasData = threemfData && (
    threemfData.name || threemfData.weightGrams != null || threemfData.printTimeHours != null
  );

  return (
    <div className="glass-panel order-form-container">

      {/* ── 3MF Upload Section ──────────────────────────────────────────── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 className="panel-title" style={{ marginBottom: '1rem' }}>
          <FileCode2 className="icon-blue" />
          Import from 3MF
        </h2>

        <input
          type="file"
          ref={threemfInputRef}
          onChange={handle3mfChange}
          accept=".3mf"
          style={{ display: 'none' }}
        />

        {/* ── IDLE / ERROR drop zone ── */}
        {(parseState === 'idle' || parseState === 'error') && (
          <div
            onClick={() => threemfInputRef.current?.click()}
            style={{
              border: '2px dashed',
              borderColor: parseState === 'error' ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.15)',
              borderRadius: '0.75rem',
              padding: '1.25rem 1rem',
              textAlign: 'center',
              cursor: 'pointer',
              background: parseState === 'error' ? 'rgba(239,68,68,0.04)' : 'rgba(255,255,255,0.02)',
              transition: 'border-color 0.2s, background 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-blue)';
              e.currentTarget.style.background = 'rgba(59,130,246,0.06)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor =
                parseState === 'error' ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.15)';
              e.currentTarget.style.background =
                parseState === 'error' ? 'rgba(239,68,68,0.04)' : 'rgba(255,255,255,0.02)';
            }}
          >
            {parseState === 'error' ? (
              <>
                <AlertCircle size={28} style={{ color: '#ef4444', margin: '0 auto 6px' }} />
                <div style={{ fontWeight: '600', color: '#ef4444', fontSize: '0.875rem' }}>{parseError}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Click to try another file</div>
              </>
            ) : (
              <>
                <FileCode2 size={28} style={{ color: 'var(--color-blue)', margin: '0 auto 6px' }} />
                <div style={{ fontWeight: '500', color: 'white', fontSize: '0.9rem' }}>Click to upload a .3mf file</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Auto-fills name, weight &amp; print time · File saved to Firebase
                </div>
              </>
            )}
          </div>
        )}

        {/* ── PARSING spinner ── */}
        {parseState === 'parsing' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '1rem', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '0.75rem' }}>
            <Loader2 size={20} style={{ color: 'var(--color-blue)', animation: 'spin 1s linear infinite', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'white' }}>Reading file…</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{threemfFile?.name}</div>
            </div>
          </div>
        )}

        {/* ── READY: show data preview + upload button ── */}
        {parseState === 'ready' && (
          <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '0.75rem', padding: '1rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                <CheckCircle2 size={18} style={{ color: 'var(--color-emerald)', flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '700', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                    {threemfFile?.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                    {sourceLabel[threemfData?.source] || threemfData?.source}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button onClick={() => threemfInputRef.current?.click()} className="btn-icon" title="Change file" aria-label="Change file" style={{ color: 'var(--text-muted)' }}>
                  <RefreshCw size={14} />
                </button>
                <button onClick={dismiss3mf} className="btn-icon" title="Dismiss" aria-label="Dismiss" style={{ color: 'var(--text-muted)' }}>
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Extracted data */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '1rem' }}>
              {threemfData?.name && (
                <Row icon={<FileCode2 size={13} />} label="Name" value={threemfData.name} />
              )}
              {threemfData?.weightGrams != null && (
                <Row icon={<Scale size={13} />} label="Filament" value={`${threemfData.weightGrams} g`} />
              )}
              {threemfData?.printTimeHours != null && (
                <Row icon={<Clock size={13} />} label="Print time" value={`${threemfData.printTimeHours} h`} />
              )}
              {!hasData && (
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No slicer metadata found — using filename as name.
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
              <button
                onClick={applyData}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.825rem', fontWeight: '700', background: 'var(--color-emerald)', color: 'white', border: 'none', cursor: 'pointer' }}
              >
                <CheckCircle2 size={14} /> Apply to calculator
              </button>
              <button
                onClick={handleUpload}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.5rem 0.875rem', borderRadius: '0.5rem', fontSize: '0.825rem', fontWeight: '700', background: 'rgba(59,130,246,0.15)', color: 'var(--color-blue)', border: '1px solid rgba(59,130,246,0.3)', cursor: 'pointer' }}
                title="Upload file to Firebase Storage"
              >
                <CloudUpload size={14} /> Save to cloud
              </button>
            </div>
          </div>
        )}

        {/* ── UPLOADING: progress bar ── */}
        {parseState === 'uploading' && (
          <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '0.75rem', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
              <CloudUpload size={18} style={{ color: 'var(--color-blue)', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'white' }}>Uploading to Firebase…</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{threemfFile?.name}</div>
              </div>
              <span style={{ marginLeft: 'auto', fontSize: '0.875rem', fontWeight: '700', color: 'var(--color-blue)' }}>
                {uploadProgress ?? 0}%
              </span>
            </div>
            {/* Progress bar */}
            <div style={{ height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${uploadProgress ?? 0}%`, background: 'var(--color-blue)', borderRadius: '9999px', transition: 'width 0.2s ease' }} />
            </div>
          </div>
        )}

        {/* ── DONE: file uploaded, show link ── */}
        {parseState === 'done' && (
          <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '0.75rem', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} style={{ color: 'var(--color-emerald)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '700', color: 'white' }}>
                    Saved to Firebase ✓
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                    {threemfFile?.name}
                  </div>
                </div>
              </div>
              <button onClick={dismiss3mf} className="btn-icon" title="Dismiss" aria-label="Dismiss" style={{ color: 'var(--text-muted)' }}>
                <X size={14} />
              </button>
            </div>

            {/* Data summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '1rem' }}>
              {threemfData?.name && <Row icon={<FileCode2 size={13} />} label="Name" value={threemfData.name} />}
              {threemfData?.weightGrams != null && <Row icon={<Scale size={13} />} label="Filament" value={`${threemfData.weightGrams} g`} />}
              {threemfData?.printTimeHours != null && <Row icon={<Clock size={13} />} label="Print time" value={`${threemfData.printTimeHours} h`} />}
            </div>

            <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
              <button
                onClick={applyData}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.825rem', fontWeight: '700', background: 'var(--color-emerald)', color: 'white', border: 'none', cursor: 'pointer' }}
              >
                <CheckCircle2 size={14} /> Apply to calculator
              </button>
              {threemfUrl && (
                <a
                  href={threemfUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0.5rem 0.875rem', borderRadius: '0.5rem', fontSize: '0.825rem', fontWeight: '600', background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none' }}
                  title="Open file in Firebase Storage"
                >
                  <ExternalLink size={13} />
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      <hr style={{ borderColor: 'var(--border-color)', margin: '0 0 1.5rem' }} />

      {/* ── Technical Data Section ──────────────────────────────────────── */}
      <div className="mb-6">
        <h2 className="panel-title" style={{ marginBottom: '1.25rem' }}>
          <Box className="icon-blue" />
          Technical Data
        </h2>
        <div className="order-form">
          <div className="form-row">
            <div className="form-group flex-1">
              <label>Project Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Headphone Stand" />
            </div>
            <div className="form-group flex-1">
              <label>Category</label>
              <input type="text" name="category" value={formData.category || ''} onChange={handleChange} placeholder="e.g. Organizers, Toys, Deco" list="category-suggestions" />
              <datalist id="category-suggestions">
                {categories.map((cat) => <option key={cat} value={cat} />)}
              </datalist>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group flex-1">
              <label>Weight (g)</label>
              <input type="number" name="weight" value={formData.weight || ''} onChange={handleChange} min="0" step="any" />
            </div>
            <div className="form-group flex-1">
              <label>Print Time (hrs)</label>
              <div style={{ position: 'relative' }}>
                <input type="number" name="time" value={formData.time || ''} onChange={handleChange} min="0" step="0.1" style={{ width: '100%' }} />
                <Clock size={16} className="icon-muted" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>
          </div>

          {/* ── Product Color Selector ─────────────────────────────────── */}
          <div className="form-group" style={{ marginTop: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Palette size={14} className="icon-blue" />
                Product Color
              </label>
              {formData.color && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: 'white',
                  background: 'rgba(255,255,255,0.06)',
                  padding: '0.15rem 0.55rem',
                  borderRadius: '0.375rem',
                  border: '1px solid rgba(255,255,255,0.12)'
                }}>
                  <span style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: formData.colorHex || '#111827',
                    display: 'inline-block',
                    border: '1px solid rgba(255,255,255,0.4)',
                    boxShadow: '0 0 4px rgba(0,0,0,0.3)',
                    flexShrink: 0
                  }} />
                  {formData.color}
                </span>
              )}
            </div>

            {/* Preset Color Swatches */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
              {PRESET_COLORS.map((preset) => {
                const isSelected = (formData.color || '').toLowerCase() === preset.name.toLowerCase();
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      if (handleColorChange) {
                        handleColorChange(preset.name, preset.hex);
                      }
                    }}
                    title={preset.name}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: preset.hex,
                      border: isSelected ? '2px solid #3b82f6' : '2px solid rgba(255,255,255,0.2)',
                      boxShadow: isSelected ? '0 0 0 2px rgba(59,130,246,0.5), 0 2px 6px rgba(0,0,0,0.4)' : 'none',
                      transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease',
                      padding: 0,
                    }}
                  >
                    {isSelected && (
                      <Check size={14} color={preset.hex === '#f8fafc' || preset.hex === '#eab308' ? '#0f172a' : '#ffffff'} strokeWidth={3} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Color Name Input + Color Picker Wheel */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="text"
                  name="color"
                  value={formData.color || ''}
                  onChange={handleChange}
                  placeholder="Or type custom color (e.g. Galaxy Black, Silk Red, Glow Green)..."
                  style={{ width: '100%', paddingRight: '2rem' }}
                />
                {formData.color && (
                  <button
                    type="button"
                    onClick={() => handleColorChange && handleColorChange('', '#111827')}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '2px',
                    }}
                    title="Clear color"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Custom HTML5 Color Picker */}
              <div style={{ position: 'relative', width: '38px', height: '38px', flexShrink: 0 }}>
                <input
                  type="color"
                  value={formData.colorHex || '#111827'}
                  onChange={(e) => {
                    const newHex = e.target.value;
                    if (handleColorChange) {
                      handleColorChange(formData.color || 'Custom', newHex);
                    }
                  }}
                  title="Pick custom hex color"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer',
                    zIndex: 2,
                  }}
                />
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '0.5rem',
                    backgroundColor: formData.colorHex || '#111827',
                    border: '1px solid rgba(255,255,255,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    cursor: 'pointer',
                  }}
                  title="Pick custom hex color"
                >
                  <Palette size={16} color={formData.colorHex === '#f8fafc' ? '#0f172a' : '#ffffff'} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr style={{ borderColor: 'var(--border-color)', margin: '1.5rem 0' }} />

      {/* ── Product Image Section ───────────────────────────────────────── */}
      <div className="mb-6">
        <h2 className="panel-title" style={{ marginBottom: '1.25rem', fontSize: '1.25rem' }}>
          <ImageIcon className="icon-blue" />
          Product Image
        </h2>
        <div>
          <input type="file" ref={photoInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
          {formData.photo ? (
            <div style={{ position: 'relative', display: 'inline-block', borderRadius: '0.75rem', overflow: 'hidden' }}>
              <img src={formData.photo} alt="Preview" style={{ height: '160px', objectFit: 'cover' }} />
              <button type="button" onClick={removePhoto} style={{ position: 'absolute', top: '8px', right: '8px', background: '#ef4444', color: 'white', padding: '4px', borderRadius: '50%', border: 'none', cursor: 'pointer' }} title="Remove photo">
                <X size={16} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => photoInputRef.current?.click()}
              style={{ border: '2px dashed rgba(255,255,255,0.2)', borderRadius: '0.75rem', padding: '2rem', textAlign: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.02)', transition: 'border-color 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-blue)'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
            >
              <UploadCloud size={32} className="icon-blue" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontWeight: '500', color: 'white' }}>Click to upload image</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PNG, JPG or WEBP (max 5MB)</div>
            </div>
          )}
        </div>
      </div>

      <hr style={{ borderColor: 'var(--border-color)', margin: '1.5rem 0' }} />

      {/* ── Extra Costs & Profit Section ────────────────────────────────── */}
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
                <input type="number" name="packaging" value={formData.packaging || ''} onChange={handleChange} min="0" step="any" style={{ width: '100%' }} />
                <Package size={16} className="icon-muted" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>
            <div className="form-group flex-1">
              <label>Energy (MZN/kWh)</label>
              <div style={{ position: 'relative' }}>
                <input type="number" name="energyTariff" value={formData.energyTariff} onChange={handleChange} min="0" step="any" style={{ width: '100%' }} />
                <Zap size={16} className="icon-muted" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group flex-1">
              <label>Market Reference (MZN)</label>
              <input type="number" name="precoConcorrente" min="0" placeholder="e.g. 1500" value={formData.precoConcorrente} onChange={handleChange} />
            </div>
            <div className="form-group flex-1">
              <label>Final Price Override (MZN)</label>
              <input type="number" name="finalPrice" min="0" placeholder="e.g. 2000" value={formData.finalPrice} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ margin: 0 }}>Profit Margin</label>
              <span style={{ fontWeight: 'bold', color: 'var(--color-blue)' }}>{formData.margin}%</span>
            </div>
            <input type="range" name="margin" min="0" max="1000" value={formData.margin} onChange={handleChange} style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--color-blue)' }} />
          </div>
        </div>
      </div>

    </div>
  );
}

// ── Small helper component ────────────────────────────────────────────────────
function Row({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}>
      <span style={{ color: 'var(--color-blue)', flexShrink: 0 }}>{icon}</span>
      <span style={{ color: 'var(--text-muted)', minWidth: '90px' }}>{label}</span>
      <span style={{ color: 'white', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
    </div>
  );
}
