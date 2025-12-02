import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA1pPBcXXRgQtCTlDmUzPVbskzjdn_yphs",
  authDomain: "serverless-notas.firebaseapp.com",
  projectId: "serverless-notas",
  storageBucket: "serverless-notas.firebasestorage.app",
  messagingSenderId: "446511702980",
  appId: "1:446511702980:web:70e447193010000c493a91"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
