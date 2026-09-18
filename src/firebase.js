import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCIwfd2InvQVcMnhqgn8NdIF5Rb7MaSmj4",
  authDomain: "leonard-3d4a5.firebaseapp.com",
  projectId: "leonard-3d4a5",
  storageBucket: "leonard-3d4a5.firebasestorage.app",
  messagingSenderId: "1014249401404",
  appId: "1:1014249401404:web:6ffbc9668b1cd66863a739",
  measurementId: "G-RVZCRLW5QS",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
