const express = require('express');
const router = express.Router();
const activityService = require('../services/activityService');

// Obtener todos los eventos
router.get('/', async (req, res) => {
  try {
    const events = await activityService.getAllEvents();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener eventos próximos
router.get('/upcoming', async (req, res) => {
  try {
    const upcomingEvents = await activityService.getUpcomingEvents();
    res.json(upcomingEvents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear un evento
router.post('/', async (req, res) => {
  try {
    const event = await activityService.createActivity(req.body, 'event');
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Actualizar un evento
router.put('/:id', async (req, res) => {
  try {
    const event = await activityService.updateActivity(req.params.id, req.body);
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Eliminar un evento
router.delete('/:id', async (req, res) => {
  try {
    await activityService.deleteActivity(req.params.id);
    res.json({ message: 'Evento eliminado' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Confirmar asistencia a un evento
router.post('/:id/confirm', async (req, res) => {
  try {
    const event = await activityService.confirmAttendance(req.params.id, req.body);
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Cancelar asistencia a un evento
router.post('/:id/cancel', async (req, res) => {
  try {
    const event = await activityService.cancelAttendance(req.params.id, req.body.userId);
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; 