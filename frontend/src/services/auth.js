// services/auth.js
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../firebase/config';

/**
 * Servicio de autenticación con Firebase
 */
export const authService = {
  /**
   * Iniciar sesión con email y contraseña
   */
  signIn: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return {
        success: true,
        user: userCredential.user,
        message: 'Sesión iniciada correctamente'
      };
    } catch (error) {
      return {
        success: false,
        error: getAuthErrorMessage(error.code),
        code: error.code
      };
    }
  },

  /**
   * Registrar nuevo usuario
   */
  signUp: async (email, password, displayName = '') => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Actualizar nombre si se proporciona
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }

      return {
        success: true,
        user: userCredential.user,
        message: 'Usuario registrado correctamente'
      };
    } catch (error) {
      return {
        success: false,
        error: getAuthErrorMessage(error.code),
        code: error.code
      };
    }
  },

  /**
   * Cerrar sesión
   */
  signOut: async () => {
    try {
      await firebaseSignOut(auth);
      return {
        success: true,
        message: 'Sesión cerrada correctamente'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al cerrar sesión',
        code: error.code
      };
    }
  },

  /**
   * Enviar email para recuperar contraseña
   */
  resetPassword: async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return {
        success: true,
        message: 'Email de recuperación enviado'
      };
    } catch (error) {
      return {
        success: false,
        error: getAuthErrorMessage(error.code),
        code: error.code
      };
    }
  },

  /**
   * Obtener usuario actual
   */
  getCurrentUser: () => {
    return auth.currentUser;
  },

  /**
   * Escuchar cambios de autenticación
   */
  onAuthChange: (callback) => {
    return onAuthStateChanged(auth, callback);
  },

  /**
   * Verificar si hay una sesión activa
   */
  isAuthenticated: () => {
    return auth.currentUser !== null;
  },

  /**
   * Obtener token del usuario actual
   */
  getToken: async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        return await user.getIdToken();
      }
      return null;
    } catch (error) {
      console.error('Error al obtener token:', error);
      return null;
    }
  }
};

/**
 * Obtener mensaje de error amigable según el código de error
 */
const getAuthErrorMessage = (errorCode) => {
  const errorMessages = {
    // Errores de inicio de sesión
    'auth/invalid-email': 'El correo electrónico no es válido',
    'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
    'auth/user-not-found': 'No existe una cuenta con este correo electrónico',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/invalid-credential': 'Credenciales inválidas. Verifica tu correo y contraseña',
    
    // Errores de registro
    'auth/email-already-in-use': 'Este correo electrónico ya está registrado',
    'auth/operation-not-allowed': 'Operación no permitida',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
    
    // Errores generales
    'auth/too-many-requests': 'Demasiados intentos fallidos. Intenta más tarde',
    'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
    'auth/popup-closed-by-user': 'Ventana cerrada por el usuario',
    'auth/cancelled-popup-request': 'Solicitud cancelada',
    
    // Errores de recuperación de contraseña
    'auth/invalid-action-code': 'El código de recuperación es inválido o ha expirado',
    'auth/expired-action-code': 'El código de recuperación ha expirado',
    
    // Error por defecto
    'default': 'Error al realizar la operación. Intenta nuevamente'
  };

  return errorMessages[errorCode] || errorMessages['default'];
};

/**
 * Validar formato de email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validar fortaleza de contraseña
 */
export const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 6) {
    errors.push('La contraseña debe tener al menos 6 caracteres');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Debe contener al menos una letra mayúscula');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Debe contener al menos una letra minúscula');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Debe contener al menos un número');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};