import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDfeUqBGbbFaUpt9YhKu9ildD1sgGbMsnE",
  authDomain: "order-control-system-mr806.firebaseapp.com",
  projectId: "product-calc-3d-2026",
  storageBucket: "order-control-system-mr806.firebasestorage.app",
  messagingSenderId: "698558491454",
  appId: "1:698558491454:web:3d27bbc44c16a4538eda6f"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
