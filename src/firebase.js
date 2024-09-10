// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";  // Agregamos Firestore
// import { getAnalytics } from "firebase/analytics"; // Puedes usar analytics si lo necesitas

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBJy6vYQWp8x1ZiW1HdH5OIstLVIIQwAaI",
  authDomain: "okngoo-solutions.firebaseapp.com",
  projectId: "okngoo-solutions",
  storageBucket: "okngoo-solutions.appspot.com",
  messagingSenderId: "407556820382",
  appId: "1:407556820382:web:bdc698da950431e3595a8f",
  measurementId: "G-MRFY8D5M2D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Inicializa Firestore
const db = getFirestore(app);

export { db };  // Exportamos la instancia de Firestore para usarla en los componentes
