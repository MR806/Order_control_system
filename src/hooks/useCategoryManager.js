import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../firebase';

export function useCategoryManager() {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // ── Listen to categories collection ──────────────────────────────────────
  // NOTE: No orderBy() here — it requires a Firestore index on a new collection
  // and silently fails. We sort in JS instead.
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'categories'),
      (snapshot) => {
        const fetched = snapshot.docs
          .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
          .sort((a, b) =>
            (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' })
          );
        setCategories(fetched);
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
    // Prevent duplicates (case-insensitive)
    if (categories.some((c) => c.name.toLowerCase() === trimmedName.toLowerCase())) {
      return null;
    }
    try {
      const docRef = await addDoc(collection(db, 'categories'), {
        name: trimmedName,
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
