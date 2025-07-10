const Activity = require('../models/Activity');
const Group = require('../models/Group');
const Event = require('../models/Event');

class ActivityService {
  // Métodos comunes para todas las actividades
  async getAllActivities() {
    try {
      return await Activity.find().sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  async getActivityById(id) {
    try {
      return await Activity.findById(id);
    } catch (error) {
      throw error;
    }
  }

  async createActivity(activityData, type) {
    try {
      if (type === 'group') {
        // Validar que el creador no pertenezca ya a otro grupo activo
        const creatorNick = activityData.creatorNick;
        const existingGroup = await Group.findOne({
          status: 'Activo',
          'slots.user.albionNick': creatorNick
        });
        if (existingGroup) {
          const err = new Error('Ya perteneces a otro grupo activo');
          err.code = 'ALREADY_IN_GROUP';
          err.existingGroup = existingGroup;
          throw err;
        }
        // Inicializar slots desde plantilla si no existen
        if (!activityData.slots && activityData.template && Array.isArray(activityData.template.roles)) {
          activityData.slots = activityData.template.roles.map(role => ({ role, user: null }));
        }
        return await Group.create(activityData);
      } else if (type === 'event') {
        return await Event.create(activityData);
      }
      throw new Error('Tipo de actividad no válido');
    } catch (error) {
      throw error;
    }
  }

  async updateActivity(id, activityData) {
    try {
      // Validación: ningún usuario puede estar en más de un grupo activo
      if (activityData.type === 'group' && Array.isArray(activityData.slots)) {
        // Obtener todos los nicks de los slots
        const nicks = activityData.slots
          .filter(slot => slot.user && slot.user.albionNick)
          .map(slot => slot.user.albionNick);
        // Buscar si alguno de estos nicks ya está en otro grupo activo
        for (const nick of nicks) {
          const otherGroup = await Group.findOne({
            _id: { $ne: id },
            status: 'Activo',
            'slots.user.albionNick': nick
          });
          if (otherGroup) {
            const err = new Error(`El usuario ${nick} ya pertenece a otro grupo activo`);
            err.code = 'ALREADY_IN_GROUP';
            err.existingGroup = otherGroup;
            throw err;
          }
        }
      }
      return await Activity.findByIdAndUpdate(id, activityData, { new: true });
    } catch (error) {
      throw error;
    }
  }

  async deleteActivity(id) {
    try {
      return await Activity.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  }

  // Métodos específicos para grupos
  async getAllGroups() {
    try {
      return await Group.find().sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  async addMemberToGroup(groupId, memberData) {
    try {
      const group = await Group.findById(groupId);
      if (!group) throw new Error('Grupo no encontrado');
      // Buscar primer slot vacío
      const slotIdx = group.slots.findIndex(s => !s.user);
      if (slotIdx === -1) throw new Error('El grupo ya está lleno');
      // Verificar si el usuario ya está en otro grupo activo
      const otherGroup = await Group.findOne({
        _id: { $ne: groupId },
        status: 'Activo',
        'slots.user.albionNick': memberData.albionNick
      });
      // Permitir cambio de slot dentro del mismo grupo
      if (otherGroup && String(otherGroup._id) !== String(groupId)) {
        const err = new Error('Ya perteneces a otro grupo activo');
        err.code = 'ALREADY_IN_GROUP';
        err.existingGroup = otherGroup;
        throw err;
      }
      // Asignar usuario al slot
      group.slots[slotIdx].user = memberData;
      // Si el usuario ya estaba en otro slot de este grupo, liberarlo
      group.slots = group.slots.map((slot, idx) => {
        if (idx !== slotIdx && slot.user && slot.user.albionNick === memberData.albionNick) {
          return { ...slot, user: null };
        }
        return slot;
      });
      return await group.save();
    } catch (error) {
      throw error;
    }
  }

  async removeMemberFromGroup(groupId, userNick) {
    try {
      const group = await Group.findById(groupId);
      if (!group) throw new Error('Grupo no encontrado');
      // Si el usuario es el creador, elimina el grupo
      if (group.creatorNick === userNick) {
        await Group.findByIdAndDelete(groupId);
        return null;
      }
      group.slots = group.slots.map(slot => {
        if (slot.user && slot.user.albionNick === userNick) {
          return { ...slot, user: null };
        }
        return slot;
      });
      return await group.save();
    } catch (error) {
      throw error;
    }
  }

  // Métodos específicos para eventos
  async getAllEvents() {
    try {
      return await Event.find().sort({ date: 1 });
    } catch (error) {
      throw error;
    }
  }

  async getUpcomingEvents() {
    try {
      return await Event.find({
        date: { $gte: new Date() },
        eventStatus: { $in: ['Programado', 'En Preparación'] }
      }).sort({ date: 1 });
    } catch (error) {
      throw error;
    }
  }

  async confirmAttendance(eventId, userData) {
    try {
      const event = await Event.findById(eventId);
      if (!event) throw new Error('Evento no encontrado');

      // Verificar si ya está confirmado
      const alreadyConfirmed = event.confirmedMembers.find(m => m.userId === userData.userId);
      if (alreadyConfirmed) {
        throw new Error('Ya estás confirmado para este evento');
      }

      // Agregar a miembros y confirmados
      event.members.push(userData);
      event.confirmedMembers.push({
        userId: userData.userId,
        confirmedAt: new Date()
      });

      return await event.save();
    } catch (error) {
      throw error;
    }
  }

  async cancelAttendance(eventId, userId) {
    try {
      const event = await Event.findById(eventId);
      if (!event) throw new Error('Evento no encontrado');

      // Remover de miembros y confirmados
      event.members = event.members.filter(m => m.userId !== userId);
      event.confirmedMembers = event.confirmedMembers.filter(m => m.userId !== userId);

      return await event.save();
    } catch (error) {
      throw error;
    }
  }

  // Métodos para plantillas
  async applyTemplate(activityId, template) {
    try {
      const activity = await Activity.findById(activityId);
      if (!activity) throw new Error('Actividad no encontrada');

      activity.template = template;
      return await activity.save();
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ActivityService(); 