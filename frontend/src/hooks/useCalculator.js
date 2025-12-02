// hooks/useCalculator.js
import { useState, useCallback } from 'react';
import { api } from '../services/api';
import { validarEvaluaciones, validarPromedio, validarNotaFaltante } from '../utils/validators';

export const useCalculator = (userId) => {
  const [evaluaciones, setEvaluaciones] = useState([{ nota: '', peso: '' }]);
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Agregar evaluación
  const agregarEvaluacion = useCallback(() => {
    setEvaluaciones(prev => [...prev, { nota: '', peso: '' }]);
    setResultado(null);
    setError('');
  }, []);

  // Eliminar evaluación
  const eliminarEvaluacion = useCallback((index) => {
    setEvaluaciones(prev => prev.filter((_, i) => i !== index));
    setResultado(null);
    setError('');
  }, []);

  // Actualizar evaluación
  const actualizarEvaluacion = useCallback((index, field, value) => {
    setEvaluaciones(prev => {
      const nuevas = [...prev];
      nuevas[index][field] = value;
      return nuevas;
    });
    setResultado(null);
    setError('');
  }, []);

  // Limpiar formulario
  const limpiarFormulario = useCallback(() => {
    setEvaluaciones([{ nota: '', peso: '' }]);
    setResultado(null);
    setError('');
  }, []);

  // Convertir evaluaciones a números
  const prepararEvaluaciones = useCallback((incluirNulos = false) => {
    return evaluaciones.map(e => ({
      nota: incluirNulos && e.nota === '' ? null : parseFloat(e.nota),
      peso: parseFloat(e.peso)
    }));
  }, [evaluaciones]);

  // Calcular promedio
  const calcularPromedio = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const evals = prepararEvaluaciones(false);
      
      // Validar
      validarEvaluaciones(evals);
      validarPromedio(evals);

      // Llamar API
      const data = await api.calculateAverage(evals);
      
      // Establecer resultado
      setResultado({ 
        tipo: 'promedio', 
        valor: data.promedio 
      });

      // Guardar simulación
      if (userId) {
        await api.saveSimulation({
          evaluaciones: evals,
          promedio: data.promedio,
          notaFaltante: null,
          userId
        });
      }

      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [evaluaciones, userId, prepararEvaluaciones]);

  // Calcular nota faltante
  const calcularNotaFaltante = useCallback(async (notaAprobatoria = 10.5) => {
    setLoading(true);
    setError('');

    try {
      const evals = prepararEvaluaciones(true);
      
      // Validar
      validarEvaluaciones(evals);
      validarNotaFaltante(evals);

      // Llamar API
      const data = await api.calculateRequiredGrade(evals, notaAprobatoria);
      
      // Establecer resultado
      setResultado({ 
        tipo: 'faltante', 
        valor: data.notaFaltante,
        alcanzable: data.esAlcanzable
      });

      // Guardar simulación
      if (userId) {
        await api.saveSimulation({
          evaluaciones: evals,
          promedio: null,
          notaFaltante: data.notaFaltante,
          userId
        });
      }

      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [evaluaciones, userId, prepararEvaluaciones]);

  // Verificar si el formulario está completo
  const esFormularioValido = useCallback(() => {
    return evaluaciones.every(e => e.peso !== '');
  }, [evaluaciones]);

  return {
    // Estado
    evaluaciones,
    resultado,
    loading,
    error,
    
    // Acciones
    agregarEvaluacion,
    eliminarEvaluacion,
    actualizarEvaluacion,
    calcularPromedio,
    calcularNotaFaltante,
    limpiarFormulario,
    
    // Helpers
    esFormularioValido
  };
};