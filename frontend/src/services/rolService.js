// ========================================================================
// 🛡️ rolService.js – Servicio para Roles (CENATE 2025)
// ------------------------------------------------------------------------
// Servicio para gestionar roles del sistema
// ========================================================================

import { apiClient } from "../lib/apiClient";

class RolService {
  /**
   * Obtener todos los roles
   * @returns {Promise<Array>} Lista de roles
   */
  async obtenerTodos() {
    try {
      const data = await apiClient.get("/admin/roles", true);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error al obtener roles:", error);
      throw error;
    }
  }

  /**
   * Obtener un rol por ID
   * @param {number} id - ID del rol
   * @returns {Promise<Object>} Rol encontrado
   */
  async obtenerPorId(id) {
    try {
      const data = await apiClient.get(`/admin/roles/${id}`, true);
      return data;
    } catch (error) {
      console.error(`Error al obtener rol ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crear un nuevo rol
   * @param {Object} rolData - Datos del rol
   * @param {string} rolData.descRol - Nombre/descripcion del rol
   * @param {string} rolData.statRol - Estado (A = Activo, I = Inactivo)
   * @param {number} rolData.nivelJerarquia - Nivel de jerarquia
   * @returns {Promise<Object>} Rol creado
   */
  async crear(rolData) {
    try {
      const response = await apiClient.post("/admin/roles", rolData, true);
      console.log("Rol creado exitosamente");
      return response;
    } catch (error) {
      console.error("Error al crear rol:", error);
      throw error;
    }
  }

  /**
   * Actualizar un rol existente
   * @param {number} id - ID del rol
   * @param {Object} rolData - Datos actualizados
   * @returns {Promise<Object>} Rol actualizado
   */
  async actualizar(id, rolData) {
    try {
      const response = await apiClient.put(`/admin/roles/${id}`, rolData, true);
      console.log(`Rol ${id} actualizado exitosamente`);
      return response;
    } catch (error) {
      console.error(`Error al actualizar rol ${id}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar un rol
   * @param {number} id - ID del rol
   * @returns {Promise<void>}
   */
  async eliminar(id) {
    try {
      await apiClient.delete(`/admin/roles/${id}`, true);
      console.log(`Rol ${id} eliminado exitosamente`);
    } catch (error) {
      console.error(`Error al eliminar rol ${id}:`, error);
      throw error;
    }
  }
}

export const rolService = new RolService();
