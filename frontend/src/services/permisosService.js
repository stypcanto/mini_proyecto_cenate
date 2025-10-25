// ========================================================================
// 🔐 permisosService.js – Servicio de Permisos MBAC CENATE
// ------------------------------------------------------------------------
// Servicio centralizado para todas las operaciones de permisos
// Incluye caché inteligente y manejo de errores
// ========================================================================

import { apiClient } from '../lib/apiClient';

class PermisosService {
  constructor() {
    this.cacheDuration = 5 * 60 * 1000; // 5 minutos
    this.cacheKey = 'mbac_permisos_cache';
  }

  // ========================================================================
  // 📊 OBTENER PERMISOS DEL USUARIO
  // ========================================================================

  /**
   * Obtiene todos los permisos detallados de un usuario
   */
  async obtenerPermisosUsuario(username) {
    try {
      // Intentar obtener del cache primero
      const cached = this.obtenerCache(username);
      if (cached) {
        console.log('✅ Permisos obtenidos desde caché');
        return cached;
      }

      // Si no hay cache, obtener del backend
      console.log(`🔍 Obteniendo permisos para: ${username}`);
      const data = await apiClient.get(`/permisos/usuario/${username}`, true);
      
      if (!Array.isArray(data)) {
        console.warn('⚠️ Formato de permisos inválido, retornando array vacío');
        return [];
      }

      // Cachear los permisos
      this.guardarCache(username, data);
      
      return data;
    } catch (error) {
      console.error('❌ Error al obtener permisos:', error);
      return [];
    }
  }

  /**
   * Obtiene los módulos disponibles para un usuario
   */
  async obtenerModulosUsuario(username) {
    try {
      const data = await apiClient.get(`/mbac/permisos/usuario/${username}/modulos`, true);
      return data || [];
    } catch (error) {
      console.error('❌ Error al obtener módulos:', error);
      return [];
    }
  }

  /**
   * Verifica si un usuario tiene permiso para una acción en una ruta
   */
  async verificarPermiso(username, rutaPagina, accion = 'ver') {
    try {
      const data = await apiClient.post(
        '/mbac/permisos/verificar',
        {
          username,
          rutaPagina,
          accion
        },
        true
      );
      return data?.permitido || false;
    } catch (error) {
      console.error('❌ Error al verificar permiso:', error);
      return false;
    }
  }

  // ========================================================================
  // 👥 GESTIÓN DE USUARIOS (Solo SUPERADMIN)
  // ========================================================================

  /**
   * Obtiene todos los usuarios del sistema
   */
  async obtenerUsuarios() {
    try {
      const data = await apiClient.get('/usuarios', true);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('❌ Error al obtener usuarios:', error);
      throw error;
    }
  }

  /**
   * Obtiene un usuario específico por ID
   */
  async obtenerUsuarioPorId(idUser) {
    try {
      const data = await apiClient.get(`/usuarios/${idUser}`, true);
      return data;
    } catch (error) {
      console.error('❌ Error al obtener usuario:', error);
      throw error;
    }
  }

  /**
   * Obtiene un usuario por username
   */
  async obtenerUsuarioPorUsername(username) {
    try {
      const data = await apiClient.get(`/usuarios/username/${username}`, true);
      return data;
    } catch (error) {
      console.error('❌ Error al obtener usuario por username:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo usuario
   */
  async crearUsuario(usuarioData) {
    try {
      const data = await apiClient.post('/usuarios', usuarioData, true);
      console.log('✅ Usuario creado exitosamente');
      return data;
    } catch (error) {
      console.error('❌ Error al crear usuario:', error);
      throw error;
    }
  }

  /**
   * Actualiza un usuario existente
   */
  async actualizarUsuario(idUser, usuarioData) {
    try {
      const data = await apiClient.put(`/usuarios/${idUser}`, usuarioData, true);
      console.log('✅ Usuario actualizado exitosamente');
      this.limpiarCache();
      return data;
    } catch (error) {
      console.error('❌ Error al actualizar usuario:', error);
      throw error;
    }
  }

  /**
   * Elimina un usuario
   */
  async eliminarUsuario(idUser) {
    try {
      await apiClient.delete(`/usuarios/${idUser}`, true);
      console.log('✅ Usuario eliminado exitosamente');
      this.limpiarCache();
    } catch (error) {
      console.error('❌ Error al eliminar usuario:', error);
      throw error;
    }
  }

  // ========================================================================
  // 💾 SISTEMA DE CACHÉ
  // ========================================================================

  /**
   * Guarda permisos en el caché
   */
  guardarCache(username, permisos) {
    try {
      const cache = {
        username,
        permisos,
        timestamp: Date.now()
      };
      localStorage.setItem(this.cacheKey, JSON.stringify(cache));
    } catch (error) {
      console.warn('⚠️ No se pudo guardar en caché:', error);
    }
  }

  /**
   * Obtiene permisos del caché si no han expirado
   */
  obtenerCache(username) {
    try {
      const cacheStr = localStorage.getItem(this.cacheKey);
      if (!cacheStr) return null;

      const cache = JSON.parse(cacheStr);
      
      // Verificar que sea del mismo usuario
      if (cache.username !== username) {
        this.limpiarCache();
        return null;
      }

      // Verificar que no haya expirado
      const elapsed = Date.now() - cache.timestamp;
      if (elapsed > this.cacheDuration) {
        this.limpiarCache();
        return null;
      }

      return cache.permisos;
    } catch (error) {
      console.warn('⚠️ Error al leer caché:', error);
      return null;
    }
  }

  /**
   * Limpia el caché de permisos
   */
  limpiarCache() {
    try {
      localStorage.removeItem(this.cacheKey);
      console.log('🗑️ Caché de permisos limpiado');
    } catch (error) {
      console.warn('⚠️ Error al limpiar caché:', error);
    }
  }

  /**
   * Fuerza la recarga de permisos
   */
  async refrescarPermisos(username) {
    this.limpiarCache();
    return await this.obtenerPermisosUsuario(username);
  }

  // ========================================================================
  // 🔧 UTILIDADES
  // ========================================================================

  /**
   * Normaliza una ruta para comparación
   */
  normalizarRuta(ruta) {
    return ('/' + String(ruta || '').trim().replace(/^\/+/, ''))
      .toLowerCase()
      .replace(/\/$/, '');
  }

  /**
   * Extrae el username del token JWT
   */
  obtenerUsernameDelToken() {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) return null;

      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.username || payload.sub || payload.preferred_username;
    } catch (error) {
      console.error('❌ Error al extraer username del token:', error);
      return null;
    }
  }

  /**
   * Obtiene información del usuario actual
   */
  obtenerUsuarioActual() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('❌ Error al obtener usuario actual:', error);
      return null;
    }
  }
}

// Exportar instancia única (Singleton)
export const permisosService = new PermisosService();

// Exportar también la clase
export default PermisosService;
