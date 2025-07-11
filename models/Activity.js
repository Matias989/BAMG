const mongoose = require('mongoose');

const SlotSchema = new mongoose.Schema({
  role: { type: String, required: true },
  user: { type: Object, default: null }
}, { _id: false });

const ActivitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  description: String,
  maxMembers: { type: Number, required: false },
  slots: [SlotSchema],
  // members eliminado o dejado como opcional
  template: Object,
  creatorId: { type: String, required: false },
  creatorNick: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['Activo', 'Completado', 'Cancelado'],
    default: 'Activo' 
  },
  location: String,
  duration: String,
  requirements: [String],
  rewards: String
}, {
  discriminatorKey: 'activityType'
});

ActivitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });

module.exports = mongoose.model('Activity', ActivitySchema); 