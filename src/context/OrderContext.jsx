import React, { createContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [products, setProducts] = useState({});
  const [orders, setOrders] = useState([
    {
      order_id: 'ORD-INIT',
      client_name: 'Alice Johnson',
      client_contact: 'alice@example.com',
      items: [], // cleared mock items as they relied on old mock products
      total_price: 0,
      status: 'New Request'
    }
  ]);

  useEffect(() => {
    const q = query(collection(db, 'budgets'), orderBy('date', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedProducts = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        fetchedProducts[doc.id] = {
          product_id: doc.id,
          name: data.name || 'Unnamed Product',
          filament_type: 'Standard PLA', // Fallback, since it wasn't explicit in the calculator DB
          print_time_hours: data.time || 0,
          calculated_price: data.sellPrice || data.finalPrice || 0,
          photo: data.photo || null,
        };
      });
      setProducts(fetchedProducts);
    }, (error) => {
      console.error("Error fetching products from Firestore: ", error);
    });

    return () => unsubscribe();
  }, []);

  const addOrder = (orderData) => {
    const newOrder = {
      ...orderData,
      order_id: `ORD-${uuidv4().slice(0, 4).toUpperCase()}`,
    };
    setOrders([...orders, newOrder]);
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(o => o.order_id === orderId ? { ...o, status: newStatus } : o));
  };

  const deleteOrder = (orderId) => {
    setOrders(orders.filter(o => o.order_id !== orderId));
  };

  // Dynamically calculate live prices for existing orders based on real-time products data
  const liveOrders = orders.map(order => {
    let newTotalPrice = 0;
    const newItems = order.items.map(item => {
      const liveProduct = products[item.product_id];
      // Fallback to the saved static price if the product was deleted
      const currentPrice = liveProduct ? liveProduct.calculated_price : item.price;
      newTotalPrice += currentPrice * item.quantity;
      return { ...item, price: currentPrice };
    });
    return { ...order, items: newItems, total_price: newTotalPrice };
  });

  return (
    <OrderContext.Provider value={{ products, orders: liveOrders, addOrder, updateOrderStatus, deleteOrder }}>
      {children}
    </OrderContext.Provider>
  );
};
