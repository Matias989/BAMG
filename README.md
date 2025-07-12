# Albion Manager Group - Backend

API REST para el manejo de grupos y eventos de Albion Online.

## 🚀 Despliegue en Render.com

### Pasos para desplegar:

1. **Crear cuenta en Render.com**
   - Ve a [render.com](https://render.com)
   - Regístrate con tu cuenta de GitHub

2. **Crear nuevo Web Service**
   - Haz clic en "New +" → "Web Service"
   - Conecta tu repositorio de GitHub
   - Selecciona este repositorio

3. **Configurar el servicio**
   - **Name**: `albion-manager-backend` (o el nombre que prefieras)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. **Configurar variables de entorno**
   En la sección "Environment Variables", agrega:
   ```
   NODE_ENV=production
   JWT_SECRET=tu-clave-secreta-super-segura-aqui
   MONGODB_URI=tu-uri-de-mongodb-atlas
   CORS_ORIGIN=https://tu-frontend-url.com
   ```

5. **Configurar MongoDB Atlas**
   - Crea una cuenta en [MongoDB Atlas](https://mongodb.com/atlas)
   - Crea un cluster gratuito
   - Obtén la URI de conexión
   - Configura la variable `MONGODB_URI` con tu URI de Atlas

### Variables de entorno requeridas:

- `NODE_ENV`: Entorno (production/development)
- `JWT_SECRET`: Clave secreta para JWT (¡cambia en producción!)
- `MONGODB_URI`: URI de conexión a MongoDB
- `CORS_ORIGIN`: URL del frontend (para CORS)
- `VITE_API_URL`: URL de la API (usada por el admin interface)
- `VITE_SOCKET_URL`: URL para WebSocket (usada por el frontend)

### Configuración del archivo .env

Copia el archivo `env.example` a `.env` y configura las variables:

```bash
cp env.example .env
```

Edita el archivo `.env` con tus valores:
- Para desarrollo: `VITE_API_URL=http://localhost:4000`
- Para producción: `VITE_API_URL=https://tu-dominio.com`

### Endpoints disponibles:

- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Login de usuarios
- `GET /api/groups` - Obtener grupos
- `POST /api/groups` - Crear grupo
- `GET /api/events` - Obtener eventos
- `POST /api/events` - Crear evento
- `GET /api/config` - Obtener configuración del frontend
- `GET /admin` - Panel de administración

## 🛠️ Desarrollo local

```bash
npm install
npm start
```

El servidor se ejecutará en `http://localhost:4000` 