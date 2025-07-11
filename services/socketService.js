const Group = require('../models/Group');

class SocketService {
  // Emitir todos los grupos a todos los clientes conectados
  async emitAllGroups() {
    try {
      const groups = await Group.find({});
      global.io.emit('groups_init', { groups });
      console.log('📡 Emitidos todos los grupos a todos los clientes');
    } catch (error) {
      console.error('❌ Error al emitir grupos:', error);
    }
  }

  // Emitir todos los grupos a un cliente específico
  async emitGroupsToClient(socket) {
    try {
      const groups = await Group.find({});
      socket.emit('groups_init', { groups });
      console.log(`📡 Grupos enviados al cliente: ${socket.id}`);
    } catch (error) {
      console.error('❌ Error al emitir grupos al cliente:', error);
    }
  }

  // Emitir actualización de un grupo específico
  async emitGroupUpdated(groupId, excludeSocketId = null) {
    try {
      const group = await Group.findById(groupId);
      if (group) {
        if (excludeSocketId) {
          console.log('[SOCKET] (except) EMITIENDO group_updated:', group._id, group.slots.map(s => s.user && s.user.albionNick));
          global.io.except(excludeSocketId).emit('group_updated', { group });
          console.log(`📡 Grupo actualizado emitido (excepto ${excludeSocketId}): ${group.name}`);
        } else {
          console.log('[SOCKET] EMITIENDO group_updated a todos:', group._id, group.slots.map(s => s.user && s.user.albionNick));
          global.io.emit('group_updated', { group });
          console.log(`📡 Grupo actualizado emitido a todos: ${group.name}`);
        }
      }
    } catch (error) {
      console.error('❌ Error al emitir actualización de grupo:', error);
    }
  }

  // Emitir eliminación de un grupo
  emitGroupDeleted(groupId) {
    global.io.emit('group_deleted', { groupId });
    console.log(`📡 Grupo eliminado emitido: ${groupId}`);
  }

  // Emitir creación de un nuevo grupo
  async emitGroupCreated(groupId) {
    try {
      const group = await Group.findById(groupId);
      if (group) {
        global.io.emit('group_created', { group });
        console.log(`📡 Nuevo grupo emitido a todos: ${group.name}`);
      }
    } catch (error) {
      console.error('❌ Error al emitir nuevo grupo:', error);
    }
  }

  // Emitir cambio de estado de un grupo
  async emitGroupStatusChanged(groupId, newStatus) {
    try {
      const group = await Group.findById(groupId);
      if (group) {
        global.io.emit('group_status_changed', { group, newStatus });
        console.log(`📡 Cambio de estado emitido: ${group.name} -> ${newStatus}`);
      }
    } catch (error) {
      console.error('❌ Error al emitir cambio de estado:', error);
    }
  }

  // Emitir actualización de slots/miembros
  async emitGroupSlotsUpdated(groupId) {
    try {
      const group = await Group.findById(groupId);
      if (group) {
        console.log('[SOCKET] EMITIENDO group_slots_updated a todos:', group._id, group.slots.map(s => s.user && s.user.albionNick));
        global.io.emit('group_slots_updated', { group });
        console.log(`📡 Slots actualizados emitidos: ${group.name}`);
      }
    } catch (error) {
      console.error('❌ Error al emitir actualización de slots:', error);
    }
  }

  // Emitir cuando un usuario se une a un grupo
  async emitUserJoinedGroup(groupId, userData) {
    try {
      const group = await Group.findById(groupId);
      if (group) {
        global.io.emit('user_joined_group', { 
          groupId, 
          group, 
          user: userData,
          timestamp: new Date().toISOString()
        });
        console.log(`📡 Usuario se unió al grupo: ${userData.albionNick} -> ${group.name}`);
      }
    } catch (error) {
      console.error('❌ Error al emitir unión de usuario:', error);
    }
  }

  // Emitir cuando un usuario sale de un grupo
  async emitUserLeftGroup(groupId, userData) {
    try {
      const group = await Group.findById(groupId);
      if (group) {
        global.io.emit('user_left_group', { 
          groupId, 
          group, 
          user: userData,
          timestamp: new Date().toISOString()
        });
        console.log(`📡 Usuario salió del grupo: ${userData.albionNick} -> ${group.name}`);
      }
    } catch (error) {
      console.error('❌ Error al emitir salida de usuario:', error);
    }
  }
}

module.exports = new SocketService(); 