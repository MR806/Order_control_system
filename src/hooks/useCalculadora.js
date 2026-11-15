import { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { generateNextProductId } from '../utils/productId';

const MATERIAL_COST_PER_GRAM = 1.65;
const ENERGY_CONSUMPTION_KW = 0.12;

export function useCalculadora() {
  const [formData, setFormData] = useState({
    id: null,
    customId: '',
    name: '',
    category: '',
    weight: 0,
    time: 0,
    packaging: 0,
    energyTariff: 10,
    margin: 100,
    precoConcorrente: '',
    finalPrice: '',
    photo: '',
    threemfUrl: '',
    color: '',
    colorHex: '#111827',
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

  const handleColorChange = (colorName, colorHex) => {
    setFormData((prev) => ({
      ...prev,
      color: colorName,
      ...(colorHex && { colorHex }),
    }));
  };

  /**
   * Apply data extracted from a parsed 3MF file into the calculator form.
   * Only overwrites fields that the parser actually found (non-null).
   * Also stores the Firebase Storage URL if the file was uploaded.
   */
  const apply3mfData = ({ name, weightGrams, printTimeHours, threemfUrl, color, colorHex }) => {
    setFormData((prev) => ({
      ...prev,
      ...(name != null && { name }),
      ...(weightGrams != null && { weight: weightGrams }),
      ...(printTimeHours != null && { time: printTimeHours }),
      ...(threemfUrl != null && { threemfUrl }),
      ...(color != null && { color }),
      ...(colorHex != null && { colorHex }),
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

  const nextProductId = generateNextProductId(history);

  const resetForm = () => {
    setFormData({
      id: null,
      customId: '',
      name: '',
      category: '',
      weight: 0,
      time: 0,
      packaging: 0,
      energyTariff: 10,
      margin: 100,
      precoConcorrente: '',
      finalPrice: '',
      photo: '',
      threemfUrl: '',
      color: '',
      colorHex: '#111827',
    });
  };

  const loadBudget = (budget) => {
    setFormData({
      id: budget.id || null,
      customId: budget.customId || '',
      name: budget.name || '',
      category: budget.category || '',
      weight: budget.weight || 0,
      time: budget.time || 0,
      packaging: budget.packaging || 0,
      energyTariff: budget.energyTariff || 10,
      margin: budget.margin ?? 100,
      precoConcorrente: budget.precoConcorrente || '',
      finalPrice: budget.finalPrice || '',
      photo: budget.photo || '',
      threemfUrl: budget.threemfUrl || '',
      color: budget.color || '',
      colorHex: budget.colorHex || '#111827',
    });
  };

  const saveBudget = async () => {
    if (!formData.name) return;
    
    // If updating an existing budget
    if (formData.id) {
      try {
        const budgetRef = doc(db, 'budgets', formData.id);
        const { id, ...dataToSave } = formData;
        await updateDoc(budgetRef, {
          ...dataToSave,
          ...results,
          updatedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Error updating budget in Firestore: ", error);
      }
      return;
    }

    // New product: generate sequential ID (e.g. AP2026001)
    const assignedId = formData.customId || generateNextProductId(history);

    const newBudget = {
      customId: assignedId,
      date: new Date().toISOString(),
      isFavorite: false,
      ...formData,
      ...results
    };
    delete newBudget.id;
    
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

  const updateBudgetCategory = async (ids, categoryName) => {
    try {
      await Promise.all(
        ids.map((id) =>
          updateDoc(doc(db, 'budgets', id), { category: categoryName })
        )
      );
    } catch (error) {
      console.error('Error updating budget categories:', error);
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
    toggleFavorite,
    updateBudgetCategory,
    apply3mfData,
    nextProductId,
    handleColorChange,
  };
}
