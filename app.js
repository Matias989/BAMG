require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const config = require('./config/config');

const groupRoutes = require('./routes/groups');
const eventRoutes = require('./routes/events');
const authRoutes = require('./routes/auth');

const app = express();
const server = createServer(app);

// Configuración Socket.IO
const io = new Server(server, {
  cors: {
    origin: config.corsOrigin,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Hacer io disponible globalmente
global.io = io;

// Manejo de conexiones Socket.IO
io.on('connection', async (socket) => {
  console.log('🔌 Cliente conectado:', socket.id);
  
  // Enviar todos los grupos solo al cliente que se conectó
  const socketService = require('./services/socketService');
  await socketService.emitGroupsToClient(socket);
  
  socket.on('disconnect', () => {
    console.log('🔌 Cliente desconectado:', socket.id);
  });
});

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

// Ruta para el panel de administración
app.get('/admin', (req, res) => {
  res.sendFile(__dirname + '/admin-interface.html');
});

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
  server.listen(config.port, () => {
    console.log(`🚀 Servidor escuchando en puerto ${config.port}`);
    console.log(`🌍 Entorno: ${config.nodeEnv}`);
    console.log(`🔗 URL: http://localhost:${config.port}`);
    console.log(`👑 Panel Admin: http://localhost:${config.port}/admin`);
    console.log(`🔑 Credenciales Admin Hardcodeadas: admin / admin989`);
    console.log(`🔌 Socket.IO habilitado`);
  });
})
.catch(err => {
  console.error('❌ Error al conectar a MongoDB:', err);
  process.exit(1);
}); 