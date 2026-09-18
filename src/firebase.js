import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB6VBLDmJ0tiuyO4WNw40fCYddzwnW4umQ",
  authDomain: "elume-ar.firebaseapp.com",
  projectId: "elume-ar",
  storageBucket: "elume-ar.firebasestorage.app",
  messagingSenderId: "762445967049",
  appId: "1:762445967049:web:9a02d58d61e492cc0f6718",
  measurementId: "G-XB7NCB16PF"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
