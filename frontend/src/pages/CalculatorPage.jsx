// pages/CalculatorPage.jsx
import { useState, useEffect } from 'react';
import { calculateRequiredGrade, getHistory, calculateAverage } from '../services/firestoreService';

export const CalculatorPage = ({ user, onLogout }) => {
  const [evaluaciones, setEvaluaciones] = useState([
    { id: 1, nombre: 'Parcial 1', nota: '', peso: '' },
    { id: 2, nombre: 'Parcial 2', nota: '', peso: '' },
    { id: 3, nombre: 'Final', nota: '', peso: '' }
  ]);
  const [notaObjetivo, setNotaObjetivo] = useState(10.5);
  const [resultado, setResultado] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mostrarHistorial, setMostrarHistorial] = useState(false);

  useEffect(() => {
    cargarHistorial();
  }, [user.uid]);

  const cargarHistorial = async () => {
    try {
      const data = await getHistory(user.uid, 10);
      setHistorial(data);
    } catch (err) {
      console.error('Error al cargar historial:', err);
    }
  };

  const validarEvaluaciones = () => {
    const pesoTotal = evaluaciones.reduce((sum, ev) => {
      const peso = parseFloat(ev.peso);
      return sum + (isNaN(peso) ? 0 : peso);
    }, 0);

    if (pesoTotal === 0) {
      setError('Debes agregar al menos una evaluación con peso');
      return false;
    }

    if (Math.abs(pesoTotal - 1) > 0.01) {
      setError(`La suma de pesos debe ser 1.0 (actualmente: ${pesoTotal.toFixed(2)})`);
      return false;
    }

    return true;
  };

  const calcularNotaFaltante = async () => {
    if (!validarEvaluaciones()) return;

    setLoading(true);
    setError('');

    try {
      const resultado = await calculateRequiredGrade(user.uid, evaluaciones, notaObjetivo);
      
      setResultado({
        notaRequerida: resultado.notaRequerida,
        notaActual: resultado.notaActual,
        esAlcanzable: resultado.esAlcanzable,
        mensaje: resultado.mensaje,
        pesoRestante: resultado.pesoRestante
      });

      await cargarHistorial();
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Error al calcular la nota');
    } finally {
      setLoading(false);
    }
  };

  const calcularPromedio = () => {
    if (!validarEvaluaciones()) return;

    const promedio = calculateAverage(evaluaciones);
    setResultado({
      notaActual: promedio,
      mensaje: `Tu promedio actual es: ${promedio}`
    });
  };

  const agregarEvaluacion = () => {
    setEvaluaciones([
      ...evaluaciones,
      { id: Date.now(), nombre: '', nota: '', peso: '' }
    ]);
  };

  const eliminarEvaluacion = (id) => {
    if (evaluaciones.length > 1) {
      setEvaluaciones(evaluaciones.filter(ev => ev.id !== id));
    }
  };

  const actualizarEvaluacion = (id, campo, valor) => {
    setEvaluaciones(
      evaluaciones.map(ev =>
        ev.id === id ? { ...ev, [campo]: valor } : ev
      )
    );
  };

  const limpiarFormulario = () => {
    setEvaluaciones([
      { id: 1, nombre: 'Parcial 1', nota: '', peso: '' },
      { id: 2, nombre: 'Parcial 2', nota: '', peso: '' },
      { id: 3, nombre: 'Final', nota: '', peso: '' }
    ]);
    setNotaObjetivo(10.5);
    setResultado(null);
    setError('');
  };

  const pesoTotal = evaluaciones.reduce((sum, ev) => {
    const peso = parseFloat(ev.peso);
    return sum + (isNaN(peso) ? 0 : peso);
  }, 0);

  const pesoEsCorrecto = Math.abs(pesoTotal - 1) < 0.01;

  return (
    <div className="app">
      {/* Header mejorado */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo-section">
              <div className="logo-icon">📊</div>
              <div>
                <h1 className="header-title">Calculadora de Notas</h1>
                <p className="header-subtitle">Sistema Universitario</p>
              </div>
            </div>
            <div className="user-section">
              <div className="user-info-card">
                <span className="user-icon">👤</span>
                <span className="user-email">{user.email}</span>
              </div>
              <button onClick={onLogout} className="btn-logout">
                <span>🚪</span> Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          <div className="layout-grid">
            {/* Panel izquierdo - Formulario */}
            <div className="left-panel">
              {/* Nota Objetivo */}
              <div className="card objetivo-card">
                <div className="card-header-simple">
                  <h2 className="card-title">
                    <span className="icon">🎯</span>
                    Nota Objetivo
                  </h2>
                </div>
                <div className="objetivo-content">
                  <label className="objetivo-label">
                    ¿Qué nota deseas alcanzar?
                  </label>
                  <div className="objetivo-input-wrapper">
                    <input
                      type="number"
                      min="0"
                      max="20"
                      step="0.1"
                      value={notaObjetivo}
                      onChange={(e) => setNotaObjetivo(parseFloat(e.target.value))}
                      className="objetivo-input"
                    />
                    <span className="objetivo-unit">/ 20</span>
                  </div>
                </div>
              </div>

              {/* Evaluaciones */}
              <div className="card evaluaciones-card">
                <div className="card-header-with-badge">
                  <h2 className="card-title">
                    <span className="icon">📝</span>
                    Evaluaciones
                  </h2>
                  <div className={`peso-badge ${pesoEsCorrecto ? 'correcto' : 'incorrecto'}`}>
                    <span className="peso-icon">{pesoEsCorrecto ? '✓' : '⚠'}</span>
                    Peso: {pesoTotal.toFixed(2)}
                  </div>
                </div>

                <div className="evaluaciones-list">
                  {evaluaciones.map((ev, index) => (
                    <div key={ev.id} className="evaluacion-item">
                      <div className="evaluacion-number">{index + 1}</div>
                      <div className="evaluacion-fields">
                        <div className="field-group">
                          <label className="field-label">Nombre</label>
                          <input
                            type="text"
                            placeholder="Ej: Parcial 1"
                            value={ev.nombre}
                            onChange={(e) => actualizarEvaluacion(ev.id, 'nombre', e.target.value)}
                            className="field-input"
                          />
                        </div>
                        <div className="field-group field-small">
                          <label className="field-label">Nota (0-20)</label>
                          <input
                            type="number"
                            min="-1"
                            max="20"
                            step="0.1"
                            placeholder="-1"
                            value={ev.nota}
                            onChange={(e) => actualizarEvaluacion(ev.id, 'nota', e.target.value)}
                            className="field-input text-center"
                          />
                        </div>
                        <div className="field-group field-small">
                          <label className="field-label">Peso (0-1)</label>
                          <input
                            type="number"
                            min="0"
                            max="1"
                            step="0.01"
                            placeholder="0.3"
                            value={ev.peso}
                            onChange={(e) => actualizarEvaluacion(ev.id, 'peso', e.target.value)}
                            className="field-input text-center"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => eliminarEvaluacion(ev.id)}
                        className="btn-delete"
                        disabled={evaluaciones.length === 1}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>

                <div className="evaluaciones-actions">
                  <button onClick={agregarEvaluacion} className="btn-secondary-outline">
                    <span>➕</span> Agregar Evaluación
                  </button>
                  <button onClick={limpiarFormulario} className="btn-secondary-outline">
                    <span>🔄</span> Limpiar
                  </button>
                </div>

                <div className="hint-box">
                  <span className="hint-icon">💡</span>
                  <span>Usa -1 o vacío para evaluaciones pendientes. Los pesos deben sumar 1.0</span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="actions-grid">
                <button
                  onClick={calcularNotaFaltante}
                  disabled={loading}
                  className="btn-primary-large"
                >
                  {loading ? (
                    <>
                      <span className="spinner">⏳</span> Calculando...
                    </>
                  ) : (
                    <>
                      <span>🎯</span> Calcular Nota Requerida
                    </>
                  )}
                </button>
                <button onClick={calcularPromedio} className="btn-secondary-large">
                  <span>📊</span> Calcular Promedio
                </button>
              </div>
            </div>

            {/* Panel derecho - Resultados */}
            <div className="right-panel">
              {/* Mensaje de error */}
              {error && (
                <div className="alert alert-error">
                  <span className="alert-icon">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Resultado */}
              {resultado && (
                <div className={`card resultado-card ${
                  resultado.esAlcanzable === false ? 'no-alcanzable' : 
                  resultado.esAlcanzable ? 'alcanzable' : ''
                }`}>
                  <div className="resultado-header">
                    <span className="resultado-icon">
                      {resultado.esAlcanzable === false ? '❌' : 
                       resultado.esAlcanzable ? '✅' : '📊'}
                    </span>
                    <h3 className="resultado-title">Resultado</h3>
                  </div>
                  
                  <div className="resultado-body">
                    <p className="resultado-mensaje">{resultado.mensaje}</p>
                    
                    <div className="resultado-stats">
                      {resultado.notaActual && (
                        <div className="stat-item">
                          <span className="stat-label">Nota Actual</span>
                          <span className="stat-value actual">{resultado.notaActual}</span>
                        </div>
                      )}
                      {resultado.notaRequerida && (
                        <div className="stat-item">
                          <span className="stat-label">Nota Requerida</span>
                          <span className={`stat-value ${resultado.esAlcanzable ? 'requerida' : 'imposible'}`}>
                            {resultado.notaRequerida}
                          </span>
                        </div>
                      )}
                      {resultado.pesoRestante && (
                        <div className="stat-item">
                          <span className="stat-label">Peso Restante</span>
                          <span className="stat-value restante">{resultado.pesoRestante}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Historial */}
              {historial.length > 0 && (
                <div className="card historial-card">
                  <div className="card-header-toggle">
                    <h3 className="card-title">
                      <span className="icon">📚</span>
                      Historial ({historial.length})
                    </h3>
                    <button 
                      onClick={() => setMostrarHistorial(!mostrarHistorial)}
                      className="btn-toggle"
                    >
                      {mostrarHistorial ? '▼' : '▶'}
                    </button>
                  </div>
                  
                  {mostrarHistorial && (
                    <div className="historial-list">
                      {historial.map((item) => (
                        <div key={item.id} className="historial-item">
                          <div className="historial-date">{item.fecha}</div>
                          <div className="historial-details">
                            <span className="detail">Objetivo: <strong>{item.notaObjetivo}</strong></span>
                            <span className="detail">Actual: <strong>{item.notaActual}</strong></span>
                            <span className="detail">Requerida: <strong>{item.notaRequerida}</strong></span>
                          </div>
                          <div className={`historial-badge ${item.esAlcanzable ? 'alcanzable' : 'no-alcanzable'}`}>
                            {item.esAlcanzable ? '✅ Alcanzable' : '❌ No alcanzable'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Información adicional */}
              <div className="info-card">
                <h4 className="info-title">ℹ️ Información</h4>
                <ul className="info-list">
                  <li>Los pesos deben estar entre 0 y 1</li>
                  <li>La suma total de pesos debe ser 1.0</li>
                  <li>Usa -1 para evaluaciones pendientes</li>
                  <li>Las notas van de 0 a 20</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>🎓 Sistema Universitario de Notas | Desarrollado con React + Firebase</p>
        </div>
      </footer>
    </div>
  );
};