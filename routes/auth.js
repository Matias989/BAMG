const express = require('express');
const router = express.Router();
const authService = require('../services/authService');

// Middleware para verificar token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  try {
    const decoded = authService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido' });
  }
};

// Middleware para verificar si es admin
const requireAdmin = async (req, res, next) => {
  try {
    // Verificar si es el usuario admin hardcodeado
    if (req.user.albionNick === 'admin') {
      next();
    } else {
      // Verificar si es un usuario admin de la base de datos
      const user = await authService.getUserProfile(req.user.userId);
      if (!user.isAdmin) {
        return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
      }
      next();
    }
  } catch (error) {
    return res.status(403).json({ error: 'Error al verificar permisos de administrador' });
  }
};

// Registro de usuario
router.post('/register', async (req, res) => {
  try {
    const { albionNick, password } = req.body;

    // Validaciones básicas
    if (!albionNick || !password) {
      return res.status(400).json({ 
        error: 'Nick de Albion y contraseña son requeridos' 
      });
    }

    if (albionNick.trim().length < 3) {
      return res.status(400).json({ 
        error: 'El nick de Albion debe tener al menos 3 caracteres' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }

    const result = await authService.register({
      albionNick,
      password
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login de usuario
router.post('/login', async (req, res) => {
  try {
    const { albionNick, password } = req.body;

    if (!albionNick || !password) {
      return res.status(400).json({ 
        error: 'Nick de Albion y contraseña son requeridos' 
      });
    }

    const result = await authService.login(albionNick, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Obtener perfil del usuario
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const profile = await authService.getUserProfile(req.user.userId);
    res.json(profile);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Actualizar perfil del usuario
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const updatedProfile = await authService.updateProfile(req.user.userId, req.body);
    res.json(updatedProfile);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Buscar usuarios por nick de Albion
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({ 
        error: 'Se requiere un término de búsqueda de al menos 2 caracteres' 
      });
    }

    const users = await authService.searchUsers(q);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar usuarios por nick de Albion (público)
router.get('/users/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'Se requiere un término de búsqueda de al menos 2 caracteres' });
    }
    const users = await require('../models/User').find({
      albionNick: { $regex: q, $options: 'i' }
    }).select('albionNick avatar roles guild alliance city');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener perfil público de usuario por nick
router.get('/users/:albionNick', async (req, res) => {
  try {
    const user = await require('../models/User').findOne({ albionNick: req.params.albionNick.toLowerCase() })
      .select('albionNick avatar roles guild alliance city stats createdAt');
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verificar token
router.get('/verify', authenticateToken, (req, res) => {
  res.json({ 
    valid: true, 
    user: req.user 
  });
});

// Obtener todos los usuarios (solo admin)
router.get('/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await authService.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Restablecer contraseña de usuario (solo admin)
router.post('/admin/reset-password', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
      return res.status(400).json({ 
        error: 'ID de usuario y nueva contraseña son requeridos' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'La nueva contraseña debe tener al menos 6 caracteres' 
      });
    }

    const result = await authService.resetUserPassword(userId, newPassword);
    res.json({ message: 'Contraseña restablecida exitosamente', user: result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router; 