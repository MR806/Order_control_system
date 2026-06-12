import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBbMO7Zv4EzThZIP32uHvIN_7C0irjaAAA",
  authDomain: "product-calc-3d-2026.firebaseapp.com",
  projectId: "product-calc-3d-2026",
  storageBucket: "product-calc-3d-2026.firebasestorage.app",
  messagingSenderId: "873499583282",
  appId: "1:873499583282:web:9e7c782ab6ad305663ed2b"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
