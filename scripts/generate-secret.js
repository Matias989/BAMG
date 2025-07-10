const crypto = require('crypto');

// Generar un JWT_SECRET seguro
const generateSecret = () => {
  return crypto.randomBytes(64).toString('hex');
};

console.log('🔐 Generando JWT_SECRET seguro...');
console.log('');
console.log('📋 Copia esta línea en tu archivo .env:');
console.log('');
console.log(`JWT_SECRET=${generateSecret()}`);
console.log('');
console.log('⚠️  IMPORTANTE:');
console.log('   - Guarda este secreto en un lugar seguro');
console.log('   - No lo compartas ni lo subas a Git');
console.log('   - Usa un secreto diferente para cada entorno');
console.log(''); 