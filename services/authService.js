const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');

class AuthService {
  // Registro de usuario
  async register(userData) {
    try {
      // Verificar si el nick de Albion ya existe
      const existingUser = await User.findOne({ 
        albionNick: userData.albionNick.toLowerCase() 
      });
      
      if (existingUser) {
        throw new Error('El nick de Albion ya está registrado');
      }

      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(userData.password, config.bcryptRounds);

      // Crear usuario con valores por defecto
      const user = new User({
        albionNick: userData.albionNick.toLowerCase(),
        password: hashedPassword
        // avatar, level, experience se establecen por defecto en el modelo
      });

      await user.save();

      // Generar token
      const token = this.generateToken(user);

      return {
        user: {
          id: user._id,
          albionNick: user.albionNick,
          avatar: user.avatar,
          level: user.level,
          experience: user.experience,
          roles: user.roles,
          gathering: user.gathering,
          profileCompleted: user.profileCompleted,
          stats: user.stats,
          guild: user.guild,
          alliance: user.alliance,
          city: user.city,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
          isAdmin: user.isAdmin
        },
        token
      };
    } catch (error) {
      throw error;
    }
  }

  // Login de usuario
  async login(albionNick, password) {
    try {
      // Buscar usuario por nick de Albion
      const user = await User.findOne({ 
        albionNick: albionNick.toLowerCase() 
      });

      if (!user) {
        throw new Error('Nick de Albion o contraseña incorrectos');
      }

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Nick de Albion o contraseña incorrectos');
      }

      // Actualizar último login
      user.lastLogin = new Date();
      await user.save();

      // Generar token
      const token = this.generateToken(user);

      return {
        user: {
          id: user._id,
          albionNick: user.albionNick,
          avatar: user.avatar,
          level: user.level,
          experience: user.experience,
          roles: user.roles,
          gathering: user.gathering,
          profileCompleted: user.profileCompleted,
          stats: user.stats,
          guild: user.guild,
          alliance: user.alliance,
          city: user.city,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
          isAdmin: user.isAdmin
        },
        token
      };
    } catch (error) {
      throw error;
    }
  }

  // Actualizar perfil de usuario
  async updateProfile(userId, profileData) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Actualizar campos permitidos (excluyendo avatar, level, experience)
      const allowedFields = [
        'roles', 'gathering', 'guild', 'alliance', 'city', 'profileCompleted'
      ];

      allowedFields.forEach(field => {
        if (profileData[field] !== undefined) {
          user[field] = profileData[field];
        }
      });

      await user.save();

      return {
        id: user._id,
        albionNick: user.albionNick,
        avatar: user.avatar,
        level: user.level,
        experience: user.experience,
        roles: user.roles,
        gathering: user.gathering,
        profileCompleted: user.profileCompleted,
        stats: user.stats,
        guild: user.guild,
        alliance: user.alliance,
        city: user.city,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      };
    } catch (error) {
      throw error;
    }
  }

  // Obtener perfil de usuario
  async getUserProfile(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      return {
        id: user._id,
        albionNick: user.albionNick,
        avatar: user.avatar,
        level: user.level,
        experience: user.experience,
        roles: user.roles,
        gathering: user.gathering,
        guild: user.guild,
        alliance: user.alliance,
        city: user.city,
        profileCompleted: user.profileCompleted,
        stats: user.stats,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        isAdmin: user.isAdmin
      };
    } catch (error) {
      throw error;
    }
  }

  // Buscar usuarios por nick de Albion
  async searchUsers(searchTerm) {
    try {
      const users = await User.find({
        albionNick: { $regex: searchTerm, $options: 'i' }
      }).select('albionNick avatar level experience roles gathering');

      return users;
    } catch (error) {
      throw error;
    }
  }

  // Generar token JWT
  generateToken(user) {
    return jwt.sign(
      { 
        userId: user._id, 
        albionNick: user.albionNick 
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
  }

  // Verificar token
  verifyToken(token) {
    try {
      return jwt.verify(token, config.jwtSecret);
    } catch (error) {
      throw new Error('Token inválido');
    }
  }
}

// Crear usuario admin por defecto si no existe
(async () => {
  const adminUser = await User.findOne({ albionNick: 'admin' });
  if (!adminUser) {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin989', config.bcryptRounds);
    await User.create({
      albionNick: 'admin',
      password: hashedPassword,
      isAdmin: true
    });
    console.log('Usuario admin creado por defecto');
  }
})();

module.exports = new AuthService(); 