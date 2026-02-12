// ========================================================================
// teleconsultorioApi.js - API para gestión de horarios de teleconsultorio
// ========================================================================

import { API_BASE_URL } from '../../../../../lib/apiClient';

/**
 * Servicio para gestionar la configuración de horarios de teleconsultorio
 */
class TeleconsultorioService {
  constructor() {
    this.baseUrl = `${API_BASE_URL}/solicitud-turnos`;
  }

  /**
   * Obtiene la configuración de teleconsultorio para una solicitud
   * @param {number} idSolicitud - ID de la solicitud
   * @returns {Promise<Object>} Configuración de teleconsultorio
   */
  async obtenerConfiguracion(idSolicitud) {
    // Primero probamos el endpoint super simple
    const simpleUrl = `${this.baseUrl}/test-simple`;
    console.log("🔧 Probando endpoint super simple:", simpleUrl);
    
    try {
      const simpleResponse = await fetch(simpleUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      
      if (simpleResponse.ok) {
        const simpleData = await simpleResponse.text();
        console.log("✅ Endpoint super simple funciona:", simpleData);
      } else {
        console.log("❌ Endpoint super simple falló:", simpleResponse.status);
      }
    } catch (simpleError) {
      console.log("❌ Endpoint super simple error:", simpleError.message);
    }
    
    // Luego probamos el endpoint de test
    const testUrl = `${this.baseUrl}/${idSolicitud}/test-teleconsultorio`;
    console.log("🧪 Probando endpoint de test:", testUrl);
    
    try {
      const testResponse = await fetch(testUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      
      if (testResponse.ok) {
        const testData = await testResponse.json();
        console.log("✅ Test endpoint funciona:", testData);
      } else {
        console.log("❌ Test endpoint falló:", testResponse.status);
      }
    } catch (testError) {
      console.log("❌ Test endpoint error:", testError.message);
    }
    
    // Ahora intentamos el endpoint real
    const url = `${this.baseUrl}/${idSolicitud}/teleconsultorio`;
    console.log("📡 TeleconsultorioService.obtenerConfiguracion:");
    console.log("  - URL:", url);
    console.log("  - ID Solicitud:", idSolicitud, "(tipo:", typeof idSolicitud, ")");
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (response.status === 404) {
        return null; // No existe configuración
      }

      if (!response.ok) {
        throw new Error(`Error al obtener configuración: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener configuración de teleconsultorio:', error);
      throw error;
    }
  }

  /**
   * Guarda o actualiza la configuración de teleconsultorio
   * @param {number} idSolicitud - ID de la solicitud
   * @param {Object} configuracion - Configuración de horarios
   * @returns {Promise<Object>} Configuración guardada
   */
  async guardarConfiguracion(idSolicitud, configuracion) {
    const url = `${this.baseUrl}/${idSolicitud}/teleconsultorio`;
    console.log("📡 TeleconsultorioService.guardarConfiguracion:");
    console.log("  - URL:", url);
    console.log("  - ID Solicitud:", idSolicitud, "(tipo:", typeof idSolicitud, ")");
    console.log("  - Configuración:", configuracion);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(configuracion)
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error al guardar configuración: ${response.status} - ${errorData}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al guardar configuración de teleconsultorio:', error);
      throw error;
    }
  }

  /**
   * Elimina la configuración de teleconsultorio
   * @param {number} idSolicitud - ID de la solicitud
   * @returns {Promise<void>}
   */
  async eliminarConfiguracion(idSolicitud) {
    try {
      const response = await fetch(`${this.baseUrl}/${idSolicitud}/teleconsultorio`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Error al eliminar configuración: ${response.status}`);
      }
    } catch (error) {
      console.error('Error al eliminar configuración de teleconsultorio:', error);
      throw error;
    }
  }

  /**
   * Verifica si existe configuración de teleconsultorio
   * @param {number} idSolicitud - ID de la solicitud
   * @returns {Promise<{existe: boolean, totalHoras: number}>}
   */
  async verificarExistencia(idSolicitud) {
    try {
      const response = await fetch(`${this.baseUrl}/${idSolicitud}/teleconsultorio/existe`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Error al verificar existencia: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al verificar existencia de configuración:', error);
      throw error;
    }
  }

  /**
   * Convierte la configuración del frontend al formato del backend
   * @param {Object} config - Configuración del frontend
   * @returns {Object} Configuración para el backend
   */
  convertirConfiguracionParaBackend(config) {
    const configuracion = {
      idSolicitud: config.idSolicitud,
      dias: config.dias || [],
      tipo: config.tipo || 'laborables',
      totalHoras: config.totalHoras || 0,
      observaciones: config.observaciones || null
    };

    // Configurar turno de mañana
    if (config.horariosManana && config.horariosManana.length > 0) {
      // Eliminar duplicados
      const horasUnicas = [...new Set(config.horariosManana)];
      configuracion.horariosManana = {
        tipo: 'MANANA',
        horas: horasUnicas.map(h => `${h}:00`), // Convertir "8" -> "8:00"
        activo: true
      };
    }

    // Configurar turno de tarde
    if (config.horariosTarde && config.horariosTarde.length > 0) {
      // Eliminar duplicados
      const horasUnicas = [...new Set(config.horariosTarde)];
      configuracion.horariosTarde = {
        tipo: 'TARDE',
        horas: horasUnicas.map(h => `${h}:00`), // Convertir "14" -> "14:00"
        activo: true
      };
    }

    return configuracion;
  }

  /**
   * Convierte la configuración del backend al formato del frontend
   * @param {Object} config - Configuración del backend
   * @returns {Object} Configuración para el frontend
   */
  convertirConfiguracionParaFrontend(config) {
    console.log("🔄 Convirtiendo configuración para frontend:", config);
    
    if (!config) {
      console.log("❌ Config es null/undefined");
      return null;
    }

    const configuracion = {
      idSolicitud: config.idSolicitud,
      dias: config.dias || [],
      tipo: config.tipo || 'laborables',
      totalHoras: config.totalHoras || 0,
      observaciones: config.observaciones,
      horariosManana: [],
      horariosTarde: []
    };

    console.log("🌅 Procesando horariosManana:", config.horariosManana);
    
    // Procesar horarios de mañana
    if (config.horariosManana && config.horariosManana.activo && config.horariosManana.horas) {
      console.log("✅ HorariosManana válidos, convirtiendo horas:", config.horariosManana.horas);
      configuracion.horariosManana = config.horariosManana.horas.map(h => {
        // Convertir "09:00" -> "9" (sin cero inicial para coincidir con las constantes)
        const hora = String(parseInt(h.split(':')[0], 10));
        console.log(`   "${h}" -> "${hora}"`);
        return hora;
      });
    } else {
      console.log("❌ HorariosManana no válidos:", {
        existe: !!config.horariosManana,
        activo: config.horariosManana?.activo,
        horas: config.horariosManana?.horas
      });
    }

    console.log("🌆 Procesando horariosTarde:", config.horariosTarde);
    
    // Procesar horarios de tarde
    if (config.horariosTarde && config.horariosTarde.activo && config.horariosTarde.horas) {
      console.log("✅ HorariosTarde válidos, convirtiendo horas:", config.horariosTarde.horas);
      configuracion.horariosTarde = config.horariosTarde.horas.map(h => {
        // Convertir "14:00" -> "14" (sin cero inicial)
        const hora = String(parseInt(h.split(':')[0], 10));
        console.log(`   "${h}" -> "${hora}"`);
        return hora;
      });
    } else {
      console.log("❌ HorariosTarde no válidos:", {
        existe: !!config.horariosTarde,
        activo: config.horariosTarde?.activo,
        horas: config.horariosTarde?.horas
      });
    }

    console.log("✅ Configuración final para frontend:", configuracion);
    return configuracion;
  }
}

// Instancia singleton del servicio
export const teleconsultorioService = new TeleconsultorioService();

export default teleconsultorioService;