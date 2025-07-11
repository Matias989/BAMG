# Panel de Administración - Albion Manager

## 🎯 Acceso al Panel

El panel de administración está disponible en:
```
http://localhost:4000/admin
```

## 🔑 Credenciales Hardcodeadas

**Usuario:** `admin`  
**Contraseña:** `admin989`

> ⚠️ **Importante:** Estas credenciales están hardcodeadas en el código y NO se almacenan en la base de datos.

## 🚀 Configuración Automática

### Al iniciar el servidor
Las credenciales admin están disponibles inmediatamente al iniciar el servidor:

```bash
npm start
```

> **Nota:** No se requiere configuración adicional. Las credenciales están hardcodeadas en el código.

## 🔧 Funcionalidades del Panel

### 1. **Gestión de Usuarios**
- Ver todos los usuarios registrados
- Información detallada de cada usuario
- Estado de administrador marcado con badge

### 2. **Restablecimiento de Contraseñas**
- Cambiar contraseñas de usuarios
- Validación de contraseñas
- Confirmación de cambios

### 3. **Interfaz Moderna**
- Diseño responsivo
- Notificaciones en tiempo real
- Modal para restablecimiento de contraseñas

## 🛡️ Seguridad

### Middleware de Autenticación
- Verificación de token JWT
- Validación de permisos de administrador
- Protección de rutas sensibles

### Validaciones
- Solo usuarios con `isAdmin: true` pueden acceder
- Verificación de credenciales en cada operación
- Logs de todas las acciones administrativas

## 📋 Estructura del Usuario Admin Hardcodeado

```javascript
{
  albionNick: 'admin',
  password: 'admin989', // Hardcodeada en el código
  isAdmin: true,
  avatar: '👑',
  guild: 'Administración',
  alliance: 'Sistema',
  city: 'Admin City'
}
```

> **Nota:** Este usuario NO existe en la base de datos, solo en memoria durante la sesión.

## 🔄 Persistencia

Las credenciales admin están hardcodeadas en el código:
- No se almacenan en la base de datos
- Siempre disponibles al iniciar el servidor
- No requieren configuración o mantenimiento

## 🐛 Solución de Problemas

### Si no puedes acceder al panel:
1. Verifica que el servidor esté corriendo en puerto 4000
2. Verifica que MongoDB esté conectado
3. Revisa los logs del servidor para errores
4. Confirma que las credenciales sean exactamente: `admin` / `admin989`

### Si las credenciales no funcionan:
1. Las credenciales están hardcodeadas y no pueden cambiar
2. Verifica que no haya espacios extra en el usuario o contraseña
3. Reinicia el servidor si es necesario

## 📝 Logs del Sistema

El servidor muestra logs informativos:
```
🔐 Credenciales Admin Hardcodeadas: admin / admin989
👑 Panel Admin: http://localhost:4000/admin
🔑 Credenciales Admin Hardcodeadas: admin / admin989
```

## 🔗 URLs Importantes

- **Panel Admin:** http://localhost:4000/admin
- **API Auth:** http://localhost:4000/api/auth
- **API Groups:** http://localhost:4000/api/groups
- **API Events:** http://localhost:4000/api/events 