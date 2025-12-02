// components/EvaluationRow.jsx
export const EvaluationRow = ({ 
  evaluation, 
  index, 
  onUpdate, 
  onDelete, 
  canDelete,
  disabled 
}) => {
  return (
    <div className="evaluacion-row">
      <div className="input-group">
        <label htmlFor={`nota-${index}`}>Nota</label>
        <input
          id={`nota-${index}`}
          type="number"
          step="0.01"
          min="0"
          max="20"
          placeholder="0-20 o vacío"
          value={evaluation.nota}
          onChange={(e) => onUpdate(index, 'nota', e.target.value)}
          disabled={disabled}
        />
      </div>

      <div className="input-group">
        <label htmlFor={`peso-${index}`}>Peso</label>
        <input
          id={`peso-${index}`}
          type="number"
          step="0.01"
          min="0"
          max="1"
          placeholder="0-1"
          value={evaluation.peso}
          onChange={(e) => onUpdate(index, 'peso', e.target.value)}
          disabled={disabled}
        />
      </div>

      {canDelete && (
        <button 
          onClick={() => onDelete(index)}
          className="btn-eliminar"
          disabled={disabled}
          title="Eliminar evaluación"
        >
          ✕
        </button>
      )}
    </div>
  );
};