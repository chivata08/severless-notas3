// components/HistoryList.jsx
export const HistoryList = ({ historial, loading }) => {
  if (loading) {
    return (
      <div className="historial-loading">
        <p>⏳ Cargando historial...</p>
      </div>
    );
  }

  if (historial.length === 0) {
    return (
      <div className="historial-empty">
        <span className="empty-icon">📋</span>
        <p>No hay simulaciones guardadas</p>
        <p className="hint">Realiza tu primer cálculo para verlo aquí</p>
      </div>
    );
  }

  return (
    <div className="historial-lista">
      {historial.map((sim) => (
        <div key={sim.id} className="historial-item">
          <div className="historial-header">
            <span className="historial-icon">
              {sim.promedio ? '📊' : '🎯'}
            </span>
            <span className="historial-fecha">
              {new Date(sim.timestamp).toLocaleString('es-PE', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          
          <div className="historial-datos">
            {sim.promedio && (
              <div className="dato">
                <span className="label">Promedio:</span>
                <span className="value">{sim.promedio.toFixed(2)}</span>
              </div>
            )}
            {sim.notaFaltante && (
              <div className="dato">
                <span className="label">Nota faltante:</span>
                <span className="value">{sim.notaFaltante.toFixed(2)}</span>
              </div>
            )}
          </div>

          {sim.evaluaciones && (
            <div className="historial-evaluaciones">
              <p className="small-text">
                {sim.evaluaciones.length} evaluación(es)
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};