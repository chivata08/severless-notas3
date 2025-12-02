// services/api.js
const API_URL = import.meta.env.VITE_API_URL || 'https://backend-notas3-oo2j71gtx-kris-projects-ab9428ca.vercel.app';

// Función helper para manejar errores
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error en el servidor' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Función helper para hacer fetch con timeout
const fetchWithTimeout = (url, options = {}, timeout = 10000) => {
  return Promise.race([
    fetch(url, {
      ...options,
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      }
    }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout: La solicitud tardó demasiado')), timeout)
    )
  ]);
};

export const api = {
  // Calcular promedio
  calculateAverage: async (evaluaciones) => {
    try {
      const response = await fetchWithTimeout(`${API_URL}/api/calculateAverage`, {
        method: 'POST',
        body: JSON.stringify({ evaluaciones })
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error al calcular promedio:', error);
      throw new Error(`No se pudo calcular el promedio: ${error.message}`);
    }
  },

  // Calcular nota faltante
  calculateRequiredGrade: async (evaluaciones, notaAprobatoria = 10.5) => {
    try {
      const response = await fetchWithTimeout(`${API_URL}/api/calculateRequiredGrade`, {
        method: 'POST',
        body: JSON.stringify({ evaluaciones, notaAprobatoria })
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error al calcular nota faltante:', error);
      throw new Error(`No se pudo calcular la nota faltante: ${error.message}`);
    }
  },

  // Guardar simulación
  saveSimulation: async (data) => {
    try {
      const response = await fetchWithTimeout(`${API_URL}/api/saveSimulation`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error al guardar simulación:', error);
      throw new Error(`No se pudo guardar la simulación: ${error.message}`);
    }
  },

  // Obtener historial
  getHistory: async (userId) => {
    try {
      const response = await fetchWithTimeout(`${API_URL}/api/getHistory?userId=${userId}`);
      return handleResponse(response);
    } catch (error) {
      console.error('Error al cargar historial:', error);
      throw new Error(`No se pudo cargar el historial: ${error.message}`);
    }
  },

  // Test de conexión
  testConnection: async () => {
    try {
      const response = await fetchWithTimeout(`${API_URL}/api/health`, {}, 5000);
      return handleResponse(response);
    } catch (error) {
      console.error('Error de conexión con el servidor:', error);
      return { success: false, error: error.message };
    }
  }
};