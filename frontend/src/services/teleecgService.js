import apiClient, { API_BASE_URL, getToken } from "./apiClient";
import toast from "react-hot-toast";

/**
 * 🫀 Servicio para gestionar operaciones de TeleECG
 * Realiza llamadas HTTP al backend /api/teleekgs
 */
const teleecgService = {
  /**
   * Subir una imagen ECG
   *
   * El backend espera:
   * - Query parameters: numDocPaciente, nombresPaciente, apellidosPaciente
   * - Multipart form field: archivo (file)
   */
  subirImagenECG: async (archivo, numDocPaciente, nombres, apellidos) => {
    try {
      // 1. Build query parameters
      const params = new URLSearchParams();
      params.append("numDocPaciente", numDocPaciente);
      params.append("nombresPaciente", nombres);
      params.append("apellidosPaciente", apellidos);

      // 2. Build FormData with file only
      const formData = new FormData();
      formData.append("archivo", archivo);

      // 3. Get token for authorization
      const token = getToken();
      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // 4. Make the request with proper multipart/form-data handling
      const url = `${API_BASE_URL}/teleekgs/upload?${params.toString()}`;
      console.log("📤 [UPLOAD ECG]:", url);

      const response = await fetch(url, {
        method: "POST",
        headers, // Don't set Content-Type, let browser set it for multipart
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;
        console.error("❌ [Upload Error]:", errorMessage);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("✅ [Upload Success]:", result);
      return result;
    } catch (error) {
      console.error("❌ [Upload Exception]:", error.message);
      throw error;
    }
  },

  /**
   * Listar todas las imágenes ECG
   * Convierte snake_case del API a camelCase para el frontend
   */
  listarImagenes: async (numDocPaciente = "", page = 0) => {
    const params = new URLSearchParams();
    if (numDocPaciente) params.append("numDocPaciente", numDocPaciente);
    params.append("page", page);

    const response = await apiClient.get(`/teleekgs/listar?${params}`, true);

    // El API retorna: { success, message, code, data: { content: [...], pageable: {...}, ... } }
    // El componente espera: { content: [...], pageable: {...}, ... }
    const apiData = response?.data || response || {};

    // Transformar propiedades de snake_case a camelCase
    if (apiData && Array.isArray(apiData.content)) {
      apiData.content = apiData.content.map(ecg => ({
        idImagen: ecg.id_imagen,
        numDocPaciente: ecg.num_doc_paciente,
        nombresPaciente: ecg.nombres_paciente,
        apellidosPaciente: ecg.apellidos_paciente,
        pacienteNombreCompleto: ecg.paciente_nombre_completo,
        generoPaciente: ecg.genero_paciente,
        edadPaciente: ecg.edad_paciente,
        telefonoPrincipalPaciente: ecg.telefono_principal_paciente,
        codigoIpress: ecg.codigo_ipress,
        nombreIpress: ecg.nombre_ipress,
        nombreArchivo: ecg.nombre_archivo,
        nombreOriginal: ecg.nombre_original,
        extension: ecg.extension,
        mimeType: ecg.mime_type,
        sizeBytes: ecg.size_bytes,
        estado: ecg.estado,
        fechaEnvio: ecg.fecha_envio,
        fechaRecepcion: ecg.fecha_recepcion,
        fechaExpiracion: ecg.fecha_expiracion,
        storageTipo: ecg.storage_tipo,
        storageRuta: ecg.storage_ruta,
        sha256: ecg.sha256,
        // Propiedades formateadas
        tamanoFormato: ecg.tamanio_formato,
        estadoFormato: ecg.estado_formato,
        fechaEnvioFormato: ecg.fecha_envio_formato,
        diasRestantes: ecg.dias_restantes,
        vigencia: ecg.vigencia,
        // Mantener originales también
        ...ecg
      }));
    }

    // Retornar directamente el objeto transformado (sin la envoltura de success/message/code)
    return apiData;
  },

  /**
   * Obtener detalles de una imagen ECG
   */
  obtenerDetalles: async (idImagen) => {
    return apiClient.get(`/teleekgs/${idImagen}/detalles`, true);
  },

  /**
   * ✅ FIX T-ECG-005: Descargar una imagen ECG con feedback visual
   * Muestra notificación al comenzar y al completar descarga
   */
  descargarImagen: async (idImagen, nombreArchivo) => {
    try {
      // Mostrar notificación inicial
      toast("Iniciando descarga...", { icon: "📥" });

      const token = getToken();
      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/teleekgs/${idImagen}/descargar`, {
        method: "GET",
        headers,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Obtener el tamaño total del archivo (si está disponible)
      const contentLength = response.headers.get("content-length");
      const total = parseInt(contentLength, 10);

      // Leer el blob con progreso
      const reader = response.body.getReader();
      const chunks = [];
      let loaded = 0;

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        chunks.push(value);
        loaded += value.length;

        // Log de progreso en consola para debugging
        if (total) {
          const percentCompleted = Math.round((loaded * 100) / total);
          console.log(`Descargando: ${percentCompleted}%`);
        }
      }

      // Crear blob y descargar
      const blob = new Blob(chunks);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", nombreArchivo || "ecg.jpg");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Mostrar éxito
      toast.success("✅ Descarga completada");

      return response;
    } catch (error) {
      console.error("❌ Error al descargar:", error);
      toast.error("Error al descargar la imagen");
      throw error;
    }
  },

  /**
   * Ver preview de una imagen ECG (retorna base64 para mostrar en modal)
   */
  verPreview: async (idImagen) => {
    try {
      const response = await fetch(`${API_BASE_URL}/teleekgs/preview/${idImagen}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Obtener el blob de la imagen
      const blob = await response.blob();

      // Convertir a base64
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          // Extraer solo la parte base64 (sin el prefijo data:...)
          const base64 = reader.result.split(',')[1];
          resolve({
            success: true,
            contenidoImagen: base64,
            tipoContenido: response.headers.get('content-type') || 'image/jpeg',
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('❌ Error al cargar preview:', error.message);
      throw error;
    }
  },

  /**
   * Procesar/aceptar una imagen ECG
   */
  procesarImagen: async (idImagen, observaciones = "") => {
    return apiClient.put(`/teleekgs/${idImagen}/procesar`, {
      accion: "PROCESAR",
      observaciones,
    }, true);
  },

  /**
   * Rechazar una imagen ECG
   */
  rechazarImagen: async (idImagen, motivo = "") => {
    return apiClient.put(`/teleekgs/${idImagen}/procesar`, {
      accion: "RECHAZAR",
      motivo,
    }, true);
  },

  /**
   * Eliminar una imagen ECG (eliminación física de la base de datos)
   */
  eliminarImagen: async (idImagen) => {
    return apiClient.delete(`/teleekgs/${idImagen}`, true);
  },

  /**
   * Vincular una imagen con un paciente registrado
   */
  vincularPaciente: async (idImagen, idUsuarioPaciente) => {
    return apiClient.put(`/teleekgs/${idImagen}/procesar`, {
      accion: "VINCULAR",
      idUsuarioVincular: idUsuarioPaciente,
    }, true);
  },

  /**
   * Obtener auditoría de una imagen
   */
  obtenerAuditoria: async (idImagen) => {
    return apiClient.get(`/teleekgs/${idImagen}/auditoria`, true);
  },

  /**
   * Obtener estadísticas
   */
  obtenerEstadisticas: async () => {
    return apiClient.get("/teleekgs/estadisticas", true);
  },

  /**
   * Obtener imágenes próximas a vencer
   */
  obtenerProximasVencer: async () => {
    return apiClient.get("/teleekgs/proximas-vencer", true);
  },

  /**
   * Exportar estadísticas a Excel
   */
  exportarExcel: async () => {
    return apiClient.get("/teleekgs/estadisticas/exportar", true).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `estadisticas-teleekgs-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      return response;
    });
  },
};

export default teleecgService;
