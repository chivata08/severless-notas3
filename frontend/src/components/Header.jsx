// components/Header.jsx
export const Header = ({ user, onLogout }) => {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <h1>🎓 Calculadora de Notas</h1>
          {user && (
            <span className="user-email">{user.email}</span>
          )}
        </div>
        <div className="header-right">
          <button onClick={onLogout} className="logout-btn">
            <span>🚪</span> Cerrar Sesión
          </button>
        </div>
      </div>
    </header>
  );
};