import apiClient, { API_BASE_URL, getToken } from "./apiClient";
import toast from "react-hot-toast";

/**
 * 🫀 Servicio para gestionar operaciones de TeleECG
 * Realiza llamadas HTTP al backend /api/teleekgs
 */
const teleecgService = {
  /**
   * ✅ v3.0.0: Subir múltiples imágenes ECG (PADOMI - 4-10 imágenes)
   * Envía FormData directamente con múltiples archivos
   */
  subirMultiplesImagenes: async (formData) => {
    try {
      const token = getToken();
      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const url = `${API_BASE_URL}/teleekgs/upload-multiple`;
      console.log("📤 [UPLOAD MULTIPLES ECGs]:", url);

      const response = await fetch(url, {
        method: "POST",
        headers,
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
   * Subir una imagen ECG
   *
   * El backend espera:
   * - Query parameters: numDocPaciente, nombresPaciente, apellidosPaciente, esUrgente
   * - Multipart form field: archivo (file)
   */
  subirImagenECG: async (archivo, numDocPaciente, nombres, apellidos, esUrgente = false) => {
    try {
      // 1. Build query parameters
      const params = new URLSearchParams();
      params.append("numDocPaciente", numDocPaciente);
      params.append("nombresPaciente", nombres);
      params.append("apellidosPaciente", apellidos);
      params.append("esUrgente", esUrgente === true ? "true" : "false");  // ✅ ADD esUrgente param

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
      console.log("📤 [UPLOAD ECG]:", url, "Urgente:", esUrgente);

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
   * ✅ v1.71.0: Cargar TODAS automáticamente - Estrategia: múltiples llamadas a backend
   */
  listarImagenes: async (numDocPaciente = "") => {
    const params = new URLSearchParams();
    if (numDocPaciente) params.append("numDocPaciente", numDocPaciente);
    // ✅ SIN parámetros page/size - obtener página 0 (15 items default)
    // El frontend cargará las páginas siguientes automáticamente

    const response = await apiClient.get(`/teleekgs?${params}`, true);
    return teleecgService._transformarResponse(response);
  },

  /**
   * ✅ v1.71.0: Listar imágenes ECG de una página específica
   * Usado internamente para cargar todas las páginas automáticamente
   */
  listarImagenesPage: async (page = 0) => {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("size", "15");  // Usar el size default del backend

    const response = await apiClient.get(`/teleekgs?${params}`, true);
    return teleecgService._transformarResponse(response);
  },

  /**
   * ✅ v1.71.0: Transformar respuesta del backend a formato esperado
   */
  _transformarResponse: (response) => {

    // Backend devuelve: Page<AseguradoConECGsDTO>
    // Estructura Spring Data: { content: [ { imagenes: [...], ... }, ... ], totalPages: X, ... }
    let apiData = response?.data || response || {};

    // Asegurar que tenemos un objeto con content
    if (!apiData || typeof apiData !== 'object') {
      apiData = { content: [] };
    }

    // Si es un array directo, envolverlo en { content: ... }
    if (Array.isArray(apiData)) {
      apiData = { content: apiData };
    }

    // Aplanar imagenes anidadas si existen
    if (apiData.content && Array.isArray(apiData.content)) {
      const flattenedImages = [];

      console.log("🔍 [_transformarResponse] Procesando", apiData.content.length, "asegurados");

      apiData.content.forEach((item, idx) => {
        if (item && item.imagenes && Array.isArray(item.imagenes)) {
          console.log(`  Asegurado ${idx}: ${item.num_doc_paciente} tiene ${item.imagenes.length} imágenes`);
          // Este item tiene imagenes anidadas - extraerlas
          item.imagenes.forEach(imagen => {
            flattenedImages.push({
              ...imagen,
              // Heredar datos del asegurado/paciente
              numDocPaciente: imagen.num_doc_paciente || imagen.numDocPaciente || item.num_doc_paciente,
              nombresPaciente: imagen.nombres_paciente || imagen.nombresPaciente || item.nombres_paciente,
              apellidosPaciente: imagen.apellidos_paciente || imagen.apellidosPaciente || item.apellidos_paciente,
              generoPaciente: imagen.genero_paciente || imagen.generoPaciente || item.genero_paciente,
              edadPaciente: imagen.edad_paciente || imagen.edadPaciente || item.edad_paciente,
            });
          });
        } else {
          console.log(`  Asegurado ${idx}: ${item?.num_doc_paciente} sin imágenes anidadas`);
          // Item sin imagenes anidadas - mantenerlo como está
          flattenedImages.push(item);
        }
      });

      // Reemplazar content con imagenes aplanadas
      console.log(`✅ Total imágenes aplanadas: ${flattenedImages.length}`);
      if (flattenedImages.length > 0) {
        apiData.content = flattenedImages;
      }
    }

    // Transformar propiedades de snake_case a camelCase
    if (apiData && Array.isArray(apiData.content)) {
      apiData.content = apiData.content.map((ecg, idx) => {
        const numDocPaciente = ecg.num_doc_paciente || ecg.numDocPaciente;
        const nombresPaciente = ecg.nombres_paciente || ecg.nombresPaciente;
        // ✅ v1.70.0: Soportar fechaUltimoEcg del backend (nuevo DTO)
        const fechaEnvio = ecg.fecha_envio || ecg.fechaEnvio || ecg.fecha_ultimo_ecg || ecg.fechaUltimoEcg;

        // 🔍 DEBUG: Log para verificar si es_urgente viene en la respuesta
        if (idx === 0 || ecg.numDocPaciente === '09164101') {
          console.log(`🔍 [teleecgService] ECG ${ecg.numDocPaciente}:`);
          console.log(`   es_urgente: ${ecg.es_urgente}`);
          console.log(`   esUrgente: ${ecg.esUrgente}`);
          console.log(`   urgente: ${ecg.urgente}`);
          console.log(`   Todas propiedades (keys): ${JSON.stringify(Object.keys(ecg))}`);
          console.log(`   Raw object:`, ecg);
        }

        return {
          // Campos principales con transformación snake_case → camelCase
          idImagen: ecg.id_imagen || ecg.idImagen || ecg.id,
          numDocPaciente,
          nombresPaciente,
          apellidosPaciente: ecg.apellidos_paciente || ecg.apellidosPaciente,
          pacienteNombreCompleto: ecg.paciente_nombre_completo || ecg.pacienteNombreCompleto,
          generoPaciente: ecg.genero_paciente || ecg.generoPaciente,
          edadPaciente: ecg.edad_paciente || ecg.edadPaciente,
          telefonoPrincipalPaciente: ecg.telefono_principal_paciente || ecg.telefonoPrincipalPaciente,
          codigoIpress: ecg.codigo_ipress || ecg.codigoIpress,
          nombreIpress: ecg.nombre_ipress || ecg.nombreIpress,
          nombreArchivo: ecg.nombre_archivo || ecg.nombreArchivo,
          nombreOriginal: ecg.nombre_original || ecg.nombreOriginal,
          extension: ecg.extension,
          mimeType: ecg.mime_type || ecg.mimeType,
          sizeBytes: ecg.size_bytes || ecg.sizeBytes,
          estado: ecg.estado,
          fechaEnvio,
          fechaRecepcion: ecg.fecha_recepcion || ecg.fechaRecepcion,
          fechaExpiracion: ecg.fecha_expiracion || ecg.fechaExpiracion,
          storageTipo: ecg.storage_tipo || ecg.storageTipo,
          storageRuta: ecg.storage_ruta || ecg.storageRuta,
          sha256: ecg.sha256,
          // Propiedades formateadas
          tamanoFormato: ecg.tamanio_formato || ecg.tamanoFormato,
          estadoFormato: ecg.estado_formato || ecg.estadoFormato,
          fechaEnvioFormato: ecg.fecha_envio_formato || ecg.fechaEnvioFormato,
          diasRestantes: ecg.dias_restantes || ecg.diasRestantes,
          vigencia: ecg.vigencia,
          esUrgente: ecg.es_urgente || ecg.esUrgente || false,  // ✅ Indicador de urgencia para MisECGsRecientes

          // ✅ ALIASES para componentes que esperan nombres diferentes
          dni: numDocPaciente,  // MisECGsRecientes espera 'dni'
          nombrePaciente: nombresPaciente,  // MisECGsRecientes espera 'nombrePaciente' (singular)
          fechaCarga: fechaEnvio,  // MisECGsRecientes espera 'fechaCarga'
          observacion: ecg.observacion || ecg.nota_clinica || null,  // Para observaciones

          // Mantener originales también
          ...ecg
        };
      });
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
   * Descargar imagen y convertir a base64 (fallback para verPreview)
   */
  descargarImagenBase64: async (idImagen) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/teleekgs/${idImagen}/descargar`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
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
      console.error('❌ Error al descargar imagen como base64:', error.message);
      throw error;
    }
  },

  /**
   * Ver preview de una imagen ECG (retorna base64 para mostrar en modal)
   * Con fallback a descargar directamente si /preview no funciona
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
        console.warn(`⚠️ Preview retornó ${response.status}, intentando descarga directa...`);
        // Si preview falla, intentar descargar directamente
        return await teleecgService.descargarImagenBase64(idImagen);
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
   * Procesar/aceptar una imagen ECG - v3.0.0: Usa acción "ATENDER"
   */
  procesarImagen: async (idImagen, observaciones = "") => {
    return apiClient.put(`/teleekgs/${idImagen}/procesar`, {
      accion: "ATENDER",
      observaciones,
    }, true);
  },

  /**
   * Rechazar una imagen ECG - v3.0.0: Usa acción "OBSERVAR"
   */
  rechazarImagen: async (idImagen, motivo = "") => {
    return apiClient.put(`/teleekgs/${idImagen}/procesar`, {
      accion: "OBSERVAR",
      observaciones: motivo,  // v3.0.0: El backend usa 'observaciones' en lugar de 'motivo'
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

  /**
   * ✅ v3.0.0: Evaluar un ECG como NORMAL o ANORMAL
   * Médico de CENATE marca y justifica su evaluación
   * Dataset supervisado para entrenamiento de modelos ML
   */
  evaluarImagen: async (idImagen, evaluacion, descripcion) => {
    try {
      const payload = {
        evaluacion,
        descripcion,
      };

      console.log("📋 [EVALUAR ECG]:", { idImagen, evaluacion });

      const response = await apiClient.put(
        `/teleekgs/${idImagen}/evaluar`,
        payload,
        true
      );

      console.log("✅ [Evaluación Guardada]:", response);
      return response;
    } catch (error) {
      console.error("❌ Error al evaluar imagen:", error.message);
      throw error;
    }
  },

  /**
   * ❌ v3.1.0: Rechazar imagen ECG por validación de calidad
   * Devuelve la imagen a IPRESS para que cambie la imagen
   * @param {number} idImagen - ID de la imagen ECG
   * @param {string} motivo - Motivo predefinido (MALA_CALIDAD, INCOMPLETA, etc)
   * @param {string} descripcion - Descripción adicional (opcional)
   */
  rechazarImagen: async (idImagen, motivo, descripcion = "") => {
    try {
      const payload = {
        motivo,
        descripcion,
      };

      console.log("❌ [RECHAZAR ECG]:", { idImagen, motivo });

      const response = await apiClient.put(
        `/teleekgs/${idImagen}/rechazar`,
        payload,
        true
      );

      console.log("✅ [Imagen Rechazada]:", response);
      return response;
    } catch (error) {
      console.error("❌ Error al rechazar imagen:", error.message);
      throw error;
    }
  },

  /**
   * ✅ v1.21.5: Listar ECGs agrupadas por asegurado
   * Retorna una lista de asegurados con todas sus ECGs agrupadas
   * Ideal para dashboard que muestra 1 fila por asegurado
   */
  listarAgrupoPorAsegurado: async (numDoc = "", estado = "") => {
    try {
      const params = new URLSearchParams();
      if (numDoc) params.append("numDoc", numDoc);
      if (estado && estado !== "TODOS") params.append("estado", estado);

      const url = `/teleekgs/agrupar-por-asegurado?${params.toString()}`;
      console.log("📋 [LISTAR AGRUPADO]:", url);

      const response = await apiClient.get(url, true);
      console.log("✅ [Agrupadas Cargadas]:", response.data?.length || 0, "asegurados");
      return response.data || [];
    } catch (error) {
      console.error("❌ Error al listar agrupadas:", error.message);
      throw error;
    }
  },

  /**
   * ✅ v3.0.0: Guardar Nota Clínica para un ECG
   * Complementa la evaluación médica con hallazgos clínicos y plan de seguimiento
   * @param {number} idImagen - ID de la imagen ECG
   * @param {object} notaClinica - Objeto con { hallazgos, observacionesClinicas, planSeguimiento }
   */
  guardarNotaClinica: async (idImagen, notaClinica) => {
    try {
      const payload = {
        hallazgos: notaClinica.hallazgos,
        observacionesClinicas: notaClinica.observacionesClinicas,
        planSeguimiento: notaClinica.planSeguimiento,
      };

      console.log("📋 [GUARDAR NOTA CLÍNICA]:", { idImagen, payload });

      const response = await apiClient.put(
        `/teleekgs/${idImagen}/nota-clinica`,
        payload,
        true
      );

      console.log("✅ [Nota Clínica Guardada]:", response);
      return response;
    } catch (error) {
      console.error("❌ Error al guardar nota clínica:", error.message);
      throw error;
    }
  },

  /**
   * ✅ v1.27.0: Cargar especialidades médicas de CENATE
   * Para interconsulta en plan de seguimiento
   */
  obtenerEspecialidades: async () => {
    try {
      console.log("📚 [CARGAR ESPECIALIDADES]");
      const response = await apiClient.get("/especialidades/activas", true);
      // Soporta respuesta como array directo o envuelto en .data
      const data = Array.isArray(response) ? response : (response.data || []);
      console.log("✅ [Especialidades Cargadas]:", data?.length || 0);
      return data;
    } catch (error) {
      console.error("❌ Error al cargar especialidades:", error.message);
      return [];
    }
  },

  /**
   * 🔄 v1.0.0: Actualizar transformaciones de imagen (rotación, flip)
   * Guarda de forma persistente en BD
   */
  actualizarTransformaciones: async (idImagen, rotacion, flipHorizontal, flipVertical) => {
    try {
      console.log("🔄 [ACTUALIZAR TRANSFORMACIONES]", { idImagen, rotacion, flipHorizontal, flipVertical });
      const response = await apiClient.put(
        `/teleekgs/${idImagen}/transformaciones`,
        {
          rotacion,
          flipHorizontal,
          flipVertical,
        },
        true
      );
      console.log("✅ [Transformaciones Guardadas]");
      return response.data || response;
    } catch (error) {
      console.error("❌ Error actualizando transformaciones:", error.message);
      throw error;
    }
  },

  /**
   * ✂️ v1.0.0: Recortar imagen de forma PERMANENTE
   * ADVERTENCIA: IRREVERSIBLE - Modifica la imagen original en BD
   */
  recortarImagen: async (idImagen, imagenBase64, mimeType = "image/png") => {
    try {
      console.log("✂️ [RECORTAR IMAGEN - PERMANENTE]", { idImagen, mimeType });
      const response = await apiClient.put(
        `/teleekgs/${idImagen}/recortar`,
        {
          imagenBase64,
          mimeType,
        },
        true
      );
      console.log("✅ [Imagen Recortada - PERMANENTE]");
      return response.data || response;
    } catch (error) {
      console.error("❌ Error recortando imagen:", error.message);
      throw error;
    }
  },

  /**
   * ✅ v11.5.0: Listar TODAS las imágenes individuales (sin agrupar por paciente)
   * @param {string} estado - Estado a filtrar (TODOS, ENVIADA, OBSERVADA, ATENDIDA)
   * @returns {Array} Lista de imágenes ECG APLANADAS (sin anidación)
   */
  listar: async (estado = "TODOS") => {
    try {
      const params = new URLSearchParams();
      if (estado && estado !== "TODOS") {
        params.append("estado", estado);
      }

      const queryString = params.toString();
      const url = queryString ? `/teleekgs?${queryString}` : "/teleekgs";

      console.log("🚀 [GET] Listando EKGs:", url);
      const response = await apiClient.get(url, true);

      // ✅ FIX: Usar _transformarResponse para aplanar imágenes anidadas
      const transformedData = teleecgService._transformarResponse(response);
      const data = transformedData.content || [];
      console.log("✅ EKGs cargadas:", data.length, "imágenes");
      return data;
    } catch (error) {
      console.error("❌ Error listando EKGs:", error);
      throw error;
    }
  },

  /**
   * ✅ v11.0.0: Crear bolsa de seguimiento (Recita o Interconsulta) desde TeleECG
   * Reutiliza lógica probada de AtenderPacienteService
   * @param {number} idImagen - ID de la imagen ECG
   * @param {string} tipo - Tipo de bolsa: "RECITA" o "INTERCONSULTA"
   * @param {string} especialidad - Especialidad médica (ej: "Cardiología")
   * @param {number} dias - Días para recita (ej: 90 para 3 meses). Solo para RECITA
   */
  crearBolsaSeguimiento: async (idImagen, tipo, especialidad, dias = null) => {
    try {
      const url = `${API_BASE_URL}/teleekgs/${idImagen}/crear-bolsa-seguimiento`;
      console.log(`📤 [POST] Creando bolsa de seguimiento:`, { idImagen, tipo, especialidad, dias });

      const payload = {
        tipo,
        especialidad,
      };

      // Agregar dias solo si se proporciona
      if (dias !== null && dias !== undefined) {
        payload.dias = dias;
      }

      const response = await apiClient.post(url, payload, true);

      console.log("✅ Bolsa de seguimiento creada:", response);
      return response;
    } catch (error) {
      console.error("❌ Error creando bolsa de seguimiento:", error.message);
      throw error;
    }
  },
};

export default teleecgService;
