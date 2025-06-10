import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase konfiguratsiyasi
const firebaseConfig = {
  apiKey: "AIzaSyAb70DRiGBZyxFVKJV6r8bUkKNea1Sxi6E",
  authDomain: "gost-testapp.firebaseapp.com",
  projectId: "gost-testapp",
  storageBucket: "gost-testapp.appspot.com",
  messagingSenderId: "833721732952",
  appId: "1:833721732952:web:731ceca3330a11e0575f2d",
  measurementId: "G-VBG7X9BNN2"
};

// Firebase ilovasini ishga tushirish
const app = initializeApp(firebaseConfig);

// Firestore va Authentication oling
const db = getFirestore(app);
const auth = getAuth(app);

// Eksport qilish
export { db, auth };