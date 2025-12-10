// ========================================================================
// SERVICIO DE FIRMA DIGITAL - CENATE
// ========================================================================
// Servicio para gestionar firma digital con DNIe/Token USB
// Utiliza Web Crypto API y comunicación con Fortify middleware
// ========================================================================

import apiClient from './apiClient';

// Configuración de Fortify (middleware para tokens USB/DNIe)
const FORTIFY_PORT = 31337;
const FORTIFY_WS_URL = `ws://127.0.0.1:${FORTIFY_PORT}`;

/**
 * Clase para gestionar la conexión con Fortify
 */
class FortifyConnection {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.pendingRequests = new Map();
    this.requestId = 0;
  }

  /**
   * Conecta con el servidor Fortify
   */
  async connect() {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(FORTIFY_WS_URL);

        this.ws.onopen = () => {
          console.log('Conectado a Fortify');
          this.isConnected = true;
          resolve(true);
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.id && this.pendingRequests.has(data.id)) {
              const { resolve, reject } = this.pendingRequests.get(data.id);
              this.pendingRequests.delete(data.id);
              if (data.error) {
                reject(new Error(data.error.message || 'Error en Fortify'));
              } else {
                resolve(data.result);
              }
            }
          } catch (e) {
            console.error('Error parsing Fortify message:', e);
          }
        };

        this.ws.onerror = (error) => {
          console.error('Error de conexion con Fortify:', error);
          this.isConnected = false;
          reject(new Error('No se pudo conectar con Fortify. Asegurese de que el middleware este instalado y ejecutandose.'));
        };

        this.ws.onclose = () => {
          console.log('Desconectado de Fortify');
          this.isConnected = false;
        };

        // Timeout de conexion
        setTimeout(() => {
          if (!this.isConnected) {
            reject(new Error('Timeout al conectar con Fortify'));
          }
        }, 5000);

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Envía un comando a Fortify
   */
  async send(method, params = {}) {
    if (!this.isConnected) {
      throw new Error('No conectado a Fortify');
    }

    return new Promise((resolve, reject) => {
      const id = ++this.requestId;
      this.pendingRequests.set(id, { resolve, reject });

      const message = JSON.stringify({
        jsonrpc: '2.0',
        id,
        method,
        params
      });

      this.ws.send(message);

      // Timeout de request
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('Timeout esperando respuesta de Fortify'));
        }
      }, 30000);
    });
  }

  /**
   * Cierra la conexion
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }
}

// ========================================================================
// FUNCIONES PRINCIPALES DEL SERVICIO
// ========================================================================

/**
 * Verifica si Fortify esta disponible
 */
export const verificarFortifyDisponible = async () => {
  const fortify = new FortifyConnection();
  try {
    await fortify.connect();
    fortify.disconnect();
    return { disponible: true, mensaje: 'Fortify esta disponible' };
  } catch (error) {
    return { disponible: false, mensaje: error.message };
  }
};

/**
 * Obtiene la lista de certificados del dispositivo
 */
export const obtenerCertificados = async () => {
  const fortify = new FortifyConnection();
  try {
    await fortify.connect();

    // Obtener proveedores (slots con tokens)
    const providers = await fortify.send('provider.getList');

    if (!providers || providers.length === 0) {
      throw new Error('No se encontraron dispositivos de firma. Conecte su DNIe o token USB.');
    }

    const certificados = [];

    for (const provider of providers) {
      try {
        // Obtener certificados del proveedor
        const certs = await fortify.send('provider.getCertificates', { providerId: provider.id });

        for (const cert of certs) {
          certificados.push({
            id: cert.id,
            providerId: provider.id,
            providerName: provider.name,
            subject: cert.subjectName,
            issuer: cert.issuerName,
            serialNumber: cert.serialNumber,
            validFrom: cert.notBefore,
            validTo: cert.notAfter,
            thumbprint: cert.thumbprint,
            raw: cert.raw // Certificado en Base64
          });
        }
      } catch (e) {
        console.warn(`Error al leer certificados del proveedor ${provider.name}:`, e);
      }
    }

    fortify.disconnect();
    return certificados;

  } catch (error) {
    fortify.disconnect();
    throw error;
  }
};

/**
 * Firma un documento con el certificado seleccionado
 */
export const firmarDocumento = async (certificadoId, providerId, documentoBase64, pin) => {
  const fortify = new FortifyConnection();
  try {
    await fortify.connect();

    // Calcular hash del documento
    const hashBuffer = await calcularHashSHA256(documentoBase64);
    const hashBase64 = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));

    // Firmar el hash
    const firma = await fortify.send('provider.sign', {
      providerId,
      certificateId: certificadoId,
      hash: hashBase64,
      algorithm: 'SHA-256',
      pin
    });

    fortify.disconnect();

    return {
      firma: firma.signature,
      algoritmo: 'SHA256withRSA',
      hashDocumento: hashBase64
    };

  } catch (error) {
    fortify.disconnect();
    throw error;
  }
};

/**
 * Calcula el hash SHA-256 de un documento
 */
