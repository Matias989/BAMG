require('dotenv').config();

const config = {
  // Configuración del servidor
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Configuración de MongoDB
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/albion-group-manager',
  
  // Configuración JWT
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-key-change-in-production',
  jwtExpiresIn: '7d',
  
  // Configuración CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // Configuración de seguridad
  bcryptRounds: 10,
  
  // Configuración de validación
  minPasswordLength: 6,
  maxNickLength: 20,
  
  // Configuración de límites
  maxFileSize: '10mb',
  maxRequestSize: '10mb'
};

// Validar configuración crítica
if (!config.jwtSecret || config.jwtSecret === 'fallback-secret-key-change-in-production') {
  console.warn('⚠️  ADVERTENCIA: JWT_SECRET no está configurado. Usando clave por defecto.');
  console.warn('   Configura JWT_SECRET en tu archivo .env para producción.');
}

if (config.nodeEnv === 'production' && config.jwtSecret === 'fallback-secret-key-change-in-production') {
  console.error('❌ ERROR: JWT_SECRET debe estar configurado en producción.');
  process.exit(1);
}

module.exports = config; 