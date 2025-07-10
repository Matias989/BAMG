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

// Crear el discriminador para Group
const Group = Activity.discriminator('Group', GroupSchema);

module.exports = Group; 