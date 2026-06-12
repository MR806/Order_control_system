import { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

const MATERIAL_COST_PER_GRAM = 1.65;
const ENERGY_CONSUMPTION_KW = 0.12;

export function useCalculadora() {
  const [formData, setFormData] = useState({
    name: '',
    weight: 0,
    time: 0,
    packaging: 0,
    energyTariff: 10,
    margin: 100,
    precoConcorrente: '',
    finalPrice: '',
    photo: '',
  });

  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Listen for real-time updates from Firestore
    const q = query(collection(db, 'budgets'), orderBy('date', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const budgetsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHistory(budgetsData);
    }, (error) => {
      console.error("Error fetching budgets from Firestore: ", error);
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' || type === 'range' ? Number(value) : value,
    }));
  };

  const handlePhotoChange = (photoBase64) => {
    setFormData((prev) => ({
      ...prev,
      photo: photoBase64,
    }));
  };

  const materialCost = formData.weight * MATERIAL_COST_PER_GRAM;
  const energyCost = formData.time * ENERGY_CONSUMPTION_KW * formData.energyTariff;
  const manufacturingCost = materialCost + energyCost + formData.packaging;
  const profit = manufacturingCost * (formData.margin / 100);
  const sellPrice = manufacturingCost + profit;

  const results = {
    materialCost,
    energyCost,
    manufacturingCost,
    profit,
    sellPrice
  };

  const resetForm = () => {
    setFormData({
      name: '',
      weight: 0,
      time: 0,
      packaging: 0,
      energyTariff: 10,
      margin: 100,
      precoConcorrente: '',
      finalPrice: '',
      photo: '',
    });
  };

  const loadBudget = (budget) => {
    setFormData({
      name: budget.name,
      weight: budget.weight,
      time: budget.time,
      packaging: budget.packaging,
      energyTariff: budget.energyTariff,
      margin: budget.margin,
      precoConcorrente: budget.precoConcorrente || '',
      finalPrice: budget.finalPrice || '',
      photo: budget.photo || '',
    });
  };

  const saveBudget = async () => {
    if (!formData.name) return;
    
    const newBudget = {
      date: new Date().toISOString(),
      isFavorite: false,
      ...formData,
      ...results
    };
    
    try {
      await addDoc(collection(db, 'budgets'), newBudget);
    } catch (error) {
      console.error("Error adding budget to Firestore: ", error);
    }
  };

  const deleteBudget = async (id) => {
    try {
      await deleteDoc(doc(db, 'budgets', id));
    } catch (error) {
      console.error("Error deleting budget from Firestore: ", error);
    }
  };

  const toggleFavorite = async (id, currentStatus) => {
    try {
      const budgetRef = doc(db, 'budgets', id);
      await updateDoc(budgetRef, {
        isFavorite: !currentStatus
      });
    } catch (error) {
      console.error("Error updating favorite status: ", error);
    }
  };

  return {
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
  };
}
