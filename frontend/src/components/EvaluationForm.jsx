// components/EvaluationForm.jsx
import { EvaluationRow } from './EvaluationRow';

export const EvaluationForm = ({ 
  evaluaciones, 
  onAdd, 
  onUpdate, 
  onDelete,
  onCalculateAverage,
  onCalculateRequired,
  loading 
}) => {
  return (
    <div className="evaluacion-form">
      <h2>📝 Ingresar Evaluaciones</h2>
      <p className="form-description">
        Ingresa tus notas y pesos. Deja vacío para calcular nota faltante.
      </p>

      <div className="evaluaciones-list">
        {evaluaciones.map((ev, index) => (
          <EvaluationRow
            key={index}
            evaluation={ev}
            index={index}
            onUpdate={onUpdate}
            onDelete={onDelete}
            canDelete={evaluaciones.length > 1}
            disabled={loading}
          />
        ))}
      </div>

      <button 
        onClick={onAdd} 
        className="btn-agregar"
        disabled={loading}
      >
        ➕ Agregar Evaluación
      </button>

      <div className="botones-calculo">
        <button 
          onClick={onCalculateAverage} 
          className="btn-primary"
          disabled={loading}
        >
          {loading ? '⏳ Calculando...' : '📊 Calcular Promedio'}
        </button>
        
        <button 
          onClick={onCalculateRequired} 
          className="btn-secondary"
          disabled={loading}
        >
          {loading ? '⏳ Calculando...' : '🎯 Calcular Nota Faltante'}
        </button>
      </div>
    </div>
  );
};