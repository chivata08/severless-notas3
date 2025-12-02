// utils/validators.js

/**
 * Validar que las evaluaciones tengan el formato correcto
 */
export const validarEvaluaciones = (evaluaciones) => {
  // Verificar que haya al menos una evaluación
  if (!evaluaciones || evaluaciones.length === 0) {
    throw new Error('Debes agregar al menos una evaluación');
  }

  // Verificar que todos los pesos sean válidos
  evaluaciones.forEach((e, index) => {
    if (isNaN(e.peso) || e.peso <= 0 || e.peso > 1) {
      throw new Error(`El peso de la evaluación ${index + 1} debe ser un número entre 0 y 1`);
    }
  });

  // Verificar que las notas válidas estén en rango
  evaluaciones.forEach((e, index) => {
    if (e.nota !== null && !isNaN(e.nota)) {
      if (e.nota < 0 || e.nota > 20) {
        throw new Error(`La nota de la evaluación ${index + 1} debe estar entre 0 y 20`);
      }
    }
  });

  return true;
};

/**
 * Validar que todas las notas estén completas para calcular promedio
 */
export const validarPromedio = (evaluaciones) => {
  // Verificar que todas las notas estén completas
  const notasIncompletas = evaluaciones.filter(e => isNaN(e.nota) || e.nota === null);
  
  if (notasIncompletas.length > 0) {
    throw new Error('Todas las notas deben estar completas para calcular el promedio');
  }

  // Verificar que la suma de pesos sea aproximadamente 1
  const sumaPesos = evaluaciones.reduce((sum, e) => sum + e.peso, 0);
  
  if (Math.abs(sumaPesos - 1) > 0.01) {
    throw new Error(`La suma de los pesos debe ser 1 (actualmente es ${sumaPesos.toFixed(2)})`);
  }

  return true;
};

/**
 * Validar que haya exactamente una nota faltante
 */
export const validarNotaFaltante = (evaluaciones) => {
  // Contar cuántas notas están vacías
  const notasFaltantes = evaluaciones.filter(e => e.nota === null || isNaN(e.nota));
  
  if (notasFaltantes.length === 0) {
    throw new Error('Debes dejar una nota vacía para calcular la nota faltante');
  }
  
  if (notasFaltantes.length > 1) {
    throw new Error('Solo puedes calcular una nota faltante a la vez. Deja solo una nota vacía');
  }

  // Verificar que la suma de pesos sea aproximadamente 1
  const sumaPesos = evaluaciones.reduce((sum, e) => sum + e.peso, 0);
  
  if (Math.abs(sumaPesos - 1) > 0.01) {
    throw new Error(`La suma de los pesos debe ser 1 (actualmente es ${sumaPesos.toFixed(2)})`);
  }

  return true;
};

/**
 * Validar email
 */
export const validarEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email || email.trim() === '') {
    throw new Error('El correo electrónico es requerido');
  }
  
  if (!emailRegex.test(email)) {
    throw new Error('El correo electrónico no es válido');
  }
  
  return true;
};

/**
 * Validar contraseña
 */
export const validarPassword = (password) => {
  if (!password || password.trim() === '') {
    throw new Error('La contraseña es requerida');
  }
  
  if (password.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres');
  }
  
  return true;
};

/**
 * Validar nota individual
 */
export const validarNota = (nota) => {
  if (nota === '' || nota === null) {
    return true; // Permite notas vacías
  }

  const notaNum = parseFloat(nota);
  
  if (isNaN(notaNum)) {
    throw new Error('La nota debe ser un número válido');
  }
  
  if (notaNum < 0 || notaNum > 20) {
    throw new Error('La nota debe estar entre 0 y 20');
  }
  
  return true;
};

/**
 * Validar peso individual
 */
export const validarPeso = (peso) => {
  if (peso === '' || peso === null) {
    throw new Error('El peso es requerido');
  }

  const pesoNum = parseFloat(peso);
  
  if (isNaN(pesoNum)) {
    throw new Error('El peso debe ser un número válido');
  }
  
  if (pesoNum <= 0 || pesoNum > 1) {
    throw new Error('El peso debe estar entre 0 y 1');
  }
  
  return true;
};

/**
 * Calcular suma de pesos
 */
export const calcularSumaPesos = (evaluaciones) => {
  return evaluaciones.reduce((sum, e) => {
    const peso = parseFloat(e.peso);
    return sum + (isNaN(peso) ? 0 : peso);
  }, 0);
};

/**
 * Verificar si la suma de pesos es válida
 */
export const esSumaPesosValida = (evaluaciones, margenError = 0.01) => {
  const suma = calcularSumaPesos(evaluaciones);
  return Math.abs(suma - 1) <= margenError;
};

/**
 * Validar entrada numérica en tiempo real
 */
export const sanitizarNumero = (valor, decimales = 2) => {
  // Permitir vacío
  if (valor === '') return '';
  
  // Remover caracteres no numéricos excepto punto
  let limpio = valor.replace(/[^\d.]/g, '');
  
  // Permitir solo un punto decimal
  const partes = limpio.split('.');
  if (partes.length > 2) {
    limpio = partes[0] + '.' + partes.slice(1).join('');
  }
  
  // Limitar decimales
  if (partes.length === 2 && partes[1].length > decimales) {
    limpio = partes[0] + '.' + partes[1].substring(0, decimales);
  }
  
  return limpio;
};

/**
 * Formatear número para mostrar
 */
export const formatearNumero = (numero, decimales = 2) => {
  if (numero === null || numero === undefined || isNaN(numero)) {
    return '0.00';
  }
  return parseFloat(numero).toFixed(decimales);
};