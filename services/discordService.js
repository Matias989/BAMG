const axios = require('axios');

class DiscordService {
  constructor() {
    this.webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    this.requestQueue = [];
    this.isProcessing = false;
    this.lastRequestTime = 0;
    this.minDelayBetweenRequests = parseInt(process.env.DISCORD_RATE_LIMIT_DELAY) || 2000; // 2 segundos mínimo entre requests
    this.maxRetries = parseInt(process.env.DISCORD_MAX_RETRIES) || 3;
    
    if (!this.webhookUrl) {
      console.warn('⚠️ No se ha configurado DISCORD_WEBHOOK_URL. Las notificaciones de Discord estarán deshabilitadas.');
    } else {
      console.log('✅ Discord Service inicializado con rate limiting');
      console.log(`⏱️ Delay entre requests: ${this.minDelayBetweenRequests}ms`);
      console.log(`🔄 Máximo de reintentos: ${this.maxRetries}`);
    }
  }

  // Método para procesar la cola de requests
  async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) return;
    
    this.isProcessing = true;
    
    while (this.requestQueue.length > 0) {
      const { payload, resolve, reject } = this.requestQueue.shift();
      
      try {
        // Esperar el tiempo mínimo entre requests
        const timeSinceLastRequest = Date.now() - this.lastRequestTime;
        if (timeSinceLastRequest < this.minDelayBetweenRequests) {
          await new Promise(resolve => setTimeout(resolve, this.minDelayBetweenRequests - timeSinceLastRequest));
        }
        
        await this.sendRequest(payload);
        this.lastRequestTime = Date.now();
        resolve();
      } catch (error) {
        console.error('Error en cola de Discord:', error.message);
        reject(error);
      }
    }
    
    this.isProcessing = false;
  }

  // Método para enviar request con manejo de rate limiting
  async sendRequest(payload) {
    let retries = 0;
    while (retries < this.maxRetries) {
      try {
        await axios.post(this.webhookUrl, payload);
        return; // Exit the loop on successful send
      } catch (error) {
        if (error.response && error.response.status === 429) {
          // Rate limit alcanzado, esperar y reintentar
          const retryAfter = error.response.headers['retry-after'] || 5;
          console.log(`🔄 Rate limit alcanzado. Esperando ${retryAfter} segundos...`);
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          retries++;
          console.log(`🔄 Reintento ${retries}/${this.maxRetries}...`);
        } else {
          console.error('❌ Error de Discord:', error.response?.status, error.response?.statusText);
          throw error; // Re-throw for other errors
        }
      }
    }
    throw new Error(`No se pudo enviar la notificación después de ${this.maxRetries} intentos.`);
  }

  // Método genérico para enviar notificaciones
  async sendNotification(embed, components = null) {
    if (!this.webhookUrl) return;
    
    try {
      const payload = {
        embeds: [embed]
      };
      
      if (components) {
        payload.components = components;
      }
      
      await this.queueRequest(payload);
      console.log('✅ Notificación de Discord enviada exitosamente');
    } catch (error) {
      console.error('❌ Error enviando notificación a Discord:', error.message);
    }
  }

  // Método para agregar request a la cola
  async queueRequest(payload) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ payload, resolve, reject });
      this.processQueue();
    });
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
      
      await this.sendNotification(embed, components);
      
    } catch (error) {
      console.error('Error enviando notificación a Discord:', error.message);
    }
  }
}

module.exports = new DiscordService(); 