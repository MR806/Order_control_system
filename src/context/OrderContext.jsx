import React, { createContext, useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

export const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [products, setProducts] = useState({});
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // ── Listen to products (budgets collection) ──────────────────────────────
  useEffect(() => {
    const q = query(collection(db, 'budgets'), orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedProducts = {};
        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data();
          fetchedProducts[docSnap.id] = {
            product_id: docSnap.id,
            name: data.name || 'Unnamed Product',
            filament_type: 'Standard PLA',
            print_time_hours: data.time || 0,
            calculated_price:
              data.finalPrice && data.finalPrice !== ''
                ? Number(data.finalPrice)
                : data.sellPrice || 0,
            photo: data.photo || null,
          };
        });
        setProducts(fetchedProducts);
      },
      (error) => {
        console.error('Error fetching products from Firestore: ', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // ── Listen to orders collection (real-time, persisted) ───────────────────
  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedOrders = snapshot.docs.map((docSnap) => ({
          order_id: docSnap.id,
          ...docSnap.data(),
        }));
        setOrders(fetchedOrders);
        setOrdersLoading(false);
      },
      (error) => {
        console.error('Error fetching orders from Firestore: ', error);
        setOrdersLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // ── Add a new order ───────────────────────────────────────────────────────
  const addOrder = async (orderData) => {
    try {
      await addDoc(collection(db, 'orders'), {
        ...orderData,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error adding order: ', error);
    }
  };

  // ── Update order status ───────────────────────────────────────────────────
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
    } catch (error) {
      console.error('Error updating order status: ', error);
    }
  };

  // ── Delete an order ───────────────────────────────────────────────────────
  const deleteOrder = async (orderId) => {
    try {
      await deleteDoc(doc(db, 'orders', orderId));
    } catch (error) {
      console.error('Error deleting order: ', error);
    }
  };

  // ── Dynamically recalculate prices from live products data ────────────────
  const liveOrders = orders.map((order) => {
    let newTotalPrice = 0;
    const newItems = (order.items || []).map((item) => {
      const liveProduct = products[item.product_id];
      const currentPrice = liveProduct ? liveProduct.calculated_price : item.price;
      newTotalPrice += currentPrice * item.quantity;
      return { ...item, price: currentPrice };
    });
    return { ...order, items: newItems, total_price: newTotalPrice };
  });

  return (
    <OrderContext.Provider
      value={{
        products,
        orders: liveOrders,
        ordersLoading,
        addOrder,
        updateOrderStatus,
        deleteOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};
