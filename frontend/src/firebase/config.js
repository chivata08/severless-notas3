// firebase/config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA1pPBcXXRgQtCTlDmUzPVbskzjdn_yphs",
  authDomain: "serverless-notas.firebaseapp.com",
  projectId: "serverless-notas",
  storageBucket: "serverless-notas.firebasestorage.app",
  messagingSenderId: "446511702980",
  appId: "1:446511702980:web:70e447193010000c493a91",
  measurementId: "G-J74J03227J"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios que usarás
export const auth = getAuth(app);
export const db = getFirestore(app);