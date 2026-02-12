import React, { useState, useEffect } from "react";
import { Upload, List, BarChart3, Wifi, WifiOff, CloudUpload, X } from "lucide-react";
import toast from "react-hot-toast";
import { useOnlineStatus } from "../../../../hooks/useOnlineStatus";
import UploadImagenECG from "../../../../components/teleecgs/UploadImagenECG";
import UploadFormWrapper from "../../../../components/teleecgs/UploadFormWrapper";
import MisECGsRecientes from "../../../../components/teleecgs/MisECGsRecientes";
import VisorEKGModal from "../../../../components/teleecgs/VisorECGModal";
import RegistroPacientes from "./RegistroPacientes";
import TeleECGEstadisticas from "./TeleECGEstadisticas";
import teleecgService from "../../../../services/teleecgService";
import gestionPacientesService from "../../../../services/gestionPacientesService";
import apiClient from "../../../../lib/apiClient";
import { getEstadoClasses } from "../../../../config/designSystem";

/**
 * Helper: Format ECGs for MisECGsRecientes component
 * Agrupa por paciente y cuenta imágenes
 * Enriquece nombres con formato "APELLIDOS, NOMBRES"
 */
function formatECGsForRecientes(ecgs, pacientesCache = {}) {
  // Agrupar por DNI para contar imágenes
  const porDni = {};
  ecgs.forEach(img => {
    const dni = img.numDocPaciente || img.dni;
    if (dni) {
      if (!porDni[dni]) {
        porDni[dni] = [];
      }
      porDni[dni].push(img);
    }
  });

  // Deduplicar por DNI para mostrar datos del primer paciente
  const deduplicados = {};
  ecgs.forEach(img => {
    const dni = img.numDocPaciente || img.dni;
    if (dni && !deduplicados[dni]) {
      deduplicados[dni] = img;
    }
  });

  return Object.entries(deduplicados).map(([dni, img]) => {
    // ✅ Usar nombreCompleto si ya está enriquecido, si no buscar alternativas
    let nombreFormateado = img.nombreCompleto ||
                          img.nombresPaciente ||
                          img.nombrePaciente ||
                          img.nombres ||
                          "Sin datos";

    console.log(`✅ [formatECG] DNI ${dni} - Nombre formateado: ${nombreFormateado}`);

    // 🔧 v1.71.0: Obtener esUrgente del objeto principal
    // ✅ El backend retorna es_urgente en el nivel superior del objeto, no anidado en array
    const imagenesPaciente = porDni[dni] || [];
    const esUrgente = imagenesPaciente.some(img => img.es_urgente === true || img.esUrgente === true);

    return {
      idImagen: img.idImagen || img.id,  // ✅ NECESARIO para cargar imagen
      nombrePaciente: nombreFormateado,
      dni: dni || "N/A",
      genero: img.generoPaciente || img.genero || img.sexo || "-",  // ✅ Backend envía 'generoPaciente' (F/M)
      edad: img.edadPaciente || img.edad || img.ageinyears || "-",  // ✅ Backend envía 'edadPaciente' (años)
      telefono: img.telefonoPrincipalPaciente || img.telefono || "-",  // ✅ Teléfono del asegurado desde BD
      esUrgente: esUrgente,  // ✅ Indicador de urgencia (SI ALGUNA imagen es urgente)
      cantidadImagenes: porDni[dni]?.length || 0,  // ✅ Contar imágenes del paciente
      // ✅ v1.70.0: Agregar fallback a fechaUltimoEcg (del nuevo DTO paginado)
      fechaEnvio: img.fechaEnvio || img.fechaCarga || img.fechaUltimoEcg || null,  // ✅ Fecha real para mostrar en tabla
      tiempoTranscurrido: img.fechaEnvio || img.fechaCarga || img.fechaUltimoEcg
        ? (() => {
            const ahora = new Date();
            const fecha = new Date(img.fechaEnvio || img.fechaCarga);
            const diferencia = ahora - fecha;
            const minutos = Math.floor(diferencia / 60000);
            const horas = Math.floor(minutos / 60);
            const dias = Math.floor(horas / 24);

            if (dias > 0) return `Hace ${dias}d`;
            if (horas > 0) return `Hace ${horas}h`;
            if (minutos > 0) return `Hace ${minutos}m`;
            return "Ahora";
          })()
        : "Desconocido",
      estado: img.estado_transformado || img.estado || "DESCONOCIDA",
      observacion: img.observacion || null,
      contenidoImagen: img.contenidoImagen || null,  // ✅ Para imágenes precargadas
      nombreArchivo: img.nombreArchivo || null,
      mimeType: img.mimeType || "image/jpeg",
    };
  });
}

/**
 * 🏢 IPRESS Workspace - Contenedor principal para Upload + Listar
 *
 * Desktop (≥1200px):
 * ┌─────────────────────────────────────────────────────┐
 * │  Split View: Upload Panel (40%) | Table Panel (60%) │
 * │  - Upload form siempre visible a la izquierda       │
 * │  - Tabla con imágenes a la derecha                   │
 * │  - Sincronización en tiempo real (callbacks)         │
 * └─────────────────────────────────────────────────────┘
 *
 * Tablet (768px-1199px):
 * ┌─────────────────────────────────────────────────────┐
 * │  Stacked: Upload (full) / Tabla (full)              │
 * │  - Upload en sección superior                       │
 * │  - Tabla debajo con espacio completo                │
 * │  - Mejor que mobile, más simple que desktop         │
 * └─────────────────────────────────────────────────────┘
 *
 * Mobile (<768px):
 * ┌─────────────────────────────────────────────────────┐
 * │  Tabs: [Upload] [Mis EKGs] [Estadísticas]           │
 * │  - Auto-switch a "Mis EKGs" después de upload       │
 * │  - Una sección visible a la vez                      │
 * └─────────────────────────────────────────────────────┘
 */
