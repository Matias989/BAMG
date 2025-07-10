require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config/config');

const groupRoutes = require('./routes/groups');
const eventRoutes = require('./routes/events');
const authRoutes = require('./routes/auth');

const app = express();

// Configuración CORS
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));

app.use(express.json({ limit: config.maxRequestSize }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/events', eventRoutes);

// Middleware de manejo de errores
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: config.nodeEnv === 'development' ? error.message : undefined
  });
});

// Conexión a MongoDB
mongoose.connect(config.mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ Conectado a MongoDB');
  console.log(`📊 Base de datos: ${config.mongoUri}`);
  
  // Iniciar servidor
  app.listen(config.port, () => {
    console.log(`🚀 Servidor escuchando en puerto ${config.port}`);
    console.log(`🌍 Entorno: ${config.nodeEnv}`);
    console.log(`🔗 URL: http://localhost:${config.port}`);
  });
})
.catch(err => {
  console.error('❌ Error al conectar a MongoDB:', err);
  process.exit(1);
}); 