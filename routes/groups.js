const express = require('express');
const router = express.Router();
const activityService = require('../services/activityService');
const socketService = require('../services/socketService');

// Obtener todos los grupos
router.get('/', async (req, res) => {
  try {
    const groups = await activityService.getAllGroups();
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener todos los grupos con información completa (para Socket.IO)
router.get('/socket', async (req, res) => {
  try {
    const Group = require('../models/Group');
    const groups = await Group.find({});
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para sincronizar estado (útil para refrescar página)
router.get('/sync', async (req, res) => {
  try {
    const Group = require('../models/Group');
    const groups = await Group.find({});
    
    // Emitir el estado actualizado a todos los clientes
    const socketService = require('../services/socketService');
    await socketService.emitAllGroups();
    
    res.json({ 
      message: 'Estado sincronizado',
      groups,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint de debug para probar eventos de socket
router.post('/debug/emit-test', async (req, res) => {
  try {
    const { groupId, eventType } = req.body;
    const socketService = require('../services/socketService');
    
    if (eventType === 'user_joined') {
      await socketService.emitUserJoinedGroup(groupId, { albionNick: 'TestUser' });
    } else if (eventType === 'user_left') {
      await socketService.emitUserLeftGroup(groupId, { albionNick: 'TestUser' });
    } else if (eventType === 'slots_updated') {
      await socketService.emitGroupSlotsUpdated(groupId);
    }
    
    res.json({ 
      message: `Evento ${eventType} emitido para grupo ${groupId}`,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear un grupo
router.post('/', async (req, res) => {
  try {
    const group = await activityService.createActivity(req.body, 'group');
    
    // Emitir evento de nuevo grupo creado a todos los clientes
    await socketService.emitGroupCreated(group._id);
    
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
    
    // Emitir evento de grupo actualizado
    await socketService.emitGroupUpdated(req.params.id);
    
    res.json(group);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Eliminar un grupo
router.delete('/:id', async (req, res) => {
  try {
    await activityService.deleteActivity(req.params.id);
    
    // Emitir evento de grupo eliminado
    socketService.emitGroupDeleted(req.params.id);
    
    res.json({ message: 'Grupo eliminado' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Agregar miembro al grupo
router.post('/:id/members', async (req, res) => {
  try {
    const group = await activityService.addMemberToGroup(req.params.id, req.body);
    if (!group) {
      return res.status(404).json({ error: 'Grupo no encontrado o eliminado' });
    }
    // Emitir eventos a todos los clientes SOLO si el grupo existe
    await socketService.emitUserJoinedGroup(req.params.id, req.body);
    await socketService.emitGroupSlotsUpdated(req.params.id);
    await socketService.emitGroupUpdated(req.params.id);
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
    if (!group) {
      // El grupo fue eliminado (el creador salió)
      return res.json(null);
    }
    // Emitir eventos a todos los clientes SOLO si el grupo existe
    const userData = { albionNick: req.params.userId };
    await socketService.emitUserLeftGroup(req.params.id, userData);
    await socketService.emitGroupSlotsUpdated(req.params.id);
    await socketService.emitGroupUpdated(req.params.id);
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