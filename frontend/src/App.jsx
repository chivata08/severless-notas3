// App.jsx
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { CalculatorPage } from './pages/CalculatorPage';
import './App.css';

function App() {
  const { user, loading, error, signIn, signOut } = useAuth();

  // Mostrar loader mientras verifica autenticación
  if (loading) {
    return (
      <div className="app">
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, mostrar login
  if (!user) {
    return (
      <LoginPage 
        onLogin={signIn} 
        loading={loading} 
        error={error} 
      />
    );
  }

  // Si hay usuario, mostrar calculadora
  return (
    <CalculatorPage 
      user={user} 
      onLogout={signOut} 
    />
  );
}

export default App;