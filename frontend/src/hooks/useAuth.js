// hooks/useAuth.js
import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  onAuthStateChanged, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { auth } from '../firebase/config';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    setLoading(true);
    setError('');
    
    // Logs de depuración
    console.log('🔐 Intentando login con:');
    console.log('Email:', email);
    console.log('Email length:', email.length);
    console.log('Password length:', password.length);
    console.log('Email trimmed:', email.trim());
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      console.log('✅ Login exitoso:', userCredential.user.email);
      return { success: true, user: userCredential.user };
    } catch (err) {
      console.error('❌ Error de autenticación:', err.code);
      console.error('Mensaje completo:', err.message);
      console.error('Error completo:', err);
      const errorMessage = getAuthErrorMessage(err.code);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Nueva función para registrar usuarios
  const signUp = async (email, password) => {
    setLoading(true);
    setError('');
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Usuario creado exitosamente:', userCredential.user.email);
      return { success: true, user: userCredential.user };
    } catch (err) {
      console.error('Error al crear usuario:', err.code, err.message);
      const errorMessage = getAuthErrorMessage(err.code);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      return { success: true };
    } catch (err) {
      setError('Error al cerrar sesión');
      return { success: false, error: err.message };
    }
  };

  return { user, loading, error, signIn, signUp, signOut };
};

// Helper para mensajes de error amigables
const getAuthErrorMessage = (errorCode) => {
  const errorMessages = {
    'auth/invalid-email': 'El correo electrónico no es válido',
    'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
    'auth/user-not-found': 'No existe una cuenta con este correo',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/invalid-credential': 'Credenciales inválidas. Verifica tu correo y contraseña',
    'auth/too-many-requests': 'Demasiados intentos fallidos. Intenta más tarde',
    'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
    'auth/email-already-in-use': 'Este correo ya está registrado',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres'
  };

  return errorMessages[errorCode] || `Error de autenticación: ${errorCode}`;
};