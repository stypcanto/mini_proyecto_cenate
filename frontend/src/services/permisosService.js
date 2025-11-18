// ========================================================================
// 🔐 permisosService.js – Servicio MBAC + Usuarios (CENATE 2025)
// ------------------------------------------------------------------------
// ✅ Gestión de usuarios (CRUD)
// ✅ Gestión de permisos (MBAC)
// ✅ Caché local
// ========================================================================

import { apiClient } from "../lib/apiClient";

class PermisosService {
  constructor() {
    this.cacheDuration = 5 * 60 * 1000; // 5 minutos
    this.cacheKey = "mbac_permisos_cache";
  }

  // ============================================================
  // 👥 Usuarios
  // ============================================================
  async obtenerUsuarios() {
    try {
      const data = await apiClient.get("/personal/total", true);
      if (!Array.isArray(data)) return [];
      
      // Mapear los datos del backend al formato esperado por el componente
      const usuariosMapeados = data.map(user => ({
        idUser: user.id_user,
        id_user: user.id_user,
        username: user.username,
        estado_usuario: user.estado_usuario,
        estado: user.estado_usuario === 'ACTIVO' ? 'A' : 'I',
        numero_documento: user.numero_documento,
        nombres: user.nombres,
        apellido_paterno: user.apellido_paterno,
        apellido_materno: user.apellido_materno,
        nombre_completo: user.nombre_completo?.trim() || `${user.nombres || ''} ${user.apellido_paterno || ''} ${user.apellido_materno || ''}`.trim() || user.username,
        ipress_asignada: user.nombre_ipress, // Actualizado: el API devuelve 'nombre_ipress'
        tipo_personal: user.tipo_personal, // "CENATE", "EXTERNO", "SIN_DATOS_PERSONAL"
        rol: user.roles, // El backend devuelve 'roles' pero es un string
        regimen_laboral: user.regimen_laboral || null,
        fecha_nacimiento: user.fecha_nacimiento || null,
        mes_cumpleanos: user.mes_cumpleanos || null,
        dia_cumpleanos: user.dia_cumpleanos || null,
        correo_personal: user.correo_personal || null,
        fecha_creacion_usuario: user.fecha_creacion_usuario,
        ultima_actualizacion_usuario: user.ultima_actualizacion_usuario,
        // Datos completos para el modal de detalle
        personal: {
          nombres: user.nombres,
          apellido_paterno: user.apellido_paterno,
          apellido_materno: user.apellido_materno,
          nombre_completo: user.nombre_completo,
          numero_documento: user.numero_documento,
          tipo_documento: user.tipo_documento,
          genero: user.genero,
          fecha_nacimiento: user.fecha_nacimiento,
          edad_actual: user.edad,
          ipress: user.nombre_ipress,
          contacto: {
            correo_corporativo: user.correo_institucional,
            correo_personal: user.correo_personal,
            telefono: user.telefono
          },
          direccion: {
            domicilio: user.direccion,
            distrito: user.distrito,
            provincia: user.provincia,
            departamento: user.departamento
          },
          laboral: {
            regimen_laboral: user.regimen_laboral,
            area: user.nombre_area,
            profesion: '', // No disponible en el API actual
            colegiatura: user.colegiatura,
            rne_especialista: '', // No disponible en el API actual
            especialidad: '', // No disponible en el API actual
            codigo_planilla: user.codigo_planilla
          },
          cumpleanos: {
            mes: user.mes_cumpleanos,
            dia: user.dia_cumpleanos
          }
        },
        roles: user.roles ? [user.roles] : [],
        fechas: {
          registro: user.fecha_creacion_usuario,
          ultima_actualizacion: user.ultima_actualizacion_usuario
        },
        foto_url: user.foto_url
      }));
      
      console.log(`✅ ${usuariosMapeados.length} usuarios obtenidos correctamente desde /api/personal/total`);
      return usuariosMapeados;
    } catch (error) {
      console.error("❌ Error al obtener usuarios:", error);
      throw error;
    }
  }

  async obtenerUsuarioPorId(idUser) {
    try {
      const data = await apiClient.get(`/personal/detalle/${idUser}`, true);
      console.log("📋 Detalle completo del usuario:", data);
      return data ?? {};
    } catch (error) {
      console.error(`❌ Error al obtener usuario ${idUser}:`, error);
      throw error;
    }
  }

