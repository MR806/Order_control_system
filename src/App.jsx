import React, { useState } from 'react';
import { OrderProvider } from './context/OrderContext';
import OrderForm from './components/OrderForm';
import KanbanBoard from './components/KanbanBoard';
import ProductionTicket from './components/ProductionTicket';
import CalculatorForm from './components/calculator/CalculatorForm';
import ResultsCard from './components/calculator/ResultsCard';
import HistoryView from './components/history/HistoryView';
import { useCalculadora } from './hooks/useCalculadora';
import { Layers, KanbanSquare, Calculator, Database, Star } from 'lucide-react';
import './App.css';

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
    toggleFavorite
  } = useCalculadora();

  const handleEditBudget = (budget) => {
    loadBudget(budget);
    setCurrentView('calculator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div className="logo-icon">
              <Layers size={24} />
            </div>
            <h1>
              Geek Lab 4D <span>Workspace</span>
            </h1>
          </div>
          
          <nav className="top-nav">
            <button 
              className={`nav-btn ${currentView === 'orders' ? 'active' : ''}`}
              onClick={() => setCurrentView('orders')}
            >
              <KanbanSquare size={18} /> Orders
            </button>
            <button 
              className={`nav-btn ${currentView === 'calculator' ? 'active' : ''}`}
              onClick={() => setCurrentView('calculator')}
            >
              <Calculator size={18} /> Calculator
            </button>
            <button 
              className={`nav-btn ${currentView === 'history' ? 'active' : ''}`}
              onClick={() => setCurrentView('history')}
            >
              <Database size={18} /> Database
            </button>
            <button 
              className={`nav-btn ${currentView === 'favorites' ? 'active' : ''}`}
              onClick={() => setCurrentView('favorites')}
            >
              <Star size={18} /> Favorites
            </button>
          </nav>
        </div>
      </header>

      <main className="app-main" style={{ flexDirection: currentView === 'orders' ? 'row' : 'column', padding: currentView === 'orders' ? '20px' : '40px 20px', maxWidth: currentView === 'orders' ? 'none' : '1200px', margin: currentView === 'orders' ? '0' : '0 auto', width: '100%' }}>
        
        {currentView === 'orders' && (
          <>
            <aside className="sidebar">
              <OrderForm />
            </aside>
            <section className="board-container">
              <KanbanBoard onOpenTicket={setTicketOrder} />
            </section>
          </>
        )}

        {currentView === 'calculator' && (
          <div className="animate-fade-in" style={{ display: 'flex', gap: '2rem', width: '100%', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 600px' }}>
              <CalculatorForm 
                formData={formData} 
                handleChange={handleChange}
                handlePhotoChange={handlePhotoChange}
                categories={[...new Set(history.map(b => b.category).filter(Boolean))].sort()}
              />
            </div>
            <div style={{ flex: '1 1 350px' }}>
              <ResultsCard 
                formData={formData}
                results={results}
                saveBudget={saveBudget}
                resetForm={resetForm}
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
