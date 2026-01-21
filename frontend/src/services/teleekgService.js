// ========================================================================
// 📡 teleekgService.js – Servicio API para TeleEKG
// ✅ VERSIÓN 1.0.0 - CENATE 2026
// ========================================================================

import axios from "axios";
import apiClient from './apiClient';

// ✅ FIX: REACT_APP_API_URL ya incluye /api, así que no duplicamos
const API_BASE_URL = `${process.env.REACT_APP_API_URL || "http://localhost:8080/api"}/teleekgs`;

// ✅ Función auxiliar para obtener el token correctamente
const getAuthToken = () => {
  try {
    // ✅ v1.21.5: Usar la clave correcta 'auth.token' que usa AuthContext
    const token = localStorage.getItem("auth.token");
    if (!token) {
      console.warn("⚠️ No hay token en localStorage con clave 'auth.token'");
      return null;
    }
    return token;
  } catch (e) {
    console.error("❌ Error obteniendo token:", e);
    return null;
  }
};

const teleekgService = {
  /**
   * Cargar una imagen ECG
   * @param {FormData} formData - Contiene archivo, DNI, nombres, apellidos
   * @returns {Promise<Object>} Respuesta del servidor con detalles de la imagen
   */
  subirImagenECG: async (formData) => {
    try {
      const token = getAuthToken();

      // ✅ Usar fetch directamente con configuración correcta para multipart
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {},
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error al subir imagen:", error);
      throw error;
    }
  },

  /**
   * Subir múltiples imágenes ECG (4-10 imágenes con detección de duplicados)
   * @param {FormData} formData - Contiene archivos, DNI, nombres, apellidos
   * @returns {Promise<Array>} Array de imágenes subidas con detalles
   */
  subirMultiplesImagenes: async (formData) => {
    try {
      const token = getAuthToken();
      console.log("🔑 Token para upload-multiple:", token ? "✅ Presente" : "❌ No encontrado");

      // ✅ Usar fetch directamente con configuración correcta para multipart
      const response = await fetch(`${API_BASE_URL}/upload-multiple`, {
        method: 'POST',
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {},
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Error en upload-multiple:", errorData);
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error al subir múltiples imágenes:", error);
      throw error;
    }
  },

  /**
   * Listar imágenes ECG con filtros y paginación
   * @param {Object} filtros - {numDoc, estado, idIpress, fechaDesde, fechaHasta, page, size}
   * @returns {Promise<Object>} Página de imágenes
   */
  listarImagenes: async (filtros = {}) => {
    try {
      const params = new URLSearchParams();

      if (filtros.numDoc) params.append("numDoc", filtros.numDoc);
      if (filtros.estado) params.append("estado", filtros.estado);
      if (filtros.idIpress) params.append("idIpress", filtros.idIpress);
      if (filtros.fechaDesde) params.append("fechaDesde", filtros.fechaDesde.split("T")[0]);
      if (filtros.fechaHasta) params.append("fechaHasta", filtros.fechaHasta.split("T")[0]);
      params.append("page", filtros.page || 0);
      params.append("size", filtros.size || 20);

      const response = await axios.get(`${API_BASE_URL}/listar?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      return response.data.data;
    } catch (error) {
      console.error("Error al listar imágenes:", error);
      throw error;
    }
  },

  /**
   * Obtener detalles de una imagen específica
   * @param {number} idImagen - ID de la imagen
   * @returns {Promise<Object>} Detalles de la imagen
   */
  obtenerDetalles: async (idImagen) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${idImagen}/detalles`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      return response.data.data;
    } catch (error) {
      console.error("Error al obtener detalles:", error);
      throw error;
    }
  },

  /**
   * Descargar la imagen ECG
   * @param {number} idImagen - ID de la imagen
   * @returns {Promise<Blob>} Contenido de la imagen
   */
  descargarImagen: async (idImagen) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${idImagen}/descargar`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        responseType: "blob"
      });

      // Crear descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `ecg_${idImagen}.jpg`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      return response.data;
    } catch (error) {
      console.error("Error al descargar imagen:", error);
      throw error;
    }
  },

  /**
   * Obtener preview de la imagen
   * @param {number} idImagen - ID de la imagen
   * @returns {Promise<string>} URL del preview
   */
  obtenerPreview: async (idImagen) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${idImagen}/preview`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        responseType: "blob"
      });
      return URL.createObjectURL(response.data);
    } catch (error) {
      console.error("Error al obtener preview:", error);
      throw error;
    }
  },

  /**
   * Procesar una imagen (aceptar, rechazar o vincular)
   * @param {number} idImagen - ID de la imagen
   * @param {Object} datos - {accion, motivoRechazo, observaciones, dniVinculado}
   * @returns {Promise<Object>} Imagen actualizada
   */
  procesarImagen: async (idImagen, datos) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/${idImagen}/procesar`, datos, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      return response.data.data;
    } catch (error) {
      console.error("Error al procesar imagen:", error);
      throw error;
    }
  },

  /**
   * Obtener auditoría de una imagen
   * @param {number} idImagen - ID de la imagen
   * @param {Object} paginacion - {page, size}
   * @returns {Promise<Object>} Página de auditoría
   */
  obtenerAuditoria: async (idImagen, paginacion = {}) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/${idImagen}/auditoria?page=${paginacion.page || 0}&size=${paginacion.size || 20}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error al obtener auditoría:", error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas generales del módulo
   * @returns {Promise<Object>} Estadísticas y métricas
   */
  obtenerEstadisticas: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/estadisticas`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      return response.data.data;
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
      throw error;
    }
  },

  /**
   * Obtener imágenes próximas a vencer (< 3 días)
   * @returns {Promise<Array>} Lista de imágenes próximas a vencer
   */
  obtenerProximasVencer: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/proximas-vencer`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error("Error al obtener próximas a vencer:", error);
      return [];
    }
  },

  /**
   * Exportar estadísticas a Excel
   * @param {string} periodo - 'dia', 'semana', 'mes'
   * @returns {Promise<Blob>} Archivo Excel
   */
  exportarEstadisticas: async (periodo = "mes") => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/estadisticas/exportar?periodo=${periodo}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          responseType: "blob"
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `teleekgs-${periodo}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      return response.data;
    } catch (error) {
      console.error("Error al exportar estadísticas:", error);
      throw error;
    }
  },

  /**
   * ✅ v3.1.0: Obtener preview de imagen como base64 para carousel
   * @param {number} idImagen - ID de la imagen
   * @returns {Promise<Object>} { contenidoImagen: base64, tipoContenido: mimeType }
   */
  verPreview: async (idImagen) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/preview/${idImagen}`, {
        method: 'GET',
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {},
        credentials: 'include'
      });

      if (!response.ok) {
        console.warn(`⚠️ Error al obtener preview ${idImagen}:`, response.status);
        return { contenidoImagen: null, tipoContenido: null };
      }

      const blob = await response.blob();
      const mimeType = response.headers.get('content-type') || blob.type || 'image/jpeg';

      // Convertir blob a base64
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onload = () => {
          const base64String = reader.result.split(',')[1]; // Quitar el prefijo "data:..."
          resolve({
            contenidoImagen: base64String,
            tipoContenido: mimeType
          });
        };
        reader.onerror = () => {
          console.error('Error al leer preview como base64');
          resolve({ contenidoImagen: null, tipoContenido: null });
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error al obtener preview:', error);
      return { contenidoImagen: null, tipoContenido: null };
    }
  },

  /**
   * ✅ v3.2.1: Eliminar una imagen ECG
   * @param {number} idImagen - ID de la imagen
   * @returns {Promise<Object>} Respuesta del servidor
   */
  eliminarImagen: async (idImagen) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/${idImagen}`, {
        method: 'DELETE',
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {},
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error(`Error al eliminar imagen ${idImagen}:`, error);
      throw error;
    }
  }
};

export default teleekgService;
