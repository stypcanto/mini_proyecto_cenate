import apiClient from "./apiClient";

/**
 * 🫀 Servicio para gestionar operaciones de TeleECG
 * Realiza llamadas HTTP al backend /api/teleekgs
 */
const teleecgService = {
  /**
   * Subir una imagen ECG
   */
  subirImagenECG: async (archivo, numDocPaciente, nombres, apellidos) => {
    const formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("numDocPaciente", numDocPaciente);
    formData.append("nombresPaciente", nombres);
    formData.append("apellidosPaciente", apellidos);

    // Pass auth=true as third parameter
    return apiClient.post("/teleekgs/upload", formData, true);
  },

  /**
   * Listar todas las imágenes ECG
   */
  listarImagenes: async (numDocPaciente = "", page = 0) => {
    const params = new URLSearchParams();
    if (numDocPaciente) params.append("numDocPaciente", numDocPaciente);
    params.append("page", page);

    return apiClient.get(`/teleekgs/listar?${params}`, true);
  },

  /**
   * Obtener detalles de una imagen ECG
   */
  obtenerDetalles: async (idImagen) => {
    return apiClient.get(`/teleekgs/${idImagen}/detalles`, true);
  },

  /**
   * Descargar una imagen ECG
   */
  descargarImagen: async (idImagen, nombreArchivo) => {
    return apiClient.get(`/teleekgs/${idImagen}/descargar`, true).then((response) => {
      // Crear un URL de blob y descargar
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", nombreArchivo || "ecg.jpg");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      return response;
    });
  },

  /**
   * Ver preview de una imagen ECG
   */
  verPreview: async (idImagen) => {
    return apiClient.get(`/teleekgs/${idImagen}/preview`, true);
  },

  /**
   * Procesar/aceptar una imagen ECG
   */
  procesarImagen: async (idImagen, observaciones = "") => {
    return apiClient.put(`/teleekgs/${idImagen}/procesar`, {
      observaciones,
    }, true);
  },

  /**
   * Rechazar una imagen ECG
   */
  rechazarImagen: async (idImagen, motivo = "") => {
    return apiClient.put(`/teleekgs/${idImagen}/rechazar`, {
      motivo,
    }, true);
  },

  /**
   * Vincular una imagen con un paciente registrado
   */
  vincularPaciente: async (idImagen, idUsuarioPaciente) => {
    return apiClient.put(`/teleekgs/${idImagen}/vincular-paciente`, {
      idUsuarioPaciente,
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
