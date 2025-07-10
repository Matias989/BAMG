const mongoose = require('mongoose');
const Activity = require('./Activity');

// Event extiende Activity (con fecha específica)
const EventSchema = new mongoose.Schema({
  // Campos específicos de eventos programados
  date: { type: Date, required: true }, // Fecha y hora específica
  registrationDeadline: Date, // Fecha límite para registrarse
  isRecurring: { type: Boolean, default: false }, // Evento recurrente
  recurrencePattern: String, // "weekly", "monthly", etc.
  // Confirmación de asistencia para eventos
  confirmedMembers: [{
    userId: String,
    confirmedAt: { type: Date, default: Date.now }
  }],
  // Estado específico de eventos
  eventStatus: { 
    type: String, 
    enum: ['Programado', 'En Preparación', 'Activo', 'Completado', 'Cancelado'],
    default: 'Programado' 
  }
});

// Crear el discriminador para Event
const Event = Activity.discriminator('Event', EventSchema);

module.exports = Event; 