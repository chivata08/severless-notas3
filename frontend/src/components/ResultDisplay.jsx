// components/ResultDisplay.jsx
export const ResultDisplay = ({ resultado, error }) => {
  if (error) {
    return (
      <div className="error-box">
        <span className="error-icon">⚠️</span>
        <p>{error}</p>
      </div>
    );
  }

  if (!resultado) return null;

  return (
    <div className="resultado-box">
      {resultado.tipo === 'promedio' ? (
        <>
          <div className="resultado-header">
            <span className="icon">📊</span>
            <h3>Tu Promedio</h3>
          </div>
          <div className="resultado-valor">
            {resultado.valor.toFixed(2)}
          </div>
          <div className="resultado-estado">
            {resultado.valor >= 10.5 ? (
              <span className="aprobado">✅ Aprobado</span>
            ) : (
              <span className="desaprobado">❌ Desaprobado</span>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="resultado-header">
            <span className="icon">🎯</span>
            <h3>Nota Faltante</h3>
          </div>
          <div className="resultado-valor">
            {resultado.valor.toFixed(2)}
          </div>
          <div className="resultado-estado">
            {resultado.alcanzable ? (
              <span className="alcanzable">✅ Alcanzable (máximo 20)</span>
            ) : (
              <span className="no-alcanzable">❌ No alcanzable con nota máxima</span>
            )}
          </div>
          {resultado.alcanzable && (
            <p className="resultado-mensaje">
              Necesitas obtener al menos {resultado.valor.toFixed(2)} puntos en la evaluación faltante para aprobar.
            </p>
          )}
        </>
      )}
    </div>
  );
};