# 🔧 Configuración del Backend

## 📋 Requisitos Previos

- Node.js (v14 o superior)
- MongoDB (local o Atlas)
- npm o yarn

## 🚀 Instalación

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Instalar dependencias adicionales:**
   ```bash
   npm install bcryptjs jsonwebtoken dotenv
   ```

## ⚙️ Configuración

### 1. Crear archivo .env

Crea un archivo `.env` en la carpeta `backend/` con el siguiente contenido:

```env
# Configuración del servidor
PORT=4000

# Configuración de MongoDB
MONGODB_URI=mongodb://localhost:27017/albion-group-manager

# Configuración JWT (GENERA UNO SEGURO)
JWT_SECRET=tu-super-secreto-jwt-muy-seguro-y-unico-para-albion-group-manager-2024

# Configuración de entorno
NODE_ENV=development

# Configuración de CORS (opcional)
CORS_ORIGIN=http://localhost:3000
```

### 2. Generar JWT_SECRET seguro

Ejecuta el script para generar un JWT_SECRET seguro:

```bash
node scripts/generate-secret.js
```

Copia la línea generada y reemplaza `JWT_SECRET` en tu archivo `.env`.

### 3. Configurar MongoDB

**Opción A - MongoDB Local:**
1. Instala MongoDB en tu sistema
2. Inicia el servicio de MongoDB
3. La URI por defecto debería funcionar

**Opción B - MongoDB Atlas:**
1. Crea una cuenta en MongoDB Atlas
2. Crea un cluster
3. Obtén la URI de conexión
4. Reemplaza `MONGODB_URI` en el `.env`

## 🏃‍♂️ Ejecutar el Servidor

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 🔍 Verificar Configuración

El servidor mostrará información de configuración al iniciar:

```
✅ Conectado a MongoDB
📊 Base de datos: mongodb://localhost:27017/albion-group-manager
🚀 Servidor escuchando en puerto 4000
🌍 Entorno: development
🔗 URL: http://localhost:4000
```

## 🛡️ Seguridad

### Variables de Entorno Críticas

- **JWT_SECRET**: Debe ser único y seguro
- **MONGODB_URI**: URI de conexión a la base de datos
- **NODE_ENV**: Entorno de ejecución

### Para Producción

1. Cambia `NODE_ENV=production`
2. Usa un JWT_SECRET diferente y más seguro
3. Configura CORS_ORIGIN con tu dominio
4. Usa MongoDB Atlas o un servidor dedicado

## 🔧 Troubleshooting

### Error: "JWT_SECRET no está configurado"
- Verifica que el archivo `.env` existe
- Asegúrate de que JWT_SECRET esté definido

### Error: "Error al conectar a MongoDB"
- Verifica que MongoDB esté ejecutándose
- Revisa la URI de conexión
- Asegúrate de que la base de datos sea accesible

### Error: "Token inválido"
- Verifica que JWT_SECRET sea el mismo en todas las instancias
- Revisa que el token no haya expirado

## 📁 Estructura de Archivos

```
backend/
├── .env                    # Variables de entorno
├── config/
│   └── config.js          # Configuración centralizada
├── models/
│   ├── User.js            # Modelo de usuario
│   ├── Activity.js        # Modelo base de actividades
│   ├── Group.js           # Modelo de grupos
│   └── Event.js           # Modelo de eventos
├── routes/
│   ├── auth.js            # Rutas de autenticación
│   ├── groups.js          # Rutas de grupos
│   └── events.js          # Rutas de eventos
├── services/
│   ├── authService.js     # Servicio de autenticación
│   └── activityService.js # Servicio de actividades
├── scripts/
│   └── generate-secret.js # Script para generar JWT_SECRET
└── app.js                 # Archivo principal
``` 