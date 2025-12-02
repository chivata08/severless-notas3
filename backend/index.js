const express = require('express');
const admin = require('firebase-admin');

const app = express();
app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}

const db = admin.firestore();

// CALCULAR PROMEDIO
app.post('/api/calculateAverage', (req, res) => {
  try {
    const { evaluaciones } = req.body;
    
    if (!evaluaciones || evaluaciones.length === 0) {
      return res.status(400).json({ error: 'No hay evaluaciones' });
    }

    const suma = evaluaciones.reduce((acc, ev) => acc + ev.nota * ev.peso, 0);
    const total = evaluaciones.reduce((acc, ev) => acc + ev.peso, 0);

    res.json({ promedio: parseFloat((suma / total).toFixed(2)) });
  } catch (error) {
    res.status(500).json({ error: 'Error al calcular promedio' });
  }
});

// CALCULAR NOTA FALTANTE
app.post('/api/calculateRequiredGrade', (req, res) => {
  try {
    const { evaluaciones, notaAprobatoria = 10.5 } = req.body;

    const sumaActual = evaluaciones
      .filter(ev => ev.nota !== null)
      .reduce((acc, ev) => acc + ev.nota * ev.peso, 0);

    const pesoTotal = evaluaciones.reduce((acc, ev) => acc + ev.peso, 0);
    const pesoFaltante = evaluaciones
      .filter(ev => ev.nota === null)
      .reduce((acc, ev) => acc + ev.peso, 0);

    const notaFaltante = (notaAprobatoria * pesoTotal - sumaActual) / pesoFaltante;

    res.json({ 
      notaFaltante: parseFloat(notaFaltante.toFixed(2)),
      esAlcanzable: notaFaltante <= 20 && notaFaltante >= 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al calcular nota faltante' });
  }
});

// GUARDAR SIMULACIÓN
app.post('/api/saveSimulation', async (req, res) => {
  try {
    const { evaluaciones, promedio, notaFaltante, userId } = req.body;
    
    if (!evaluaciones) {
      return res.status(400).json({ error: 'Faltan datos' });
    }

    const simulacion = {
      evaluaciones,
      promedio: promedio || null,
      notaFaltante: notaFaltante || null,
      userId: userId || 'anonimo',
      fecha: admin.firestore.FieldValue.serverTimestamp(),
      timestamp: Date.now()
    };

    const docRef = await db.collection('simulaciones').add(simulacion);

    res.json({ 
      ok: true, 
      mensaje: 'Simulación guardada',
      id: docRef.id
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Error al guardar',
      detalle: error.message 
    });
  }
});

// OBTENER HISTORIAL
app.get('/api/getHistory', async (req, res) => {
  try {
    const userId = req.query.userId || 'anonimo';
    
    const snapshot = await db.collection('simulaciones')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(20)
      .get();

    const historial = [];
    snapshot.forEach(doc => {
      historial.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json(historial);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Error al obtener historial'
    });
  }
});

// ELIMINAR SIMULACIÓN
app.delete('/api/deleteSimulation/:id', async (req, res) => {
  try {
    await db.collection('simulaciones').doc(req.params.id).delete();
    res.json({ ok: true, mensaje: 'Eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar' });
  }
});

// RAÍZ
app.get('/', (req, res) => {
  res.json({ 
    proyecto: 'Sistema Serverless - Cálculo de Notas',
    version: '2.0.0',
    auth: 'Firebase',
    database: 'Firestore',
    estado: 'Funcional',
    endpoints: [
      'POST /api/calculateAverage',
      'POST /api/calculateRequiredGrade',
      'POST /api/saveSimulation',
      'GET /api/getHistory?userId=xxx',
      'DELETE /api/deleteSimulation/:id'
    ]
  });
});

module.exports = app;