export default function IPRESSWorkspace() {
  // =======================================
  // 📊 STATE MANAGEMENT
  // =======================================
  const isOnline = useOnlineStatus();
  const [ecgs, setEcgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pacientesCache, setPacientesCache] = useState({});  // ✅ Cache de nombres de pacientes
  const [stats, setStats] = useState({
    total: 0,
    cargadas: 0,        // ✅ Inicializar cargadas
    enEvaluacion: 0,    // ✅ Inicializar enEvaluacion
    observadas: 0,
    atendidas: 0,
    enviadas: 0,
  });
  const [activeTab, setActiveTab] = useState("upload");
  const [deviceSize, setDeviceSize] = useState(() => {
    const width = window.innerWidth;
    if (width >= 1024) return "desktop";  // lg breakpoint de Tailwind
    if (width >= 768) return "tablet";    // md breakpoint de Tailwind
    return "mobile";
  });

  // ✅ Modal de visualización de imagen
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // ✅ Modal de carga de imágenes
  const [showUploadModal, setShowUploadModal] = useState(false);

  // ✅ TODOS LAS IMÁGENES (para poder filtrar cuando clickea el ojo)
  const [todasLasImagenes, setTodasLasImagenes] = useState([]);

  // ✅ PAGINACIÓN - Usar TODAS las imágenes cargadas (página 1 + páginas en background)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPagesFromBackend, setTotalPagesFromBackend] = useState(1);  // ✅ v1.71.0: Guardar totalPages del backend
  const [statsGlobales, setStatsGlobales] = useState(null);  // ✅ v1.97.2: Stats GLOBALES de toda la BD

  // ✅ v1.96.2: Cambiar ITEMS_PER_PAGE a 20 para coincidir con backend
  // Backend retorna 20 items/página, frontend debe coincidir
  const ITEMS_PER_PAGE = 20;

  // ✅ v1.71.0: Usar totalPages del backend, no calcularlo localmente
  const totalPages = totalPagesFromBackend;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  // ✅ v1.96.2: Usar todasLasImagenes (se actualiza cuando cargan páginas en background)
  const ecgsPaginados = todasLasImagenes.slice(startIndex, endIndex);

  // ✅ v1.97.0: DEDUPLICAR POR PACIENTE para mostrar 1 fila por paciente
  // Agrupar imágenes por DNI y contar cantidad
  const ecgsPaginadosDeduplicados = (() => {
    const porDni = {};
    const deduplicados = {};

    ecgsPaginados.forEach(img => {
      const dni = img.numDocPaciente || img.dni;
      if (dni) {
        // Agrupar todas las imágenes del paciente
        if (!porDni[dni]) {
          porDni[dni] = [];
        }
        porDni[dni].push(img);

        // Guardar una sola instancia por DNI (la primera)
        if (!deduplicados[dni]) {
          deduplicados[dni] = img;
        }
      }
    });

    // Mapear para asegurar que cantidadImagenes esté correcto
    return Object.entries(deduplicados).map(([dni, img]) => ({
      ...img,
      dni: dni,
      cantidadImagenes: porDni[dni].length || 0,
      nombrePaciente: img.nombreCompleto || img.nombresPaciente || img.nombrePaciente || "Cargando...",
      genero: img.generoPaciente || img.genero || img.sexo || "-",
      edad: img.edadPaciente || img.edad || img.ageinyears || "-",
      telefono: img.telefonoPrincipalPaciente || img.telefono || "-",
      esUrgente: img.es_urgente === true || img.esUrgente === true,
    }));
  })();

  // =======================================
  // 🔄 LIFECYCLE - Load data & handle resize
  // =======================================
  useEffect(() => {
    // Cargar imágenes al montar
    cargarEKGs();

    // Detectar cambios de tamaño de pantalla
    const handleResize = () => {
      const width = window.innerWidth;
      let newSize = "mobile";
      if (width >= 1024) newSize = "desktop";  // lg breakpoint de Tailwind
      else if (width >= 768) newSize = "tablet"; // md breakpoint de Tailwind
      setDeviceSize(newSize);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ v1.87.8: Auto-refresh cada 5 MINUTOS (en lugar de 30s)
  // Mantiene los stats estables y no fluctúan constantemente
  // El usuario puede presionar el botón Refrescar si quiere actualizar antes
  useEffect(() => {
    const interval = setInterval(() => {
      cargarEKGs();
    }, 300000);  // 5 minutos = 300000ms (en lugar de 30000ms)

    return () => clearInterval(interval);
  }, []);

  // ✅ v1.97.6: Cargar estadísticas GLOBALES de toda la BD (sin paginación)
  // FIX: Usar apiClient en lugar de fetch() para que vaya a puerto 8080
  useEffect(() => {
    const cargarStatsGlobales = async () => {
      try {
        console.log("📊 [v1.97.6] Cargando estadísticas globales de toda la BD...");

        const response = await apiClient.get('/teleekgs/estadisticas-globales', true);

        console.log("📡 [v1.97.6] Response status: 200 (apiClient maneja errores)");

        // Validar que la respuesta tiene la estructura correcta
        if (response?.data && typeof response.data === 'object') {
          console.log("✅ [v1.97.6] Stats globales cargadas exitosamente:", {
            totalPacientes: response.data.totalPacientes,
            pacientesPendientes: response.data.pacientesPendientes,
            pacientesObservados: response.data.pacientesObservados,
            pacientesAtendidos: response.data.pacientesAtendidos,
            totalImagenes: response.data.totalImagenes,
          });

          // ✅ IMPORTANTE: Actualizar el estado con los datos globales
          setStatsGlobales(response.data);

          console.log("💾 [v1.97.6] statsGlobales actualizado en estado - Componente se re-renderizará");
        } else {
          console.warn("⚠️ [v1.97.6] Response sin estructura esperada:", response);
        }
      } catch (error) {
        console.error("❌ [v1.97.6] Error cargando stats globales:", error.message);
        console.error("   Stack trace:", error.stack?.substring(0, 200));
      }
    };

    // Cargar INMEDIATAMENTE en el siguiente tick para evitar race conditions
    const timeoutId = setTimeout(cargarStatsGlobales, 100);

    // Recargar stats globales cada 5 minutos
    const intervalId = setInterval(cargarStatsGlobales, 300000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, []);


  // =======================================
  // 📂 FUNCTIONS
  // =======================================

  /**
   * ✅ v1.96.0: Helper para obtener el estado real de una imagen
   * Prioriza estado_transformado, luego estado original
   * Normaliza a mayúsculas y elimina espacios
   * FIX: Maneja caso donde backend envía "undefined" como string
   */
  const obtenerEstadoReal = (img) => {
    if (!img) return null;
    // ✅ v1.96.0: Filtrar valores inválidos (null, undefined, "undefined" string)
    let estado = img.estado_transformado || img.estado;
    if (!estado || estado === "undefined" || estado === "null") {
      return null;
    }
    return estado.toUpperCase().trim();
  };

  /**
   * Cargar imágenes desde el servidor y enriquecer con datos de pacientes
   * ✅ v1.71.0: Cargar TODAS las páginas automáticamente
   */
  const cargarEKGs = async (numDocBusqueda = "") => {
    try {
      setLoading(true);

      // ✅ v1.82.0: SI hay búsqueda, enviar al backend. SI no, cargar normalmente
      const tieneBusqueda = numDocBusqueda && numDocBusqueda.trim() !== "";
      console.log(`🔍 cargarEKGs - Búsqueda: "${numDocBusqueda}" (tiene búsqueda: ${tieneBusqueda})`);

      // ✅ OPCIÓN 1: Con búsqueda → Pasar DNI al backend (RÁPIDO)
      if (tieneBusqueda) {
        console.log(`🔎 Buscando en backend por DNI: ${numDocBusqueda}`);
        const response = await teleecgService.listarImagenes(numDocBusqueda);
        let imagenes = response?.content || [];
        console.log(`✅ Backend retornó ${imagenes.length} imágenes para DNI ${numDocBusqueda}`);

        // 🔍 DEBUG: Log primer item para ver estructura real
        if (imagenes.length > 0) {
          console.log(`🔍 [SEARCH] Primer item estructura:`, imagenes[0]);
          console.log(`🔍 [SEARCH] Fields: dni="${imagenes[0].dni}", numDocPaciente="${imagenes[0].numDocPaciente}", idImagen="${imagenes[0].idImagen}"`);
        }

        // Procesar datos
        const deduplicados = {};
        imagenes.forEach((img, idx) => {
          const dni = img.dni || img.numDocPaciente;
          if (dni && !deduplicados[dni]) {
            deduplicados[dni] = img;
          }
          if (idx === 0) console.log(`🔍 [SEARCH] Processing img ${idx}: dni="${dni}"`);
        });

        const ecgsFormateados = Object.values(deduplicados).map((img, idx) => {
          const dniValue = img.dni || img.numDocPaciente;
          const formatted = {
            ...img,
            // ✅ v1.87.0: EXPLÍCITAMENTE asegurar que dni está set para el filtro en MisECGsRecientes
            dni: dniValue,
            nombrePaciente: img.nombreCompleto || img.nombresPaciente || img.nombrePaciente || "Cargando...",
            genero: img.generoPaciente || img.genero || img.sexo || "-",
            edad: img.edadPaciente || img.edad || img.ageinyears || "-",
            telefono: img.telefonoPrincipalPaciente || img.telefono || "-",
            esUrgente: img.es_urgente === true || img.esUrgente === true,
            cantidadImagenes: imagenes.filter(i => (i.dni || i.numDocPaciente) === dniValue).length,
          };
          if (idx === 0) console.log(`🔍 [SEARCH] Formatted item: dni="${formatted.dni}", nombrePaciente="${formatted.nombrePaciente}", has numDocPaciente="${img.numDocPaciente}"`);
          return formatted;
        });

        console.log(`✅ [SEARCH] Total ecgsFormateados: ${ecgsFormateados.length}`);

          // ✅ v1.87.9: NO actualizar stats cuando se busca
        // Los cards SIEMPRE deben mostrar el TOTAL de la BD, no los resultados filtrados
        // Solo actualizar la tabla con los resultados de búsqueda
        console.log(`✅ [SEARCH] Búsqueda completada: ${ecgsFormateados.length} pacientes encontrados`);
        console.log(`✅ [SEARCH] Stats GLOBALES se mantienen (no se actualizan con búsqueda)`);

        setEcgs(ecgsFormateados);
        // ⚠️ NO hacer setStats() aquí - mantener los stats globales
        setTodasLasImagenes(imagenes);  // Para modal de edición
        setTotalPagesFromBackend(response?.totalPages || 1);
        setCurrentPage(1);
        setLoading(false);
        return;
      }

      // ✅ v1.86.0: LAZY LOADING - Primera carga RÁPIDA, páginas adicionales en BACKGROUND
      // PASO 1: Cargar solo página 1 (20 registros)
      const response = await teleecgService.listarImagenes("");
      let imagenes = response?.content || [];
      const totalPages = Math.min(response?.totalPages || 1, 5);  // MAX 5 páginas disponibles

      console.log(`⚡ Página 1 cargada: ${imagenes.length} registros (totalPages: ${totalPages})`);

      // ✅ PASO 2: Mostrar INMEDIATAMENTE con página 1 (NO ESPERAR MÁS)
      // Esto hace que la UI responda en <1 segundo
      const pacientesUnicos = new Set(imagenes.map((img) => img.dni || img.numDocPaciente).filter(Boolean));
      const porDni = {};
      const deduplicados = {};

      imagenes.forEach(img => {
        const dni = img.dni || img.numDocPaciente;
        if (dni) {
          if (!porDni[dni]) {
            porDni[dni] = [];
          }
          porDni[dni].push(img);
          if (!deduplicados[dni]) {
            deduplicados[dni] = img;
          }
        }
      });

      const ecgsFormateados = Object.entries(deduplicados).map(([dniKey, img]) => {
        const esUrgente = img.es_urgente === true || img.esUrgente === true;
        const imagenesDni = porDni[dniKey] || [];

        return {
          ...img,
          // ✅ v1.87.0: EXPLÍCITAMENTE asegurar que dni está set para el filtro en MisECGsRecientes
          dni: dniKey,
          nombrePaciente: img.nombreCompleto || img.nombresPaciente || img.nombrePaciente || "Cargando...",
          genero: img.generoPaciente || img.genero || img.sexo || "-",
          edad: img.edadPaciente || img.edad || img.ageinyears || "-",
          telefono: img.telefonoPrincipalPaciente || img.telefono || "-",
          esUrgente: esUrgente,
          cantidadImagenes: imagenesDni.length || 0,
        };
      });

      // ✅ v1.96.0: DEBUG MEJORADO - Ver estructura real con detección de "undefined" string
      if (imagenes.length > 0) {
        console.log("📊 [DEBUG v1.96.0] === ANÁLISIS DETALLADO DE PÁGINA 1 ===");
        console.log(`Total imágenes en página 1: ${imagenes.length}`);

        // Inspeccionar primeras 3 imágenes
        let undefinedStringCount = 0;
        for (let i = 0; i < Math.min(3, imagenes.length); i++) {
          const img = imagenes[i];
          const st = obtenerEstadoReal(img);
          const isUndefinedString = img.estado_transformado === "undefined";
          if (isUndefinedString) undefinedStringCount++;
          console.log(`  [IMG ${i}] DNI: ${img.dni}, Estado RAW: "${img.estado}", Estado TRANS: ${img.estado_transformado}${isUndefinedString ? ' ⚠️[STRING "undefined"]' : ''}, Estado FINAL: "${st}"`);
        }

        // Debug: contar imágenes por estado en página 1
        const conteoEstados = {};
        imagenes.forEach(img => {
          const st = obtenerEstadoReal(img);
          conteoEstados[st] = (conteoEstados[st] || 0) + 1;
        });

        // Log EXPANDIDO del conteo
        console.log("🔍 [DEBUG v1.96.0] Conteo de estados en página 1:");
        Object.entries(conteoEstados).forEach(([estado, count]) => {
          console.log(`   → ${estado}: ${count} imágenes`);
        });

        if (undefinedStringCount > 0) {
          console.warn(`⚠️⚠️ DETECTADO: ${undefinedStringCount} imágenes tienen estado_transformado="undefined" (STRING). Backend necesita fix.`);
        }
      }

      // Calcular estadísticas (PÁGINA 1 SOLAMENTE)
      const imagenesPendientes = imagenes.filter((img) => obtenerEstadoReal(img) === "ENVIADA" || obtenerEstadoReal(img) === "PENDIENTE");
      const imagenesObservadas = imagenes.filter((img) => obtenerEstadoReal(img) === "OBSERVADA");
      const imagenesAtendidas = imagenes.filter((img) => obtenerEstadoReal(img) === "ATENDIDA");

      console.log(`📋 [Página 1] Pendientes: ${imagenesPendientes.length}, Observadas: ${imagenesObservadas.length}, Atendidas: ${imagenesAtendidas.length}`);

      // ✅ v1.87.6: Contar PACIENTES ÚNICOS, no imágenes duplicadas
      const pacientesPendientes = new Set(imagenesPendientes.map(img => img.dni || img.numDocPaciente)).size;
      const pacientesObservadas = new Set(imagenesObservadas.map(img => img.dni || img.numDocPaciente)).size;
      const pacientesAtendidas = new Set(imagenesAtendidas.map(img => img.dni || img.numDocPaciente)).size;

      const newStats = {
        total: imagenes.length,
        cargadas: pacientesUnicos.size,
        enEvaluacion: pacientesPendientes,  // Pacientes con imágenes pendientes (no imágenes)
        observadas: pacientesObservadas,    // Pacientes con imágenes observadas
        atendidas: pacientesAtendidas,      // Pacientes con imágenes atendidas
        enviadas: pacientesPendientes,
      };

      // 🎯 MOSTRAR DATOS INMEDIATAMENTE - UI responde rápido
      setEcgs(ecgsFormateados);
      setTodasLasImagenes(imagenes);
      setTotalPagesFromBackend(totalPages);
      setCurrentPage(1);
      // ⚠️ v1.87.10: NO hacer setStats() aquí - esperar a que carguen TODAS las páginas
      // setStats() se ejecutará cuando terminen de cargar páginas 2-5 en background
      setLoading(false);  // ✅ LOADING FALSE AQUÍ - UI lista después de página 1

      console.log(`✅ UI actualizada con página 1. Cargando páginas 2-5 en BACKGROUND...`);

      // ✅ PASO 3: Cargar PÁGINAS 2-5 en BACKGROUND (sin bloquear UI)
      // El usuario YA ve datos, así que no importa si es lento
      if (totalPages > 1) {
        // setTimeout para que NO bloquee el render
        setTimeout(async () => {
          console.log(`📥 [BACKGROUND] Cargando páginas 2-${totalPages} en background...`);

          const pagePromises = [];
          for (let page = 1; page < totalPages; page++) {
            pagePromises.push(
              teleecgService.listarImagenesPage(page, "")
                .then(pageResponse => ({
                  success: true,
                  pageNum: page + 1,
                  content: pageResponse?.content || []
                }))
                .catch(err => ({
                  success: false,
                  pageNum: page + 1,
                  content: [],
                  error: err
                }))
            );
          }

          try {
            const pageResults = await Promise.all(pagePromises);
            let imagenesAcumuladas = imagenes;
            pageResults.forEach(result => {
              if (result.success) {
                imagenesAcumuladas = imagenesAcumuladas.concat(result.content);
              }
            });

            console.log(`✅ [BACKGROUND] Total acumulado: ${imagenesAcumuladas.length} registros`);
            setTodasLasImagenes(imagenesAcumuladas);

            // ✅ v1.96.4: Deduplicar por PACIENTE (DNI), no mostrar una fila por imagen
            // El usuario debe ver UNA FILA POR PACIENTE, no múltiples filas del mismo paciente
            const deduplicados = {};
            imagenesAcumuladas.forEach(img => {
              const dni = img.dni || img.numDocPaciente;
              if (dni && !deduplicados[dni]) {
                deduplicados[dni] = img;
              }
            });
            const ecgsDeduplicados = Object.values(deduplicados);
            console.log(`✅ [BACKGROUND] Después de deduplicar por paciente: ${ecgsDeduplicados.length} pacientes únicos`);
            setEcgs(ecgsDeduplicados);

            // ✅ v1.87.7: Recalcular STATS GLOBALES con TODOS los datos (no solo página 1)
            // Esto hace que el card negro muestre el TOTAL real de pacientes pendientes en toda la BD
            // ✅ v1.94.0: Usar helper obtenerEstadoReal para robustez
            const imagenesGlobalPendientes = imagenesAcumuladas.filter((img) =>
              obtenerEstadoReal(img) === "ENVIADA" || obtenerEstadoReal(img) === "PENDIENTE"
            );
            const imagenesGlobalObservadas = imagenesAcumuladas.filter((img) => obtenerEstadoReal(img) === "OBSERVADA");
            const imagenesGlobalAtendidas = imagenesAcumuladas.filter((img) => obtenerEstadoReal(img) === "ATENDIDA");

            const pacientesGlobalPendientes = new Set(imagenesGlobalPendientes.map(img => img.dni || img.numDocPaciente)).size;
            const pacientesGlobalObservadas = new Set(imagenesGlobalObservadas.map(img => img.dni || img.numDocPaciente)).size;
            const pacientesGlobalAtendidas = new Set(imagenesGlobalAtendidas.map(img => img.dni || img.numDocPaciente)).size;
            const pacientesGlobalUnicos = new Set(imagenesAcumuladas.map(img => img.dni || img.numDocPaciente)).size;

            const globalStats = {
              total: imagenesAcumuladas.length,
              cargadas: pacientesGlobalUnicos,  // Total de pacientes en toda la BD
              enEvaluacion: pacientesGlobalPendientes,  // Total de pacientes con imágenes pendientes
              observadas: pacientesGlobalObservadas,
              atendidas: pacientesGlobalAtendidas,
              enviadas: pacientesGlobalPendientes,
            };

            // ✅ v1.95.0: Debug logging detallado CON VALORES EXPANDIDOS
            console.log(`✅ [BACKGROUND] === CONTEO FINAL GLOBAL ===`);
            console.log(`   Total Imágenes: ${imagenesAcumuladas.length}`);
            console.log(`   Imágenes Pendientes (ENVIADA/PENDIENTE): ${imagenesGlobalPendientes.length}`);
            console.log(`   Imágenes Observadas: ${imagenesGlobalObservadas.length}`);
            console.log(`   Imágenes Atendidas: ${imagenesGlobalAtendidas.length}`);
            console.log(`   Pacientes Total: ${pacientesGlobalUnicos}`);
            console.log(`   Pacientes Pendientes: ${pacientesGlobalPendientes}`);
            console.log(`   Pacientes Observadas: ${pacientesGlobalObservadas}`);
            console.log(`   Pacientes Atendidas: ${pacientesGlobalAtendidas}`);
            console.log(`✅ [BACKGROUND] Stats finales:`, {
              total: globalStats.total,
              cargadas: globalStats.cargadas,
              enEvaluacion: globalStats.enEvaluacion,
              observadas: globalStats.observadas,
              atendidas: globalStats.atendidas,
            });
            setStats(globalStats);  // ✅ Actualizar cards con totales reales
          } catch (err) {
            console.error("❌ Error cargando páginas en background:", err);
          }
        }, 0);  // Ejecutar después del render actual
      }

    } catch (error) {
      console.error("❌ Error al cargar EKGs:", error);
      toast.error("Error al cargar las imágenes");
      setLoading(false);
    }
  };

  /**
   * Callback cuando upload es exitoso
   * - Agrega nuevas imágenes a la tabla
   * - Muestra toast de éxito
   * - Auto-switch a "Mis EKGs" en mobile
   */
  const handleUploadSuccess = (nuevasImagenes) => {
    // Recargar lista completa para asegurar sincronización
    cargarEKGs();

    // En mobile, cambiar automáticamente a la pestaña de listado
    if (deviceSize === "mobile") {
      setTimeout(() => {
        setActiveTab("lista");
      }, 500);
    }

    // Toast feedback
    toast.success(`✅ ${nuevasImagenes?.length || 1} EKGs cargados exitosamente`);
  };

  /**
   * Callback para refrescar tabla manualmente
   */
  const handleRefresh = async () => {
    await cargarEKGs();
    toast.success("✅ Datos actualizados");
  };

  /**
   * ✅ Abre modal con TODAS las imágenes del paciente
   * Detecta si es un DNI (click en card) o una imagen individual
   */
  const handleVerImagen = async (param) => {
    try {
      // Detectar si es un DNI (del click en card) o una imagen individual
      const isDni = param.dni && !param.idImagen;

      console.log(`🖼️ [handleVerImagen] isDni=${isDni}, param:`, param);

      if (isDni) {
        // 🎯 NUEVO: Click en card del paciente - Cargar TODAS sus imágenes
        // ✅ IMPORTANTE: Filtrar de todasLasImagenes (no de ecgs que está deduplicado)
        const imagenesPaciente = todasLasImagenes.filter(
          (img) => (img.numDocPaciente || img.dni) === param.dni
        );

        console.log(`📸 [handleVerImagen] Encontradas ${imagenesPaciente.length} imágenes para DNI ${param.dni}`);
        console.log(`📋 [handleVerImagen] Primera imagen:`, imagenesPaciente[0]);

        if (imagenesPaciente.length === 0) {
          toast.error("No se encontraron imágenes para este paciente");
          return;
        }

        // Cargar todas las imágenes en base64
        const imagenesConBase64 = await Promise.all(
          imagenesPaciente.map(async (img, idx) => {
            console.log(`🔄 [handleVerImagen] Procesando imagen ${idx + 1}/${imagenesPaciente.length}, idImagen=${img.idImagen || img.id}`);

            if (img.contenidoImagen) {
              console.log(`✅ [handleVerImagen] Imagen ${idx + 1} ya tiene contenidoImagen`);
              return img;
            }
            try {
              const idToUse = img.idImagen || img.id;
              console.log(`📥 [handleVerImagen] Descargando base64 para imagen ${idx + 1}, idImagen=${idToUse}`);

              const respuesta = await teleecgService.descargarImagenBase64(idToUse);

              console.log(`✅ [handleVerImagen] Imagen ${idx + 1} descargada, tamaño base64=${respuesta.contenidoImagen?.length || 0} bytes`);

              return {
                ...img,
                contenidoImagen: respuesta.contenidoImagen,
                tipoContenido: respuesta.tipoContenido,
              };
            } catch (error) {
              console.error(`❌ [handleVerImagen] Error descargando imagen ${idx + 1}:`, error.message);
              return img; // Si falla, devolver sin base64
            }
          })
        );

        console.log(`📊 [handleVerImagen] Resultado: ${imagenesConBase64.filter(img => img.contenidoImagen).length}/${imagenesConBase64.length} imágenes con base64`);

        // Abrir modal con TODAS las imágenes del paciente
        setSelectedImage({
          ...param,
          imagenes: imagenesConBase64,
          esCarousel: true,
        });
        setShowImageModal(true);
      } else {
        // 📌 ANTIGUO: Carga individual de imagen (backward compatibility)
        console.log(`🖼️ [handleVerImagen] Cargando imagen individual, idImagen=${param.idImagen}`);

        if (!param.contenidoImagen && param.idImagen) {
          console.log(`📥 [handleVerImagen] Descargando base64 para imagen individual`);
          const respuesta = await teleecgService.descargarImagenBase64(param.idImagen);

          console.log(`✅ [handleVerImagen] Imagen individual descargada, tamaño=${respuesta.contenidoImagen?.length || 0} bytes`);

          setSelectedImage({
            ...param,
            contenidoImagen: respuesta.contenidoImagen,
            tipoContenido: respuesta.tipoContenido,
            esCarousel: false,
          });
        } else {
          console.log(`⚠️ [handleVerImagen] Imagen sin contenidoImagen y sin idImagen`);
          setSelectedImage({ ...param, esCarousel: false });
        }
        setShowImageModal(true);
      }
    } catch (error) {
      console.error("❌ Error al obtener imágenes:", error);
      toast.error("Error al cargar las imágenes");
    }
  };

  // =======================================
  // 🎨 RENDER - Desktop Split View
  // =======================================
  if (deviceSize === "desktop") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Header con indicador de conexión */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                📋 Gestión de Electrocardiogramas
              </h1>
              <p className="text-slate-600">
                Sube y gestiona tus imágenes ECG desde aquí
              </p>
            </div>

            {/* Acciones Derecha - Botón Cargar + Indicador de Conexión */}
            <div className="flex items-center gap-3">
              {/* Botón Cargar Imágenes */}
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 whitespace-nowrap"
              >
                <CloudUpload className="w-5 h-5" />
                Cargar
              </button>

              {/* Indicador de Conexión - Punto Pulsante */}
              <div
                className={`w-3 h-3 rounded-full animate-pulse transition-all duration-200 ${
                  isOnline ? 'bg-green-500' : 'bg-red-500'
                }`}
                title={isOnline ? "Conectado" : "Sin conexión - Se guardará localmente"}
              />
            </div>
          </div>

          {/* Dashboard Full-Width */}
          <div className="w-full">
            {(() => {
              // ✅ v1.97.4: Debug - verificar qué valores se pasan a las tarjetas
              const estadisticasFinales = {
                total: statsGlobales?.totalImagenes || stats.total,
                cargadas: statsGlobales?.totalPacientes || stats.cargadas,
                enEvaluacion: statsGlobales?.pacientesPendientes || stats.enEvaluacion,
                observadas: statsGlobales?.pacientesObservados || stats.observadas,
                atendidas: (statsGlobales?.pacientesAtendidos || stats.atendidas || 0),
              };
              console.log("🎨 [v1.97.4] RENDER - Estadísticas pasadas a MisECGsRecientes:", {
                statsGlobalesPresente: !!statsGlobales,
                statsGlobales: statsGlobales ? {
                  totalPacientes: statsGlobales.totalPacientes,
                  pacientesPendientes: statsGlobales.pacientesPendientes,
                  pacientesObservados: statsGlobales.pacientesObservados,
                  pacientesAtendidos: statsGlobales.pacientesAtendidos,
                } : null,
                statsLocal: stats,
                estadisticasFinales: estadisticasFinales,
              });
              return null;
            })()}
            <MisECGsRecientes
              ultimas3={ecgsPaginadosDeduplicados}
              estadisticas={{
                total: statsGlobales?.totalImagenes || stats.total,  // ✅ Total de imágenes (GLOBAL)
                cargadas: statsGlobales?.totalPacientes || stats.cargadas,  // ✅ Pacientes únicos (GLOBAL - MOSTRADO EN CARD PRINCIPAL)
                enEvaluacion: statsGlobales?.pacientesPendientes || stats.enEvaluacion,  // Pacientes con imágenes pendientes (GLOBAL)
                observadas: statsGlobales?.pacientesObservados || stats.observadas,      // Pacientes observados (GLOBAL)
                atendidas: (statsGlobales?.pacientesAtendidos || stats.atendidas || 0),   // Pacientes atendidos (GLOBAL)
              }}
              onRefrescar={handleRefresh}
              onVerImagen={handleVerImagen}
              onBuscarPorDNI={(dni) => cargarEKGs(dni)}  // ✅ v1.80.4: Buscar en backend
              loading={loading}
              imagenesPorDni={(() => {
                // ✅ Agrupar TODAS las imágenes (no deduplicadas) por DNI para el modal de edición
                // ✅ Usar todasLasImagenes en lugar de ecgs (que está deduplicado)
                // ✅ Mapear propiedades del backend (snake_case) a camelCase
                const agrupadoPorDni = {};
                todasLasImagenes.forEach(img => {
                  const dni = img.numDocPaciente || img.dni;
                  if (dni) {
                    if (!agrupadoPorDni[dni]) {
                      agrupadoPorDni[dni] = [];
                    }
                    // ✅ Mapear id_imagen a idImagen para compatibilidad
                    const imagenMapeada = {
                      ...img,
                      idImagen: img.idImagen || img.id_imagen || img.id,
                      nombrePaciente: img.paciente_nombre_completo || img.nombrePaciente || 'Sin nombre'
                    };
                    agrupadoPorDni[dni].push(imagenMapeada);
                  }
                });
                return agrupadoPorDni;
              })()}
            />

            {/* ✅ Controles de Paginación */}
            {ecgs.length > 0 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
                >
                  ← Anterior
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
                >
                  Siguiente →
                </button>

                <span className="ml-4 text-sm font-semibold text-gray-700">
                  Página {currentPage} de {totalPages} ({ecgsPaginadosDeduplicados.length} pacientes)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Modal de visualización de imagen */}
        {showImageModal && selectedImage && (
          <VisorEKGModal
            onClose={() => {
              setShowImageModal(false);
              setSelectedImage(null);
            }}
            ecg={selectedImage}
            imagenes={selectedImage.imagenes || [selectedImage]}
            onDescargar={() => toast.success("📥 Descargando imagen...")}
          />
        )}

        {/* Modal de carga de imágenes */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative flex flex-col">
              {/* Botón cerrar - Círculo celeste */}
              <button
                onClick={() => setShowUploadModal(false)}
                className="absolute top-3 right-3 w-10 h-10 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg z-10 hover:scale-110"
                title="Cerrar modal"
              >
                <X className="w-5 h-5 text-blue-600" />
              </button>

              {/* Contenido del modal - sin padding superior para header ajustado */}
              <UploadFormWrapper
                onUploadSuccess={(nuevasImagenes) => {
                  handleUploadSuccess(nuevasImagenes);
                  setShowUploadModal(false);
                }}
                isWorkspace={true}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // =======================================
  // 🎨 RENDER - Tablet Stacked View
  // =======================================
  if (deviceSize === "tablet") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="w-full px-4 py-6">
          {/* Header con indicador de conexión */}
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                📋 Gestión de EKGs
              </h1>
              <p className="text-slate-600 text-sm">
                Sube y gestiona tus imágenes ECG
              </p>
            </div>

            {/* Indicador de Conexión - Punto Pulsante */}
            <div
              className={`w-2.5 h-2.5 rounded-full animate-pulse transition-all duration-200 flex-shrink-0 ${
                isOnline ? 'bg-green-500' : 'bg-red-500'
              }`}
              title={isOnline ? "Conectado" : "Sin conexión - Se guardará localmente"}
            />
          </div>

          {/* Stacked Layout: Upload + Tabla */}
          <div className="space-y-6">
            {/* Section 1: Upload Form */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                📤 Cargar EKGs
              </h2>
              <UploadImagenECG
                onUploadSuccess={handleUploadSuccess}
                isWorkspace={true}
              />
            </div>

            {/* Section 2: Mis EKGs Subidos */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  📋 Mis EKGs Subidos
                </h2>
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  🔄 Refrescar
                </button>
              </div>

              {/* Stats Cards - Compact Pill Format (Tablet) */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {/* Total */}
                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-full px-3 py-1.5 border border-blue-200 shadow-sm">
                  <div className="bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center font-bold text-xs">
                    {stats.total}
                  </div>
                  <span className="text-xs font-semibold text-blue-900">Total</span>
                </div>

                {/* Enviadas */}
                <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-full px-3 py-1.5 border border-yellow-200 shadow-sm">
                  <div className="bg-yellow-600 text-white rounded-full w-7 h-7 flex items-center justify-center font-bold text-xs">
                    {stats.enviadas}
                  </div>
                  <span className="text-xs font-semibold text-yellow-900">Enviadas</span>
                </div>

                {/* Observadas */}
                <div className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-orange-100 rounded-full px-3 py-1.5 border border-orange-200 shadow-sm">
                  <div className="bg-orange-600 text-white rounded-full w-7 h-7 flex items-center justify-center font-bold text-xs">
                    {stats.observadas}
                  </div>
                  <span className="text-xs font-semibold text-orange-900">Observadas</span>
                </div>

                {/* Atendidas */}
                <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-green-100 rounded-full px-3 py-1.5 border border-green-200 shadow-sm">
                  <div className="bg-green-600 text-white rounded-full w-7 h-7 flex items-center justify-center font-bold text-xs">
                    {stats.atendidas}
                  </div>
                  <span className="text-xs font-semibold text-green-900">Atendidas</span>
                </div>
              </div>

              {/* Tabla de imágenes */}
              <RegistroPacientes
                ecgs={ecgsPaginados}
                loading={loading}
                onRefresh={handleRefresh}
                isWorkspace={true}
              />

              {/* ✅ Controles de Paginación (Tablet) */}
              {ecgs.length > 0 && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
                  >
                    ← Anterior
                  </button>

                  <div className="flex gap-1 flex-wrap justify-center">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg font-semibold transition-colors text-sm ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
                  >
                    Siguiente →
                  </button>

                  <span className="text-sm font-semibold text-gray-700">
                    Página {currentPage} de {totalPages} ({ecgs.length} imágenes)
                  </span>
                </div>
              )}
            </div>

            {/* Section 3: Estadísticas */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                📊 Estadísticas
              </h2>
              <TeleECGEstadisticas />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =======================================
  // 🎨 RENDER - Mobile Tabs View
  // =======================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header con indicador de conexión */}
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              📋 Gestión de EKGs
            </h1>
            <p className="text-slate-600 text-sm">
              Sube y gestiona tus imágenes ECG
            </p>
          </div>

          {/* Indicador de Conexión - Punto Pulsante */}
          <div
            className={`w-3 h-3 rounded-full animate-pulse transition-all duration-200 flex-shrink-0 ${
              isOnline ? 'bg-green-500' : 'bg-red-500'
            }`}
            title={isOnline ? "Conectado" : "Sin conexión - Se guardará localmente"}
          />
        </div>

        {/* Manual Tabs Container */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Tab Headers - Optimizados para mobile */}
          <div className="flex border-b bg-slate-100 text-xs sm:text-sm">
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex-1 px-3 sm:px-4 py-3 font-medium transition-all flex items-center justify-center gap-1 sm:gap-2 ${
                activeTab === "upload"
                  ? "border-b-2 border-blue-600 bg-white text-blue-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Cargar EKGs</span>
              <span className="sm:hidden">Cargar</span>
            </button>
            <button
              onClick={() => setActiveTab("lista")}
              className={`flex-1 px-3 sm:px-4 py-3 font-medium transition-all flex items-center justify-center gap-1 sm:gap-2 ${
                activeTab === "lista"
                  ? "border-b-2 border-blue-600 bg-white text-blue-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <List className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Mis EKGs</span>
              <span className="sm:hidden">EKGs</span>
              <span className="text-xs">({stats.total})</span>
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`flex-1 px-3 sm:px-4 py-3 font-medium transition-all flex items-center justify-center gap-1 sm:gap-2 ${
                activeTab === "stats"
                  ? "border-b-2 border-blue-600 bg-white text-blue-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Estadísticas</span>
              <span className="sm:hidden">Stats</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            {/* Tab: Upload */}
            {activeTab === "upload" && (
              <UploadImagenECG
                onUploadSuccess={handleUploadSuccess}
                isWorkspace={true}
              />
            )}

            {/* Tab: Mis EKGs */}
            {activeTab === "lista" && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Mis EKGs Subidos
                  </h2>
                  <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 transition-colors"
                  >
                    🔄 Refrescar
                  </button>
                </div>

                {/* Stats Cards - Compact Pill Format (Mobile) */}
                <div className="flex gap-1.5 mb-4 flex-wrap">
                  {/* Total */}
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-full px-2.5 py-1 border border-blue-200 shadow-sm">
                    <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">
                      {stats.total}
                    </div>
                    <span className="text-xs font-semibold text-blue-900">Total</span>
                  </div>

                  {/* Enviadas */}
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-full px-2.5 py-1 border border-yellow-200 shadow-sm">
                    <div className="bg-yellow-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">
                      {stats.enviadas}
                    </div>
                    <span className="text-xs font-semibold text-yellow-900">Env</span>
                  </div>

                  {/* Observadas */}
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-orange-50 to-orange-100 rounded-full px-2.5 py-1 border border-orange-200 shadow-sm">
                    <div className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">
                      {stats.observadas}
                    </div>
                    <span className="text-xs font-semibold text-orange-900">Obs</span>
                  </div>

                  {/* Atendidas */}
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-green-50 to-green-100 rounded-full px-2.5 py-1 border border-green-200 shadow-sm">
                    <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">
                      {stats.atendidas}
                    </div>
                    <span className="text-xs font-semibold text-green-900">Ate</span>
                  </div>
                </div>

                <RegistroPacientes
                  ecgs={ecgsPaginados}
                  loading={loading}
                  onRefresh={handleRefresh}
                  isWorkspace={true}
                />

                {/* ✅ Controles de Paginación (Mobile) */}
                {ecgs.length > 0 && (
                  <div className="mt-6 flex flex-col items-center justify-center gap-3">
                    <div className="flex gap-1 flex-wrap justify-center">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-9 h-9 rounded-lg font-semibold transition-colors text-xs ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors text-sm"
                      >
                        ← Anterior
                      </button>

                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors text-sm"
                      >
                        Siguiente →
                      </button>
                    </div>

                    <span className="text-xs font-semibold text-gray-700">
                      Página {currentPage}/{totalPages} ({ecgs.length} imágenes)
                    </span>
                  </div>
                )}
              </>
            )}

            {/* Tab: Estadísticas */}
            {activeTab === "stats" && (
              <TeleECGEstadisticas />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
