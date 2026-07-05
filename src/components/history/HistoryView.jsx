import React, { useState, useRef, useEffect } from 'react';
import {
  Trash2, TrendingUp, Cpu, Edit3, Star, Search, X,
  Folder, FolderPlus, FolderOpen, Check, CheckSquare,
  Square, Move, Pencil, AlertTriangle, ChevronRight,
  MoreVertical, ArrowRight,
} from 'lucide-react';

// ── Tiny Modal Helper ───────────────────────────────────────────────────────
function Modal({ title, children, onClose }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel animate-slide-up"
        style={{
          background: '#0f172a', border: '1px solid rgba(51,65,85,0.9)',
          borderRadius: '1rem', padding: '1.5rem', width: '100%', maxWidth: '420px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '1.25rem' }}>{title}</h3>
        {children}
      </div>
    </div>
  );
}

// ── Folder Sidebar Item ──────────────────────────────────────────────────────
function FolderItem({ folder, isActive, count, onSelect, onRename, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '0.5rem 0.75rem', borderRadius: '0.5rem', cursor: 'pointer',
        background: isActive ? 'rgba(59,130,246,0.15)' : 'transparent',
        border: isActive ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
        transition: 'all 0.15s', position: 'relative',
      }}
      onClick={() => onSelect(folder.name)}
      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
    >
      {isActive
        ? <FolderOpen size={15} style={{ color: 'var(--color-blue)', flexShrink: 0 }} />
        : <Folder size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
      }
      <span style={{ flex: 1, fontSize: '0.875rem', color: isActive ? 'white' : 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {folder.name}
      </span>
      <span style={{
        fontSize: '0.7rem', background: isActive ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.07)',
        color: isActive ? 'var(--color-blue)' : 'var(--text-muted)',
        borderRadius: '9999px', padding: '0.1rem 0.4rem', flexShrink: 0,
      }}>
        {count}
      </span>
      <div ref={menuRef} style={{ position: 'relative', flexShrink: 0 }}>
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
          className="btn-icon"
          style={{ padding: '2px', opacity: 0.6 }}
        >
          <MoreVertical size={13} />
        </button>
        {menuOpen && (
          <div
            className="glass-panel animate-fade-in"
            style={{
              position: 'absolute', right: 0, top: '100%', zIndex: 50,
              background: '#0f172a', border: '1px solid rgba(51,65,85,0.9)',
              borderRadius: '0.5rem', padding: '0.25rem', minWidth: '120px',
              boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => { setMenuOpen(false); onRename(folder); }}
              style={{ width: '100%', padding: '0.4rem 0.75rem', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'white', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              <Pencil size={13} /> Rename
            </button>
            <button
              onClick={() => { setMenuOpen(false); onDelete(folder); }}
              style={{ width: '100%', padding: '0.4rem 0.75rem', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              <Trash2 size={13} /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function HistoryView({
  history, deleteBudget, onEdit, toggleFavorite, isFavoritesView,
  categories, categoriesLoading, createCategory, renameCategory, deleteCategory,
  updateBudgetCategory,
}) {
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFolder, setActiveFolder] = useState('ALL');   // 'ALL' | 'NONE' | category name
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(null); // folder object
  const [showDeleteModal, setShowDeleteModal] = useState(null); // folder object
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [modalInput, setModalInput] = useState('');
  const [isWorking, setIsWorking] = useState(false);

  const formatMZN = (value) =>
    new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(value);

  const toggleExpand = (id) => {
    if (selectMode) return;
    setExpandedId(expandedId === id ? null : id);
  };

  const handleEdit = (e, budget) => {
    e.stopPropagation();
    onEdit(budget);
  };

  // ── Selection helpers ──────────────────────────────────────────────────────
  const toggleSelect = (id, e) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(filteredHistory.map((b) => b.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setSelectMode(false);
  };

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filteredHistory = (history || []).filter((budget) => {
    let matchesSearch = true;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      matchesSearch =
        (budget.name || '').toLowerCase().includes(q) ||
        new Date(budget.date).toLocaleDateString().toLowerCase().includes(q) ||
        (budget.category || '').toLowerCase().includes(q);
    }
    let matchesFolder = true;
    if (activeFolder !== 'ALL') {
      if (activeFolder === 'NONE') matchesFolder = !budget.category;
      else matchesFolder = budget.category === activeFolder;
    }
    return matchesSearch && matchesFolder;
  });

  // ── Grouping ───────────────────────────────────────────────────────────────
  const groups = {};
  filteredHistory.forEach((budget) => {
    const cat = budget.category || 'Uncategorized';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(budget);
  });
  const sortedGroupKeys = Object.keys(groups).sort((a, b) => {
    if (a === 'Uncategorized') return 1;
    if (b === 'Uncategorized') return -1;
    return a.localeCompare(b, undefined, { sensitivity: 'base' });
  });

  // Build folder counts from full history (not filtered)
  const folderCounts = {};
  (history || []).forEach((b) => {
    const cat = b.category || '';
    if (cat) folderCounts[cat] = (folderCounts[cat] || 0) + 1;
  });
  const uncategorizedCount = (history || []).filter((b) => !b.category).length;

  // ── Create folder ──────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!modalInput.trim()) return;
    setIsWorking(true);
    await createCategory(modalInput.trim());
    setIsWorking(false);
    setModalInput('');
    setShowCreateModal(false);
  };

  // ── Rename folder ──────────────────────────────────────────────────────────
  const handleRename = async () => {
    if (!modalInput.trim() || !showRenameModal) return;
    setIsWorking(true);
    const oldName = showRenameModal.name;
    await renameCategory(showRenameModal.id, modalInput.trim());
    // Update budgets with old category name
    const affectedIds = (history || []).filter((b) => b.category === oldName).map((b) => b.id);
    if (affectedIds.length > 0) await updateBudgetCategory(affectedIds, modalInput.trim());
    // If the active folder was the renamed one, update it
    if (activeFolder === oldName) setActiveFolder(modalInput.trim());
    setIsWorking(false);
    setModalInput('');
    setShowRenameModal(null);
  };

  // ── Delete folder ──────────────────────────────────────────────────────────
  const handleDeleteFolder = async () => {
    if (!showDeleteModal) return;
    setIsWorking(true);
    const name = showDeleteModal.name;
    await deleteCategory(showDeleteModal.id);
    // Clear category from all budgets in this folder
    const affectedIds = (history || []).filter((b) => b.category === name).map((b) => b.id);
    if (affectedIds.length > 0) await updateBudgetCategory(affectedIds, '');
    if (activeFolder === name) setActiveFolder('ALL');
    setIsWorking(false);
    setShowDeleteModal(null);
  };

  // ── Move products ──────────────────────────────────────────────────────────
  const handleMove = async (targetCategoryName) => {
    if (selectedIds.size === 0) return;
    setIsWorking(true);
    await updateBudgetCategory([...selectedIds], targetCategoryName);
    setIsWorking(false);
    setShowMoveModal(false);
    clearSelection();
  };

  // ── Empty state ────────────────────────────────────────────────────────────
  if (!history || history.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
          {isFavoritesView ? <Star size={48} className="text-amber" /> : <Cpu size={48} className="icon-muted" />}
        </div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          {isFavoritesView ? 'No favorites yet' : 'No saved products'}
        </h3>
        <p style={{ color: 'var(--text-muted)' }}>
          {isFavoritesView
            ? "You haven't favored any products. Click the star on a product to add it here!"
            : 'Saved products will appear here. Use the calculator to create your first!'}
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>

      {/* ── LEFT: Folder Sidebar ───────────────────────────────────── */}
      {!isFavoritesView && (
        <div className="db-folder-sidebar glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Folders
            </h3>
            <button
              onClick={() => { setModalInput(''); setShowCreateModal(true); }}
              className="btn-icon"
              title="New Folder"
              style={{ color: 'var(--color-blue)' }}
            >
              <FolderPlus size={16} />
            </button>
          </div>

          {/* All / Uncategorized */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '0.5rem' }}>
            {[
              { label: 'All Products', value: 'ALL', count: (history || []).length },
              { label: 'Uncategorized', value: 'NONE', count: uncategorizedCount },
            ].map(({ label, value, count }) => (
              <div
                key={value}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '0.45rem 0.75rem', borderRadius: '0.5rem', cursor: 'pointer',
                  background: activeFolder === value ? 'rgba(59,130,246,0.12)' : 'transparent',
                  border: activeFolder === value ? '1px solid rgba(59,130,246,0.25)' : '1px solid transparent',
                  transition: 'all 0.15s',
                }}
                onClick={() => setActiveFolder(value)}
                onMouseEnter={(e) => { if (activeFolder !== value) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={(e) => { if (activeFolder !== value) e.currentTarget.style.background = 'transparent'; }}
              >
                <Folder size={14} style={{ color: activeFolder === value ? 'var(--color-blue)' : 'var(--text-muted)', flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: '0.85rem', color: activeFolder === value ? 'white' : 'var(--text-muted)' }}>
                  {label}
                </span>
                <span style={{
                  fontSize: '0.7rem', borderRadius: '9999px', padding: '0.1rem 0.4rem',
                  background: activeFolder === value ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.07)',
                  color: activeFolder === value ? 'var(--color-blue)' : 'var(--text-muted)',
                }}>
                  {count}
                </span>
              </div>
            ))}
          </div>

          {/* Divider */}
          {categories.length > 0 && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', margin: '0.5rem 0' }} />
          )}

          {/* Custom folders */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {categories.map((folder) => (
              <FolderItem
                key={folder.id}
                folder={folder}
                isActive={activeFolder === folder.name}
                count={folderCounts[folder.name] || 0}
                onSelect={(name) => setActiveFolder(name)}
                onRename={(f) => { setModalInput(f.name); setShowRenameModal(f); }}
                onDelete={(f) => setShowDeleteModal(f)}
              />
            ))}
          </div>

          {categories.length === 0 && !categoriesLoading && (
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1rem', lineHeight: 1.5 }}>
              No folders yet.{'\n'}Click <strong style={{ color: 'white' }}>+</strong> to create one.
            </p>
          )}
        </div>
      )}

      {/* ── RIGHT: Products Area ───────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
              {isFavoritesView ? 'Favorites' : (activeFolder === 'ALL' ? 'Product Database' : activeFolder === 'NONE' ? 'Uncategorized' : activeFolder)}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span className="badge badge-blue">
                {filteredHistory.length}{searchQuery || activeFolder !== 'ALL' ? ` of ${(history || []).length}` : ''} saved
              </span>
              {!isFavoritesView && (
                <button
                  onClick={() => {
                    setSelectMode(!selectMode);
                    if (selectMode) setSelectedIds(new Set());
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '0.35rem 0.875rem', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: '600',
                    background: selectMode ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.06)',
                    color: selectMode ? 'var(--color-blue)' : 'var(--text-muted)',
                    border: selectMode ? '1px solid rgba(59,130,246,0.35)' : '1px solid rgba(255,255,255,0.1)',
                    transition: 'all 0.2s', cursor: 'pointer',
                  }}
                >
                  {selectMode ? <CheckSquare size={14} /> : <Square size={14} />}
                  {selectMode ? 'Cancel' : 'Select'}
                </button>
              )}
            </div>
          </div>

          {/* Search bar */}
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search by name, date, or category…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%', background: 'var(--bg-input)',
                border: '1px solid var(--border-input)', borderRadius: '0.625rem',
                padding: '0.625rem 2.5rem', color: 'white', fontSize: '0.9rem',
                outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--color-blue)'; e.target.style.boxShadow = '0 0 0 2px rgba(59,130,246,0.2)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border-input)'; e.target.style.boxShadow = 'none'; }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* ── Select mode bar ─────────────────────────────────────── */}
        {selectMode && (
          <div className="db-select-bar animate-slide-up">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'white', fontWeight: '600' }}>
                {selectedIds.size} selected
              </span>
              <button
                onClick={selectAll}
                style={{ fontSize: '0.8rem', color: 'var(--color-blue)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}
              >
                Select all
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Clear
              </button>
            </div>
            <button
              onClick={() => setShowMoveModal(true)}
              disabled={selectedIds.size === 0 || isWorking}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '0.5rem 1.25rem', borderRadius: '0.5rem', fontWeight: '700', fontSize: '0.875rem',
                background: selectedIds.size > 0 ? 'var(--color-blue)' : 'rgba(255,255,255,0.1)',
                color: selectedIds.size > 0 ? 'white' : 'var(--text-muted)',
                border: 'none', cursor: selectedIds.size > 0 ? 'pointer' : 'default',
                transition: 'all 0.2s',
              }}
            >
              <Move size={15} />
              Move to folder
            </button>
          </div>
        )}

        {/* No results */}
        {filteredHistory.length === 0 && (
          <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Search size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>No results found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Try changing your search or selecting a different folder.</p>
            <button
              onClick={() => { setSearchQuery(''); setActiveFolder('ALL'); }}
              style={{ marginTop: '1rem', padding: '0.5rem 1.25rem', background: 'rgba(59,130,246,0.15)', color: 'var(--color-blue)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '0.5rem', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer' }}
            >
              Reset filters
            </button>
          </div>
        )}

        {/* ── Grouped grid ────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {sortedGroupKeys.map((categoryName) => {
            const budgets = groups[categoryName];
            return (
              <div key={categoryName} className="animate-fade-in">
                {/* Group header (only when viewing all) */}
                {activeFolder === 'ALL' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                    <Folder size={16} className="text-blue" />
                    <span style={{ fontWeight: 'bold', fontSize: '1rem', color: 'white' }}>{categoryName}</span>
                    <span style={{ background: 'rgba(59,130,246,0.12)', color: 'var(--color-blue)', fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '9999px' }}>
                      {budgets.length}
                    </span>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                  {budgets.map((budget) => {
                    const isExpanded = expandedId === budget.id;
                    const isSelected = selectedIds.has(budget.id);

                    return (
                      <div
                        key={budget.id}
                        className="order-card"
                        style={{
                          cursor: selectMode ? 'pointer' : 'pointer',
                          borderColor: isSelected
                            ? 'var(--color-blue)'
                            : isExpanded ? 'rgba(59,130,246,0.5)' : 'var(--border-input)',
                          padding: 0, position: 'relative', transition: 'all 0.2s',
                          boxShadow: isSelected ? '0 0 0 2px rgba(59,130,246,0.3)' : 'none',
                        }}
                        onClick={(e) => {
                          if (selectMode) toggleSelect(budget.id, e);
                          else toggleExpand(budget.id);
                        }}
                      >
                        {/* Selection checkbox overlay */}
                        {selectMode && (
                          <div
                            style={{
                              position: 'absolute', top: '10px', left: '10px', zIndex: 5,
                              background: isSelected ? 'var(--color-blue)' : 'rgba(15,23,42,0.8)',
                              borderRadius: '0.375rem', padding: '2px',
                              border: isSelected ? '2px solid var(--color-blue)' : '2px solid rgba(255,255,255,0.2)',
                              transition: 'all 0.15s',
                            }}
                          >
                            {isSelected
                              ? <Check size={14} color="white" />
                              : <div style={{ width: '14px', height: '14px' }} />
                            }
                          </div>
                        )}

                        <div style={{ padding: '1.25rem', paddingLeft: selectMode ? '2.5rem' : '1.25rem', position: 'relative' }}>
                          {/* Action buttons */}
                          {!selectMode && (
                            <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.2rem' }}>
                              <button onClick={(e) => { e.stopPropagation(); toggleFavorite(budget.id, budget.isFavorite); }} className="btn-icon" style={{ color: budget.isFavorite ? 'var(--color-amber)' : 'var(--text-muted)' }}>
                                <Star size={16} fill={budget.isFavorite ? 'currentColor' : 'none'} />
                              </button>
                              <button onClick={(e) => handleEdit(e, budget)} className="btn-icon">
                                <Edit3 size={16} />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); deleteBudget(budget.id); }} className="btn-icon" style={{ color: '#ef4444' }}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}

                          {/* Product header */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '0.875rem', paddingRight: selectMode ? 0 : '90px' }}>
                            {budget.photo && (
                              <img src={budget.photo} alt={budget.name} style={{ width: '44px', height: '44px', borderRadius: '7px', objectFit: 'cover', marginRight: '10px', flexShrink: 0 }} />
                            )}
                            <div style={{ minWidth: 0 }}>
                              <h3 style={{ fontWeight: 'bold', fontSize: '1rem', lineHeight: 1.3, marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{budget.name}</h3>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                  {new Date(budget.date).toLocaleDateString()}
                                </span>
                                {budget.category && (
                                  <span style={{ fontSize: '0.62rem', padding: '0.12rem 0.4rem', background: 'rgba(96,165,250,0.1)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.25)', borderRadius: '0.25rem' }}>
                                    {budget.category}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Expanded photo */}
                          {isExpanded && budget.photo && (
                            <div className="animate-fade-in" style={{ marginBottom: '0.875rem' }}>
                              <img src={budget.photo} alt={budget.name} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '7px' }} />
                            </div>
                          )}

                          {/* Cost breakdown */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                              <span style={{ color: 'var(--text-muted)' }}>Material ({budget.weight}g)</span>
                              <span>{formatMZN(budget.materialCost)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                              <span style={{ color: 'var(--text-muted)' }}>Energy ({budget.time}h)</span>
                              <span>{formatMZN(budget.energyCost)}</span>
                            </div>
                            {isExpanded && (
                              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.35rem', paddingTop: '0.35rem', borderTop: '1px solid var(--border-input)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                                  <span style={{ color: 'var(--text-muted)' }}>Packaging</span>
                                  <span>{formatMZN(budget.packaging || 0)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                                  <span style={{ color: 'var(--text-muted)' }}>Margin</span>
                                  <span>{budget.margin}%</span>
                                </div>
                              </div>
                            )}
                            <div style={{ borderTop: '1px solid var(--border-input)', paddingTop: '0.4rem', marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 'bold' }}>
                              <span>Mfg. Cost</span>
                              <span>{formatMZN(budget.manufacturingCost)}</span>
                            </div>
                          </div>

                          {/* Price summary */}
                          <div style={{ background: isExpanded ? 'rgba(59,130,246,0.1)' : 'var(--bg-input)', borderRadius: '0.625rem', padding: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontSize: '0.7rem', color: isExpanded ? 'var(--color-blue)' : 'var(--text-muted)', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <TrendingUp size={11} />
                                {budget.finalPrice ? 'Defined Price' : 'Suggested Price'}
                              </div>
                              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'white' }}>
                                {formatMZN(budget.finalPrice ? budget.finalPrice : budget.sellPrice)}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold' }}>Profit</div>
                              <div style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--color-emerald)' }}>
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
          })}
        </div>
      </div>

      {/* ══ MODALS ══════════════════════════════════════════════════════ */}

      {/* Create Folder Modal */}
      {showCreateModal && (
        <Modal title="📁 New Folder" onClose={() => setShowCreateModal(false)}>
          <input
            autoFocus
            type="text"
            placeholder="Folder name (e.g. Organizers)"
            value={modalInput}
            onChange={(e) => setModalInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-input)', borderRadius: '0.5rem', padding: '0.625rem 1rem', color: 'white', fontSize: '0.9rem', outline: 'none', marginBottom: '1rem' }}
          />
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button onClick={() => setShowCreateModal(false)} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.06)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem' }}>
              Cancel
            </button>
            <button
              onClick={handleCreate} disabled={!modalInput.trim() || isWorking}
              style={{ padding: '0.5rem 1.25rem', borderRadius: '0.5rem', background: modalInput.trim() ? 'var(--color-blue)' : 'rgba(255,255,255,0.1)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.875rem', opacity: isWorking ? 0.7 : 1 }}
            >
              {isWorking ? 'Creating…' : 'Create'}
            </button>
          </div>
        </Modal>
      )}

      {/* Rename Folder Modal */}
      {showRenameModal && (
        <Modal title="✏️ Rename Folder" onClose={() => setShowRenameModal(null)}>
          <input
            autoFocus
            type="text"
            placeholder="New folder name"
            value={modalInput}
            onChange={(e) => setModalInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-input)', borderRadius: '0.5rem', padding: '0.625rem 1rem', color: 'white', fontSize: '0.9rem', outline: 'none', marginBottom: '1rem' }}
          />
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button onClick={() => setShowRenameModal(null)} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.06)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem' }}>Cancel</button>
            <button
              onClick={handleRename} disabled={!modalInput.trim() || isWorking}
              style={{ padding: '0.5rem 1.25rem', borderRadius: '0.5rem', background: modalInput.trim() ? 'var(--color-blue)' : 'rgba(255,255,255,0.1)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.875rem', opacity: isWorking ? 0.7 : 1 }}
            >
              {isWorking ? 'Saving…' : 'Save'}
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Folder Modal */}
      {showDeleteModal && (
        <Modal title="Delete Folder" onClose={() => setShowDeleteModal(null)}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '1.25rem', padding: '1rem', background: 'rgba(239,68,68,0.06)', borderRadius: '0.625rem', border: '1px solid rgba(239,68,68,0.2)' }}>
            <AlertTriangle size={20} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ color: '#f8fafc', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Deleting <strong>"{showDeleteModal.name}"</strong> will remove the folder. Products inside will move to <strong>Uncategorized</strong>. This cannot be undone.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button onClick={() => setShowDeleteModal(null)} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.06)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem' }}>Cancel</button>
            <button
              onClick={handleDeleteFolder} disabled={isWorking}
              style={{ padding: '0.5rem 1.25rem', borderRadius: '0.5rem', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.875rem', opacity: isWorking ? 0.7 : 1 }}
            >
              {isWorking ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </Modal>
      )}

      {/* Move to Folder Modal */}
      {showMoveModal && (
        <Modal title={`Move ${selectedIds.size} product${selectedIds.size > 1 ? 's' : ''} to…`} onClose={() => setShowMoveModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '1rem', maxHeight: '280px', overflowY: 'auto' }}>
            {/* Remove from folder option */}
            <button
              onClick={() => handleMove('')}
              disabled={isWorking}
              style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', fontWeight: '500', textAlign: 'left' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
            >
              <X size={14} />
              Remove from folder (Uncategorized)
            </button>

            {categories.length > 0 && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', margin: '0.4rem 0' }} />
            )}

            {categories.map((folder) => (
              <button
                key={folder.id}
                onClick={() => handleMove(folder.name)}
                disabled={isWorking}
                style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem', color: 'white', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', fontWeight: '500', textAlign: 'left' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(59,130,246,0.12)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.25)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
              >
                <Folder size={14} className="text-blue" />
                <span style={{ flex: 1 }}>{folder.name}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{folderCounts[folder.name] || 0} items</span>
                <ArrowRight size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              </button>
            ))}

            {categories.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', padding: '1.5rem 0' }}>
                No folders yet. Create one first.
              </p>
            )}
          </div>
          {isWorking && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Moving products…</p>
          )}
        </Modal>
      )}
    </div>
  );
}
