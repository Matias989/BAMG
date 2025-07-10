const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // Información básica
  albionNick: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  password: { 
    type: String, 
    required: true 
  },
  
  // Perfil de Albion - valores por defecto
  avatar: { 
    type: String, 
    default: '⚔️' 
  },
  level: { 
    type: Number, 
    default: 1 
  },
  experience: { 
    type: String, 
    enum: ['Principiante', 'Intermedio', 'Avanzado', 'Experto'],
    default: 'Principiante'
  },
  
  // Roles simplificados
  roles: [{
    type: { 
      type: String, 
      required: true,
      enum: ['DPS Ranged', 'DPS Melee', 'Tank', 'Support', 'Curador']
    },
    isPrimary: { 
      type: Boolean, 
      default: false 
    }
  }],
  
  // Recursos de recolección
  gathering: {
    mineral: { 
      type: String, 
      enum: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8'],
      default: 'T1'
    },
    madera: { 
      type: String, 
      enum: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8'],
      default: 'T1'
    },
    fibra: { 
      type: String, 
      enum: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8'],
      default: 'T1'
    },
    piedra: { 
      type: String, 
      enum: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8'],
      default: 'T1'
    },
    piel: { 
      type: String, 
      enum: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8'],
      default: 'T1'
    },
    pescado: { 
      type: String, 
      enum: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8'],
      default: 'T1'
    }
  },
  
  // Información adicional
  guild: String,
  alliance: String,
  city: String,
  
  // Estadísticas
  stats: {
    activitiesJoined: { type: Number, default: 0 },
    eventsConfirmed: { type: Number, default: 0 },
    totalLootShared: { type: Number, default: 0 },
    reputation: { type: Number, default: 0 }
  },
  
  // Configuración
  settings: {
    notifications: { type: Boolean, default: true },
    soundEnabled: { type: Boolean, default: true },
    language: { type: String, default: 'es' }
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now },
  profileCompleted: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false }
});

// Método para obtener el rol principal
UserSchema.methods.getPrimaryRole = function() {
  const primaryRole = this.roles.find(role => role.isPrimary);
  return primaryRole || this.roles[0] || { type: 'Sin rol' };
};

// Método para obtener el nivel más alto de recolección
UserSchema.methods.getHighestGatheringTier = function() {
  const tiers = Object.values(this.gathering);
  const tierNumbers = tiers.map(tier => parseInt(tier.replace('T', '')));
  return Math.max(...tierNumbers);
};

// Método para verificar si el perfil está completo
UserSchema.methods.isProfileComplete = function() {
  return this.roles.length > 0 && this.profileCompleted;
};

module.exports = mongoose.model('User', UserSchema); 