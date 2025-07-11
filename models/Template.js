const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  required: { type: Number, required: true },
  max: { type: Number, required: true },
  icon: { type: String }
}, { _id: false });

const TemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  category: String,
  maxMembers: { type: Number, required: true },
  roles: [RoleSchema],
  icon: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Template', TemplateSchema); 