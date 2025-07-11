const mongoose = require('mongoose');
const Activity = require('./Activity');

// Group extiende Activity (sin fecha específica)
const GroupSchema = new mongoose.Schema({
  // Campos específicos de grupos abiertos
  isOpen: { type: Boolean, default: true }, // Siempre abierto para unirse
  autoAccept: { type: Boolean, default: true }, // Aceptación automática
  // Los grupos pueden tener horarios regulares pero no fecha específica
  regularSchedule: {
    days: [String], // ['Lunes', 'Miércoles', 'Viernes']
    time: String, // '20:00'
    timezone: String
  }
});

// Emitir evento por socket cuando un grupo es eliminado (por TTL o manualmente)
GroupSchema.post('findOneAndDelete', async function(doc) {
  if (doc && global.io) {
    try {
      const socketService = require('../services/socketService');
      socketService.emitGroupDeleted(doc._id, 'expired');
    } catch (err) {
      console.error('Error emitiendo evento de grupo eliminado por TTL:', err);
    }
  }
});

// Crear el discriminador para Group
const Group = Activity.discriminator('Group', GroupSchema);

module.exports = Group; 