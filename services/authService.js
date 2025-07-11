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
      // Verificar credenciales hardcodeadas de admin
      if (albionNick === 'admin' && password === 'admin989') {
        // Crear objeto de usuario admin hardcodeado
        const adminUser = {
          _id: 'admin-hardcoded',
          albionNick: 'admin',
          avatar: '👑',
          level: 1,
          experience: 'Experto',
          roles: [],
          gathering: {},
          profileCompleted: true,
          stats: {},
          guild: 'Administración',
          alliance: 'Sistema',
          city: 'Admin City',
          createdAt: new Date(),
          lastLogin: new Date(),
          isAdmin: true
        };

        // Generar token para admin hardcodeado
        const token = this.generateToken(adminUser);

        return {
          user: {
            id: adminUser._id,
            albionNick: adminUser.albionNick,
            avatar: adminUser.avatar,
            level: adminUser.level,
            experience: adminUser.experience,
            roles: adminUser.roles,
            gathering: adminUser.gathering,
            profileCompleted: adminUser.profileCompleted,
            stats: adminUser.stats,
            guild: adminUser.guild,
            alliance: adminUser.alliance,
            city: adminUser.city,
            createdAt: adminUser.createdAt,
            lastLogin: adminUser.lastLogin,
            isAdmin: adminUser.isAdmin
          },
          token
        };
      }

      // Buscar usuario por nick de Albion en la base de datos
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
      // Si es el usuario admin hardcodeado
      if (userId === 'admin-hardcoded') {
        return {
          id: 'admin-hardcoded',
          albionNick: 'admin',
          avatar: '👑',
          level: 1,
          experience: 'Experto',
          roles: [],
          gathering: {},
          guild: 'Administración',
          alliance: 'Sistema',
          city: 'Admin City',
          profileCompleted: true,
          stats: {},
          createdAt: new Date(),
          lastLogin: new Date(),
          isAdmin: true
        };
      }

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

  // Obtener todos los usuarios (solo para admin)
  async getAllUsers() {
    try {
      const users = await User.find({}).select('-password');
      return users.map(user => ({
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
      }));
    } catch (error) {
      throw error;
    }
  }

  // Restablecer contraseña de usuario (solo para admin)
  async resetUserPassword(userId, newPassword) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Encriptar nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, config.bcryptRounds);
      
      user.password = hashedPassword;
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
        lastLogin: user.lastLogin,
        isAdmin: user.isAdmin
      };
    } catch (error) {
      throw error;
    }
  }

  // Verificar credenciales admin hardcodeadas
  checkAdminCredentials(albionNick, password) {
    return albionNick === 'admin' && password === 'admin989';
  }
}

// Configuración de credenciales admin hardcodeadas

module.exports = new AuthService(); 