export const calcularHashSHA256 = async (base64Data) => {
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return await crypto.subtle.digest('SHA-256', bytes);
};

/**
 * Convierte ArrayBuffer a string hexadecimal
 */
export const arrayBufferToHex = (buffer) => {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// ========================================================================
// FUNCIONES DE FIRMA SIMPLIFICADA (Sin Fortify - Para testing)
// ========================================================================

/**
 * Firma simplificada usando Web Crypto API
 * Esta funcion genera una firma simblica para testing
 * En produccion, usar firmarDocumento con Fortify
 */
export const firmarDocumentoSimplificado = async (pdfBase64, datosUsuario) => {
  try {
    // Calcular hash del documento
    const hashBuffer = await calcularHashSHA256(pdfBase64);
    const hashHex = arrayBufferToHex(hashBuffer);

    // Crear datos de firma simulados para testing
    const firmaData = {
      pdfBase64,
      firmaDigital: btoa(JSON.stringify({
        tipo: 'FIRMA_ELECTRONICA_SIMPLE',
        hash: hashHex,
        timestamp: new Date().toISOString(),
        firmante: datosUsuario.nombreCompleto,
        dni: datosUsuario.dni
      })),
      certificado: btoa(JSON.stringify({
        subject: `CN=${datosUsuario.nombreCompleto}`,
        issuer: 'CN=CENATE Test CA',
        serialNumber: Date.now().toString(16),
        validFrom: new Date().toISOString(),
        validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      })),
      hashDocumento: hashHex,
      dniFirmante: datosUsuario.dni,
      nombreFirmante: datosUsuario.nombreCompleto,
      algoritmoFirma: 'SHA256_SIMPLE'
    };

    return firmaData;

  } catch (error) {
    console.error('Error en firma simplificada:', error);
    throw error;
  }
};

// ========================================================================
// FUNCIONES DE COMUNICACION CON EL BACKEND
// ========================================================================

/**
 * Envía el formulario firmado al backend
 */
export const enviarFormularioFirmado = async (idFormulario, firmaData) => {
  try {
    const response = await apiClient.post(`/formulario-diagnostico/${idFormulario}/firmar`, {
      pdfBase64: firmaData.pdfBase64,
      firmaDigital: firmaData.firmaDigital,
      certificado: firmaData.certificado,
      hashDocumento: firmaData.hashDocumento,
      dniFirmante: firmaData.dniFirmante,
      nombreFirmante: firmaData.nombreFirmante,
      algoritmoFirma: firmaData.algoritmoFirma
    });
    return response;
  } catch (error) {
    console.error('Error al enviar formulario firmado:', error);
    throw error;
  }
};

/**
 * Verifica la firma de un formulario
 */
export const verificarFirmaFormulario = async (idFormulario) => {
  try {
    const response = await apiClient.get(`/formulario-diagnostico/${idFormulario}/verificar-firma`);
    return response;
  } catch (error) {
    console.error('Error al verificar firma:', error);
    throw error;
  }
};

/**
 * Descarga el PDF firmado
 */
export const descargarPdfFirmado = async (idFormulario) => {
  try {
    const token = localStorage.getItem('auth.token');
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

    const response = await fetch(`${baseUrl}/formulario-diagnostico/${idFormulario}/pdf`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Error al descargar PDF');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `formulario_${idFormulario}_firmado.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error al descargar PDF firmado:', error);
    throw error;
  }
};

/**
 * Verifica si un formulario esta firmado
 */
export const verificarEstaFirmado = async (idFormulario) => {
  try {
    const response = await apiClient.get(`/formulario-diagnostico/${idFormulario}/esta-firmado`);
    return response;
  } catch (error) {
    console.error('Error al verificar si esta firmado:', error);
    return false;
  }
};

// ========================================================================
// UTILIDADES
// ========================================================================

/**
 * Extrae informacion del certificado
 */
export const extraerInfoCertificado = (certificadoBase64) => {
  try {
    // Decodificar y parsear informacion basica
    const decoded = atob(certificadoBase64);

    // Extraer CN del subject (simplificado)
    const cnMatch = decoded.match(/CN=([^,]+)/);
    const nombre = cnMatch ? cnMatch[1] : 'Desconocido';

    return {
      nombre,
      valido: true // En produccion, verificar fechas y cadena de confianza
    };
  } catch (error) {
    return {
      nombre: 'Error al leer certificado',
      valido: false
    };
  }
};

/**
 * Formatea el tamano de archivo
 */
export const formatearTamano = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

// ========================================================================
// EXPORTACIONES
// ========================================================================

const firmaDigitalService = {
  verificarFortifyDisponible,
  obtenerCertificados,
  firmarDocumento,
  firmarDocumentoSimplificado,
  calcularHashSHA256,
  arrayBufferToHex,
  enviarFormularioFirmado,
  verificarFirmaFormulario,
  descargarPdfFirmado,
  verificarEstaFirmado,
  extraerInfoCertificado,
  formatearTamano
};

export default firmaDigitalService;
