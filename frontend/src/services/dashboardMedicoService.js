// ========================================================================
// 🎴 dashboardMedicoService.js – Servicio CMS Dashboard Médico (CENATE 2025)
// ------------------------------------------------------------------------
// ✅ Gestión de cards del Dashboard Médico (CRUD)
// ✅ Obtención de cards activas para dashboard público
// ========================================================================

import { apiClient } from "../../lib/apiClient";

class DashboardMedicoService {
  // ============================================================
  // 📋 Obtener todas las cards (admin)
  // ============================================================
  async obtenerTodas() {
    try {
      const data = await apiClient.get("/admin/dashboard-medico/cards", true);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("❌ Error al obtener cards:", error);
      throw error;
    }
  }

  // ============================================================
  // 📋 Obtener solo cards activas (público para dashboard)
  // ============================================================
  async obtenerActivas() {
    try {
      const data = await apiClient.get("/admin/dashboard-medico/cards/activas", false);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("❌ Error al obtener cards activas:", error);
      return [];
    }
  }

  // ============================================================
  // 🔍 Obtener card por ID
  // ============================================================
  async obtenerPorId(id) {
    try {
      const data = await apiClient.get(`/admin/dashboard-medico/cards/${id}`, true);
      return data;
    } catch (error) {
      console.error(`❌ Error al obtener card ${id}:`, error);
      throw error;
    }
  }

  // ============================================================
  // ➕ Crear nueva card
  // ============================================================
  async crear(cardData) {
    try {
      const response = await apiClient.post("/admin/dashboard-medico/cards", cardData, true);
      console.log("✅ Card creada exitosamente");
      return response.data || response;
    } catch (error) {
      console.error("❌ Error al crear card:", error);
      throw error;
    }
  }

  // ============================================================
  // ✏️ Actualizar card
  // ============================================================
  async actualizar(id, cardData) {
    try {
      const response = await apiClient.put(`/admin/dashboard-medico/cards/${id}`, cardData, true);
      console.log(`✅ Card ${id} actualizada exitosamente`);
      return response.data || response;
    } catch (error) {
      console.error(`❌ Error al actualizar card ${id}:`, error);
      throw error;
    }
  }

  // ============================================================
  // ❌ Eliminar card
  // ============================================================
  async eliminar(id) {
    try {
      await apiClient.delete(`/admin/dashboard-medico/cards/${id}`, true);
      console.log(`✅ Card ${id} eliminada exitosamente`);
    } catch (error) {
      console.error(`❌ Error al eliminar card ${id}:`, error);
      throw error;
    }
  }

  // ============================================================
  // 🔄 Actualizar orden de cards
  // ============================================================
  async actualizarOrden(ids) {
    try {
      await apiClient.put("/admin/dashboard-medico/cards/orden", { ids }, true);
      console.log("✅ Orden de cards actualizado exitosamente");
    } catch (error) {
      console.error("❌ Error al actualizar orden:", error);
      throw error;
    }
  }

  // ============================================================
  // 🔄 Activar/Desactivar card
  // ============================================================
  async toggleActivo(id) {
    try {
      const response = await apiClient.put(`/admin/dashboard-medico/cards/${id}/toggle-activo`, {}, true);
      console.log(`✅ Estado de card ${id} cambiado exitosamente`);
      return response.data || response;
    } catch (error) {
      console.error(`❌ Error al cambiar estado de card ${id}:`, error);
      throw error;
    }
  }
}

// Exportar singleton
export const dashboardMedicoService = new DashboardMedicoService();

