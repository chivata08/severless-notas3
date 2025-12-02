// firebase/config.js - Usando variables de entorno
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Configuración usando variables de entorno
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA1pPBcXXRgQtCTlDmUzPVbskzjdn_yphs",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "serverless-notas.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "serverless-notas",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "serverless-notas.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "446511702980",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:446511702980:web:70e447193010000c493a91"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Auth
export const auth = getAuth(app);

// Exportar app por si se necesita en otros lugares
export default app;

// Log para verificar en desarrollo
if (import.meta.env.DEV) {
  console.log('🔥 Firebase inicializado con proyecto:', firebaseConfig.projectId);
}