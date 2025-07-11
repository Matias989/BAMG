const express = require('express');
const router = express.Router();
const Template = require('../models/Template');

// Obtener todos los templates
router.get('/', async (req, res) => {
  try {
    const templates = await Template.find();
    res.json(templates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear un nuevo template
router.post('/', async (req, res) => {
  try {
    const template = await Template.create(req.body);
    res.status(201).json(template);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Actualizar un template
router.put('/:id', async (req, res) => {
  try {
    const template = await Template.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!template) return res.status(404).json({ error: 'Template no encontrado' });
    res.json(template);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Eliminar un template
router.delete('/:id', async (req, res) => {
  try {
    const template = await Template.findByIdAndDelete(req.params.id);
    if (!template) return res.status(404).json({ error: 'Template no encontrado' });
    res.json({ message: 'Template eliminado' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; 