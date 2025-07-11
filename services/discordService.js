const axios = require('axios');

class DiscordService {
  constructor() {
    this.webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!this.webhookUrl) {
      console.warn('No se ha configurado DISCORD_WEBHOOK_URL. Las notificaciones de Discord estarán deshabilitadas.');
    }
  }

  async sendGroupCreatedNotification(group) {
    if (!this.webhookUrl) return;
    try {
      // Construir mensaje
      const integrantes = group.slots
        .filter(slot => slot.user)
        .map(slot => `🧑‍🤝‍🧑 **${slot.user.albionNick}** (${slot.role})`)
        .join('\n') || 'Ninguno';
      const rolesFaltantes = group.slots
        .filter(slot => !slot.user)
        .map(slot => `🔸 ${slot.role}`)
        .join('\n') || 'Ninguno';
      // URL para unirse al grupo
      const baseUrl = process.env.SITE_URL || 'https://bamg.onrender.com';
      const joinUrl = `${baseUrl}/grupos/${group._id}`;
      // Embed de Discord con más estilos
      const embed = {
        title: `✨ Nuevo grupo creado: ${group.name}`,
        color: 0xFFD700, // dorado
        author: {
          name: 'Albion Group Manager',
          icon_url: 'https://albiononline.com/favicon.ico'
        },
        description: '¡Un nuevo grupo ha sido creado en el sistema!\n\nÚnete y participa en la aventura.',
        thumbnail: {
          url: 'https://albiononline.com/assets/images/og-image.jpg'
        },
        fields: [
          {
            name: '👥 Integrantes',
            value: integrantes,
            inline: false
          },
          {
            name: '🛡️ Roles faltantes',
            value: rolesFaltantes,
            inline: false
          }
        ],
        url: joinUrl,
        timestamp: new Date().toISOString(),
        footer: {
          text: 'Haz clic en el botón para unirte al grupo',
          icon_url: 'https://albiononline.com/favicon.ico'
        }
      };
      // Botón (solo visible en Discord moderno)
      const components = [
        {
          type: 1, // Action Row
          components: [
            {
              type: 2, // Button
              style: 5, // Link
              label: '👉 Unirse al grupo',
              url: joinUrl
            }
          ]
        }
      ];
      await axios.post(this.webhookUrl, {
        embeds: [embed],
        components
      });
    } catch (error) {
      console.error('Error enviando notificación a Discord:', error.message);
    }
  }
}

module.exports = new DiscordService(); 