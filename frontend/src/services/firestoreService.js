// services/firestoreService.js
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Calcular nota faltante
export const calculateRequiredGrade = async (userId, evaluaciones, notaObjetivo = 10.5) => {
  try {
    // Validar datos
    if (!evaluaciones || evaluaciones.length === 0) {
      throw new Error('Debes agregar al menos una evaluación');
    }

    // Calcular peso total y nota acumulada
    let pesoTotal = 0;
    let notaAcumulada = 0;
    let pesoRestante = 0;

    evaluaciones.forEach(ev => {
      const nota = parseFloat(ev.nota);
      const peso = parseFloat(ev.peso);

      if (isNaN(nota) || isNaN(peso)) {
        throw new Error('Todas las notas y pesos deben ser números válidos');
      }

      if (nota >= 0 && nota <= 20) {
        // Evaluación con nota
        pesoTotal += peso;
        notaAcumulada += nota * peso;
      } else {
        // Evaluación pendiente
        pesoRestante += peso;
      }
    });

    // Verificar que hay peso restante
    if (pesoRestante === 0) {
      throw new Error('No hay evaluaciones pendientes para calcular');
    }

    // Calcular nota requerida
    const notaRequerida = (notaObjetivo - notaAcumulada) / pesoRestante;

    // Calcular nota actual
    const notaActual = pesoTotal > 0 ? notaAcumulada / pesoTotal : 0;

    const resultado = {
      notaRequerida: Math.max(0, Math.min(20, notaRequerida)).toFixed(2),
      notaActual: notaActual.toFixed(2),
      pesoRestante: (pesoRestante * 100).toFixed(0),
      esAlcanzable: notaRequerida >= 0 && notaRequerida <= 20,
      mensaje: notaRequerida < 0 
        ? 'Ya alcanzaste el objetivo' 
        : notaRequerida > 20 
          ? 'El objetivo no es alcanzable'
          : `Necesitas sacar ${notaRequerida.toFixed(2)} en las evaluaciones restantes`
    };

    // Guardar en historial
    await saveToHistory(userId, evaluaciones, resultado, notaObjetivo);

    return resultado;
  } catch (error) {
    console.error('Error al calcular nota:', error);
    throw error;
  }
};

// Guardar en historial
const saveToHistory = async (userId, evaluaciones, resultado, notaObjetivo) => {
  try {
    await addDoc(collection(db, 'simulaciones'), {
      userId,
      evaluaciones,
      notaActual: parseFloat(resultado.notaActual),
      notaRequerida: parseFloat(resultado.notaRequerida),
      notaObjetivo,
      pesoRestante: parseFloat(resultado.pesoRestante),
      esAlcanzable: resultado.esAlcanzable,
      timestamp: serverTimestamp()
    });
    console.log('✅ Simulación guardada en Firestore');
  } catch (error) {
    console.error('Error al guardar historial:', error);
    // No lanzamos error para que el cálculo siga funcionando
  }
};

// Obtener historial
export const getHistory = async (userId, cantidad = 10) => {
  try {
    const q = query(
      collection(db, 'simulaciones'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(cantidad)
    );

    const querySnapshot = await getDocs(q);
    const historial = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      historial.push({
        id: doc.id,
        ...data,
        // Convertir timestamp a fecha legible
        fecha: data.timestamp?.toDate()?.toLocaleDateString('es-PE') || 'Reciente'
      });
    });

    return historial;
  } catch (error) {
    console.error('Error al obtener historial:', error);
    return [];
  }
};

// Calcular promedio
export const calculateAverage = (evaluaciones) => {
  if (!evaluaciones || evaluaciones.length === 0) return 0;

  let pesoTotal = 0;
  let notaAcumulada = 0;

  evaluaciones.forEach(ev => {
    const nota = parseFloat(ev.nota);
    const peso = parseFloat(ev.peso);

    if (!isNaN(nota) && !isNaN(peso) && nota >= 0 && nota <= 20) {
      pesoTotal += peso;
      notaAcumulada += nota * peso;
    }
  });

  return pesoTotal > 0 ? (notaAcumulada / pesoTotal).toFixed(2) : 0;
};