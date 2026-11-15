import React, { useState } from 'react';
import { OrderProvider } from './context/OrderContext';
import OrderForm from './components/OrderForm';
import KanbanBoard from './components/KanbanBoard';
import ProductionTicket from './components/ProductionTicket';
import CalculatorForm from './components/calculator/CalculatorForm';
import ResultsCard from './components/calculator/ResultsCard';
import HistoryView from './components/history/HistoryView';
import { useCalculadora } from './hooks/useCalculadora';
import { useCategoryManager } from './hooks/useCategoryManager';
import { Layers, KanbanSquare, Calculator, Database, Star, Plus, X } from 'lucide-react';
import './App.css';

const NAV_ITEMS = [
  { id: 'orders',     label: 'Orders',     Icon: KanbanSquare },
  { id: 'calculator', label: 'Calculator', Icon: Calculator },
  { id: 'history',    label: 'Database',   Icon: Database },
  { id: 'favorites',  label: 'Favorites',  Icon: Star },
];

function AppContent() {
  const [ticketOrder, setTicketOrder] = useState(null);
  const [currentView, setCurrentView] = useState('orders'); // 'orders', 'calculator', 'history', 'favorites'

  const { 
    formData, 
    handleChange, 
    results, 
    saveBudget, 
    history, 
    deleteBudget,
    resetForm,
    loadBudget,
    handlePhotoChange,
    toggleFavorite,
    updateBudgetCategory,
    apply3mfData,
    nextProductId,
    handleColorChange,
  } = useCalculadora();

  const {
    categories,
    categoriesLoading,
    createCategory,
    renameCategory,
    deleteCategory,
  } = useCategoryManager();

  const [orderSheetOpen, setOrderSheetOpen] = useState(false);

  const goTo = (view) => {
    setOrderSheetOpen(false);
    setCurrentView(view);
    window.scrollTo({ top: 0 });
  };

  const handleEditBudget = (budget) => {
    loadBudget(budget);
    setCurrentView('calculator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="brand">
            <div className="logo-icon">
              <Layers size={24} />
            </div>
            <h1>
              Geek Lab 4D <span>Workspace</span>
            </h1>
          </div>

          {/* Desktop / tablet navigation */}
          <nav className="top-nav" aria-label="Main navigation">
            {NAV_ITEMS.map(({ id, label, Icon }) => (
              <button
                key={id}
                className={`nav-btn ${currentView === id ? 'active' : ''}`}
                aria-current={currentView === id ? 'page' : undefined}
                onClick={() => goTo(id)}
              >
                <Icon size={18} /> {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Mobile navigation: thumb-reachable bottom tab bar */}
      <nav className="bottom-nav" aria-label="Main navigation">
        {NAV_ITEMS.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`bottom-nav-btn ${currentView === id ? 'active' : ''}`}
            aria-current={currentView === id ? 'page' : undefined}
            onClick={() => goTo(id)}
          >
            <Icon size={22} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <main className={`app-main ${currentView === 'orders' ? 'app-main--orders' : 'app-main--page'}`}>
        
        {currentView === 'orders' && (
          <>
            {/* Mobile: the intake form lives in a bottom sheet opened by the FAB */}
            {orderSheetOpen && (
              <div className="sheet-backdrop" onClick={() => setOrderSheetOpen(false)} />
            )}
            <aside className={`sidebar ${orderSheetOpen ? 'sidebar--open' : ''}`}>
              <button
                type="button"
                className="sidebar-close"
                aria-label="Close new order form"
                onClick={() => setOrderSheetOpen(false)}
              >
                <X size={20} />
              </button>
              <OrderForm onSubmitted={() => setOrderSheetOpen(false)} />
            </aside>
            <section className="board-container">
              <KanbanBoard onOpenTicket={setTicketOrder} />
            </section>
            <button
              type="button"
              className="fab"
              onClick={() => setOrderSheetOpen(true)}
              aria-label="New order"
            >
              <Plus size={24} />
              <span>New order</span>
            </button>
          </>
        )}

        {currentView === 'calculator' && (
          <div className="animate-fade-in calc-layout">
            <div className="calc-form-col">
              <CalculatorForm 
                formData={formData} 
                handleChange={handleChange}
                handlePhotoChange={handlePhotoChange}
                categories={categories.map(c => c.name)}
                onApply3mf={apply3mfData}
                handleColorChange={handleColorChange}
              />
            </div>
            <div className="calc-results-col">
              <ResultsCard
                formData={formData}
                results={results}
                saveBudget={saveBudget}
                resetForm={resetForm}
                nextProductId={nextProductId}
              />
            </div>
          </div>
        )}

        {currentView === 'history' && (
          <div className="animate-fade-in" style={{ width: '100%' }}>
            <HistoryView 
              history={history} 
              deleteBudget={deleteBudget} 
              onEdit={handleEditBudget}
              toggleFavorite={toggleFavorite}
              updateBudgetCategory={updateBudgetCategory}
              categories={categories}
              categoriesLoading={categoriesLoading}
              createCategory={createCategory}
              renameCategory={renameCategory}
              deleteCategory={deleteCategory}
            />
          </div>
        )}

        {currentView === 'favorites' && (
          <div className="animate-fade-in" style={{ width: '100%' }}>
            <HistoryView 
              history={history.filter(b => b.isFavorite)} 
              deleteBudget={deleteBudget} 
              onEdit={handleEditBudget}
              toggleFavorite={toggleFavorite}
              updateBudgetCategory={updateBudgetCategory}
              categories={categories}
              categoriesLoading={categoriesLoading}
              createCategory={createCategory}
              renameCategory={renameCategory}
              deleteCategory={deleteCategory}
              isFavoritesView={true}
            />
          </div>
        )}

      </main>

      {ticketOrder && (
        <ProductionTicket 
          order={ticketOrder} 
          onClose={() => setTicketOrder(null)} 
        />
      )}
    </div>
  );
}

function App() {
  return (
    <OrderProvider>
      <AppContent />
    </OrderProvider>
  );
}

export default App;
