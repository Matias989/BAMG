const express = require('express');
const router = express.Router();
const activityService = require('../services/activityService');

// Obtener todos los grupos
router.get('/', async (req, res) => {
  try {
    const groups = await activityService.getAllGroups();
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear un grupo
router.post('/', async (req, res) => {
  try {
    const group = await activityService.createActivity(req.body, 'group');
    res.status(201).json(group);
  } catch (err) {
    // Si el error tiene un grupo existente, inclúyelo en la respuesta
    if (err.code === 'ALREADY_IN_GROUP' && err.existingGroup) {
      res.status(400).json({ error: err.message, existingGroup: err.existingGroup });
    } else {
      res.status(400).json({ error: err.message });
    }
  }
});

// Actualizar un grupo
router.put('/:id', async (req, res) => {
  try {
    const group = await activityService.updateActivity(req.params.id, req.body);
    res.json(group);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Eliminar un grupo
router.delete('/:id', async (req, res) => {
  try {
    await activityService.deleteActivity(req.params.id);
    res.json({ message: 'Grupo eliminado' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Agregar miembro al grupo
router.post('/:id/members', async (req, res) => {
  try {
    const group = await activityService.addMemberToGroup(req.params.id, req.body);
    res.json(group);
  } catch (err) {
    if (err.code === 'ALREADY_IN_GROUP' && err.existingGroup) {
      res.status(400).json({ error: err.message, existingGroup: err.existingGroup });
    } else {
      res.status(400).json({ error: err.message });
    }
  }
});

// Remover miembro del grupo
router.delete('/:id/members/:userId', async (req, res) => {
  try {
    const group = await activityService.removeMemberFromGroup(req.params.id, req.params.userId);
    res.json(group);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Obtener el grupo activo de un usuario
router.get('/active/:userId', async (req, res) => {
  try {
    const group = await require('../models/Group').findOne({
      status: 'Activo',
      'members.userId': req.params.userId
    });
    if (!group) return res.status(404).json({ error: 'No pertenece a ningún grupo activo' });
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 