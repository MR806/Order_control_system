import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

export function useCategoryManager() {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // ── Listen to categories collection ──────────────────────────────────────
  useEffect(() => {
    const q = query(collection(db, 'categories'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedCategories = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setCategories(fetchedCategories);
        setCategoriesLoading(false);
      },
      (error) => {
        console.error('Error fetching categories:', error);
        setCategoriesLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // ── Create a category ─────────────────────────────────────────────────────
  const createCategory = async (name) => {
    const trimmedName = name.trim();
    if (!trimmedName) return null;
    // Prevent duplicates
    if (categories.some((c) => c.name.toLowerCase() === trimmedName.toLowerCase())) {
      return null;
    }
    try {
      const docRef = await addDoc(collection(db, 'categories'), {
        name: trimmedName,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating category:', error);
      return null;
    }
  };

  // ── Rename a category ─────────────────────────────────────────────────────
  const renameCategory = async (id, newName) => {
    const trimmedName = newName.trim();
    if (!trimmedName) return;
    try {
      await updateDoc(doc(db, 'categories', id), { name: trimmedName });
    } catch (error) {
      console.error('Error renaming category:', error);
    }
  };

  // ── Delete a category ─────────────────────────────────────────────────────
  const deleteCategory = async (id) => {
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  return {
    categories,
    categoriesLoading,
    createCategory,
    renameCategory,
    deleteCategory,
  };
}