  async crearUsuario(usuarioData) {
    try {
      const data = await apiClient.post("/usuarios/crear", usuarioData, true);
      this.limpiarCache();
      console.log("✅ Usuario creado exitosamente");
      return data;
    } catch (error) {
      console.error("❌ Error al crear usuario:", error);
      throw error;
    }
  }

  async actualizarUsuario(idUser, usuarioData) {
    try {
      const data = await apiClient.put(`/usuarios/id/${idUser}`, usuarioData, true);
      this.limpiarCache();
      console.log("✅ Usuario actualizado exitosamente");
      return data;
    } catch (error) {
      console.error(`❌ Error al actualizar usuario ${idUser}:`, error);
      throw error;
    }
  }

  async eliminarUsuario(idUser) {
    try {
      await apiClient.delete(`/usuarios/id/${idUser}`, true);
      this.limpiarCache();
      console.log("✅ Usuario eliminado exitosamente");
    } catch (error) {
      console.error(`❌ Error al eliminar usuario ${idUser}:`, error);
      throw error;
    }
  }

  async cambiarEstadoUsuario(idUser, nuevoEstado) {
    try {
      const data = await apiClient.patch(`/usuarios/${idUser}/estado`, { estado: nuevoEstado }, true);
      this.limpiarCache();
      console.log(`✅ Estado del usuario ${idUser} cambiado a ${nuevoEstado}`);
      return data;
    } catch (error) {
      console.error(`❌ Error al cambiar estado del usuario ${idUser}:`, error);
      throw error;
    }
  }

  // ============================================================
  // 🛡️ Permisos MBAC
  // ============================================================
  async obtenerPermisosUsuario(idUser) {
    try {
      // Revisar caché
      const cached = this.obtenerCache(idUser);
      if (cached) {
        console.log("✅ Permisos obtenidos desde caché");
        return cached;
      }

      // Llamada a backend
      const data = await apiClient.get(`/mbac/permisos/usuario/${idUser}`, true);
      if (!Array.isArray(data)) return [];

      // Transformar permisos a formato uniforme para el hook y la tabla
      const permisosTransformados = data.map((perm) => ({
        modulo: perm.nombreModulo || perm.modulo || "—",
        pagina: perm.nombrePagina || perm.pagina || "—",
        acciones: [
          perm.ver ? "ver" : null,
          perm.crear ? "crear" : null,
          perm.editar ? "editar" : null,
          perm.eliminar ? "eliminar" : null,
          perm.exportar ? "exportar" : null,
          perm.aprobar ? "aprobar" : null,
        ].filter(Boolean),
      }));

      // Guardar en caché
      this.guardarCache(idUser, permisosTransformados);

      console.log(`✅ ${permisosTransformados.length} permisos obtenidos correctamente`);
      return permisosTransformados;
    } catch (error) {
      console.error(`❌ Error al obtener permisos del usuario ${idUser}:`, error);
      return [];
    }
  }

  async refrescarPermisos(idUser) {
    this.limpiarCache();
    return await this.obtenerPermisosUsuario(idUser);
  }

  // ============================================================
  // 💾 Caché local
  // ============================================================
  guardarCache(idUser, permisos) {
    try {
      localStorage.setItem(this.cacheKey, JSON.stringify({ idUser, permisos, timestamp: Date.now() }));
    } catch (error) {
      console.warn("⚠️ No se pudo guardar en caché:", error);
    }
  }

  obtenerCache(idUser) {
    try {
      const cacheStr = localStorage.getItem(this.cacheKey);
      if (!cacheStr) return null;

      const cache = JSON.parse(cacheStr);
      if (cache.idUser !== idUser) return null;

      const elapsed = Date.now() - cache.timestamp;
      if (elapsed > this.cacheDuration) return null;

      return cache.permisos;
    } catch (error) {
      console.warn("⚠️ Error al leer caché:", error);
      return null;
    }
  }

  limpiarCache() {
    try {
      localStorage.removeItem(this.cacheKey);
      console.log("🗑️ Caché de permisos limpiado");
    } catch (error) {
      console.warn("⚠️ Error al limpiar caché:", error);
    }
  }
}

// Exportar singleton
export const permisosService = new PermisosService();