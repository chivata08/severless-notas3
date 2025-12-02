// pages/LoginPage.jsx
import { useState } from 'react';

export const LoginPage = ({ onLogin, loading, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onLogin(email, password);
  };

  return (
    <div className="app">
      <div className="login-container">
        <h1>Sistema de Cálculo de Notas</h1>
        <p className="subtitle">Gestiona tus evaluaciones académicas</p>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>

          {error && (
            <div className="error-message">
              <span>⚠️</span> {error}
            </div>
          )}

          <div className="demo-credentials">
            <p className="hint">
              <strong>Usuario demo:</strong><br />
              📧 20221048@urp.edu.pe<br />
              🔑 miproyecto123
            </p>
          </div>
        </form>

        <footer className="login-footer">
          <p>🎓 Sistema Universitario de Notas</p>
        </footer>
      </div>
    </div>
  );
};