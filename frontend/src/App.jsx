import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase/config';
import './App.css';

const API_URL = 'https://backend-notas3-oo2j71gtx-kris-projects-ab9428ca.vercel.app';

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Formulario de cálculo
  const [evaluaciones, setEvaluaciones] = useState([
    { nota: '', peso: '' }
  ]);
  const [resultado, setResultado] = useState(null);
  const [historial, setHistorial] = useState([]);

  // Escuchar cambios de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        cargarHistorial(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  // Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError('Error al iniciar sesión: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const handleLogout = () => {
    signOut(auth);
    setResultado(null);
    setHistorial([]);
  };

  // Agregar evaluación
  const agregarEvaluacion = () => {
    setEvaluaciones([...evaluaciones, { nota: '', peso: '' }]);
  };

  // Eliminar evaluación
  const eliminarEvaluacion = (index) => {
    setEvaluaciones(evaluaciones.filter((_, i) => i !== index));
  };

  // Actualizar evaluación
  const actualizarEvaluacion = (index, field, value) => {
    const nuevas = [...evaluaciones];
    nuevas[index][field] = value;
    setEvaluaciones(nuevas);
  };

  // Calcular promedio
  const calcularPromedio = async () => {
    setError('');
    
    const evals = evaluaciones.map(e => ({
      nota: parseFloat(e.nota),
      peso: parseFloat(e.peso)
    }));

    // Validar
    if (evals.some(e => isNaN(e.nota) || isNaN(e.peso))) {
      setError('Todos los campos deben ser números válidos');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/calculateAverage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evaluaciones: evals })
      });

      const data = await res.json();
      setResultado({ tipo: 'promedio', valor: data.promedio });

      // Guardar simulación
      await guardarSimulacion(evals, data.promedio, null);
    } catch (err) {
      setError('Error al calcular: ' + err.message);
    }
  };

  // Calcular nota faltante
  const calcularNotaFaltante = async () => {
    setError('');
    
    const evals = evaluaciones.map(e => ({
      nota: e.nota === '' ? null : parseFloat(e.nota),
      peso: parseFloat(e.peso)
    }));

    try {
      const res = await fetch(`${API_URL}/api/calculateRequiredGrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          evaluaciones: evals,
          notaAprobatoria: 10.5
        })
      });

      const data = await res.json();
      setResultado({ 
        tipo: 'faltante', 
        valor: data.notaFaltante,
        alcanzable: data.esAlcanzable
      });

      // Guardar simulación
      await guardarSimulacion(evals, null, data.notaFaltante);
    } catch (err) {
      setError('Error al calcular: ' + err.message);
    }
  };

  // Guardar simulación
  const guardarSimulacion = async (evals, promedio, notaFaltante) => {
    if (!user) return;

    try {
      await fetch(`${API_URL}/api/saveSimulation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evaluaciones: evals,
          promedio,
          notaFaltante,
          userId: user.uid
        })
      });

      cargarHistorial(user.uid);
    } catch (err) {
      console.error('Error al guardar:', err);
    }
  };

  // Cargar historial
  const cargarHistorial = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/api/getHistory?userId=${userId}`);
      const data = await res.json();
      setHistorial(data);
    } catch (err) {
      console.error('Error al cargar historial:', err);
    }
  };

  // Pantalla de login
  if (!user) {
    return (
      <div className="app">
        <div className="login-container">
          <h1>Sistema de Cálculo de Notas</h1>
          <form onSubmit={handleLogin} className="login-form">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
            {error && <p className="error">{error}</p>}
            <p className="hint">Usuario demo: 20221048@urp.edu.pe / miproyecto123</p>
          </form>
        </div>
      </div>
    );
  }

  // Pantalla principal
  return (
    <div className="app">
      <header>
        <h1>Calculadora de Notas</h1>
        <button onClick={handleLogout} className="logout-btn">Cerrar Sesión</button>
      </header>

      <div className="container">
        <div className="calculadora">
          <h2>Ingresar Evaluaciones</h2>
          
          {evaluaciones.map((ev, index) => (
            <div key={index} className="evaluacion-row">
              <input
                type="number"
                step="0.01"
                placeholder="Nota (0-20) o vacío"
                value={ev.nota}
                onChange={(e) => actualizarEvaluacion(index, 'nota', e.target.value)}
              />
              <input
                type="number"
                step="0.01"
                placeholder="Peso (0-1)"
                value={ev.peso}
                onChange={(e) => actualizarEvaluacion(index, 'peso', e.target.value)}
              />
              {evaluaciones.length > 1 && (
                <button 
                  onClick={() => eliminarEvaluacion(index)}
                  className="btn-eliminar"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <button onClick={agregarEvaluacion} className="btn-agregar">
            + Agregar Evaluación
          </button>

          <div className="botones">
            <button onClick={calcularPromedio} className="btn-primary">
              Calcular Promedio
            </button>
            <button onClick={calcularNotaFaltante} className="btn-secondary">
              Calcular Nota Faltante
            </button>
          </div>

          {error && <p className="error">{error}</p>}

          {resultado && (
            <div className="resultado">
              {resultado.tipo === 'promedio' ? (
                <h3>Promedio: {resultado.valor}</h3>
              ) : (
                <>
                  <h3>Nota Faltante: {resultado.valor}</h3>
                  <p>{resultado.alcanzable ? '✅ Alcanzable' : '❌ No alcanzable'}</p>
                </>
              )}
            </div>
          )}
        </div>

        <div className="historial">
          <h2>Historial de Simulaciones</h2>
          {historial.length === 0 ? (
            <p>No hay simulaciones guardadas</p>
          ) : (
            <div className="historial-lista">
              {historial.map((sim) => (
                <div key={sim.id} className="historial-item">
                  <p><strong>Fecha:</strong> {new Date(sim.timestamp).toLocaleString()}</p>
                  {sim.promedio && <p>Promedio: {sim.promedio}</p>}
                  {sim.notaFaltante && <p>Nota faltante: {sim.notaFaltante}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
