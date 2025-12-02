// pages/CalculatorPage.jsx
import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { EvaluationForm } from '../components/EvaluationForm';
import { ResultDisplay } from '../components/ResultDisplay';
import { HistoryList } from '../components/HistoryList';
import { api } from '../services/api';

export const CalculatorPage = ({ user, onLogout }) => {
  const [evaluaciones, setEvaluaciones] = useState([{ nota: '', peso: '' }]);
  const [resultado, setResultado] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState('');

  // Cargar historial al montar
  useEffect(() => {
    if (user) {
      cargarHistorial();
    }
  }, [user]);

  const cargarHistorial = async () => {
    setLoadingHistory(true);
    try {
      const data = await api.getHistory(user.uid);
      setHistorial(data);
    } catch (err) {
      console.error('Error al cargar historial:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const agregarEvaluacion = () => {
    setEvaluaciones([...evaluaciones, { nota: '', peso: '' }]);
  };

  const eliminarEvaluacion = (index) => {
    setEvaluaciones(evaluaciones.filter((_, i) => i !== index));
  };

  const actualizarEvaluacion = (index, field, value) => {
    const nuevas = [...evaluaciones];
    nuevas[index][field] = value;
    setEvaluaciones(nuevas);
  };

  const validarEvaluaciones = (evals) => {
    // Verificar que haya al menos una evaluación
    if (evals.length === 0) {
      throw new Error('Debes agregar al menos una evaluación');
    }

    // Verificar que todos los pesos sean válidos
    if (evals.some(e => isNaN(e.peso) || e.peso <= 0 || e.peso > 1)) {
      throw new Error('Todos los pesos deben ser números entre 0 y 1');
    }

    // Verificar que las notas válidas estén en rango
    const notasValidas = evals.filter(e => e.nota !== null);
    if (notasValidas.some(e => e.nota < 0 || e.nota > 20)) {
      throw new Error('Las notas deben estar entre 0 y 20');
    }
  };

  const calcularPromedio = async () => {
    setLoading(true);
    setError('');
    
    try {
      const evals = evaluaciones.map(e => ({
        nota: parseFloat(e.nota),
        peso: parseFloat(e.peso)
      }));

      validarEvaluaciones(evals);

      // Verificar que todas las notas estén completas
      if (evals.some(e => isNaN(e.nota))) {
        throw new Error('Todas las notas deben estar completas para calcular el promedio');
      }

      const data = await api.calculateAverage(evals);
      setResultado({ tipo: 'promedio', valor: data.promedio });

      // Guardar simulación
      await api.saveSimulation({
        evaluaciones: evals,
        promedio: data.promedio,
        notaFaltante: null,
        userId: user.uid
      });

      cargarHistorial();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calcularNotaFaltante = async () => {
    setLoading(true);
    setError('');
    
    try {
      const evals = evaluaciones.map(e => ({
        nota: e.nota === '' ? null : parseFloat(e.nota),
        peso: parseFloat(e.peso)
      }));

      validarEvaluaciones(evals);

      // Verificar que haya exactamente una nota faltante
      const notasFaltantes = evals.filter(e => e.nota === null).length;
      if (notasFaltantes === 0) {
        throw new Error('Debes dejar una nota vacía para calcular la nota faltante');
      }
      if (notasFaltantes > 1) {
        throw new Error('Solo puedes calcular una nota faltante a la vez');
      }

      const data = await api.calculateRequiredGrade(evals, 10.5);
      setResultado({ 
        tipo: 'faltante', 
        valor: data.notaFaltante,
        alcanzable: data.esAlcanzable
      });

      // Guardar simulación
      await api.saveSimulation({
        evaluaciones: evals,
        promedio: null,
        notaFaltante: data.notaFaltante,
        userId: user.uid
      });

      cargarHistorial();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <Header user={user} onLogout={onLogout} />

      <div className="container">
        <div className="calculadora-section">
          <EvaluationForm
            evaluaciones={evaluaciones}
            onAdd={agregarEvaluacion}
            onUpdate={actualizarEvaluacion}
            onDelete={eliminarEvaluacion}
            onCalculateAverage={calcularPromedio}
            onCalculateRequired={calcularNotaFaltante}
            loading={loading}
          />

          <ResultDisplay resultado={resultado} error={error} />
        </div>

        <div className="historial-section">
          <h2>📚 Historial de Simulaciones</h2>
          <HistoryList historial={historial} loading={loadingHistory} />
        </div>
      </div>
    </div>
  );
};