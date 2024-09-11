// Importar las funciones necesarias del SDK de Firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Firestore
import { getAuth } from "firebase/auth"; // Autenticación

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC7SRWjDHolP45_MUTYL4HTndLWnjQuCig",
  authDomain: "tasking-eafda.firebaseapp.com",
  databaseURL: "https://tasking-eafda-default-rtdb.firebaseio.com", // URL para Realtime Database
  projectId: "tasking-eafda",
  storageBucket: "tasking-eafda.appspot.com",
  messagingSenderId: "340528068216",
  appId: "1:340528068216:web:a14edb4f5cf2106c049f8d",
  measurementId: "G-YS01XP453R"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar Firestore y autenticación
export const db = getFirestore(app); // Cambiado a getFirestore para Firestore
export const auth = getAuth(app); // Autenticación