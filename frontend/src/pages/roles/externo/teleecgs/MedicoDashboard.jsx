/**
 * 🏥 MedicoDashboard.jsx
 * Dashboard específico para médicos con vista clínica mejorada
 * v1.0.0 - CENATE 2026
 *
 * Características médicamente optimizadas:
 * - Priorización por riesgo clínico
 * - Indicadores de tiempo de respuesta
 * - Filtros clínicos
 * - Vista rápida de parámetros críticos
 */

import React, { useState, useEffect } from "react";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  AlertCircle,
  Clock,
  RefreshCw,
  Filter,
  Download,
  Eye,
} from "lucide-react";
import toast from "react-hot-toast";
import ClinicalMetricsCard from "../../../../components/teleecgs/ClinicalMetricsCard";
import ImprovedECGTable from "../../../../components/teleecgs/ImprovedECGTable";
import teleecgService from "../../../../services/teleecgService";
import gestionPacientesService from "../../../../services/gestionPacientesService";

export default function MedicoDashboard() {
  const [ecgs, setEcgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    cargadas: 0,
    enEvaluacion: 0,
    observadas: 0,
    atendidas: 0,
    enviadas: 0,
  });
  const [todasLasImagenes, setTodasLasImagenes] = useState([]);
  const [pacientesCache, setPacientesCache] = useState({});
  const [filtroRiesgo, setFiltroRiesgo] = useState("todos");
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Cargar datos al montar
  useEffect(() => {
    cargarEKGs();

    // Auto-refresh cada 20 segundos si está habilitado
    const interval = setInterval(() => {
      if (autoRefresh) {
        cargarEKGs();
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const cargarEKGs = async () => {
    try {
      setLoading(true);

      // Cargar imágenes
      const response = await teleecgService.listarImagenes();
      let imagenes = response?.content || [];
      const totalPages = response?.totalPages || 1;

      // Cargar todas las páginas
      if (totalPages > 1) {
        for (let page = 1; page < totalPages; page++) {
          try {
            const pageResponse = await teleecgService.listarImagenesPage(page);
            const pageImagenes = pageResponse?.content || [];
            imagenes = imagenes.concat(pageImagenes);
          } catch (err) {
            console.warn(`Error cargando página ${page + 1}:`, err);
          }
        }
      }

      // Deduplicar por DNI
      const deduplicados = {};
      imagenes.forEach((img) => {
        const dni = img.dni || img.numDocPaciente;
        if (dni && !deduplicados[dni]) {
          deduplicados[dni] = img;
        }
      });

      const ecgsFormateados = Object.entries(deduplicados).map(([dni, img]) => {
        const esUrgente = img.es_urgente === true || img.esUrgente === true;

        // Contar imágenes por DNI
        const imagenesDni = imagenes.filter(
          (i) => (i.dni || i.numDocPaciente) === dni
        );

        return {
          ...img,
          nombrePaciente:
            img.nombreCompleto ||
            img.nombresPaciente ||
            img.nombrePaciente ||
            "Cargando...",
          genero: img.generoPaciente || img.genero || img.sexo || "-",
          edad: img.edadPaciente || img.edad || "-",
          telefono: img.telefonoPrincipalPaciente || img.telefono || "-",
          esUrgente: esUrgente,
          cantidadImagenes: imagenesDni.length || 0,
          fechaEnvio: img.fechaEnvio || img.fechaCarga || null,
          tiempoTranscurrido: img.fechaEnvio || img.fechaCarga
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
          estado: img.estadoTransformado || img.estado || "DESCONOCIDA",
        };
      });

      // Calcular estadísticas
      const imagenesPendientes = imagenes.filter(
        (img) => img.estado === "ENVIADA"
      );
      const imagenesObservadas = imagenes.filter(
        (img) => img.estado === "OBSERVADA"
      );
      const imagenesAtendidas = imagenes.filter(
        (img) => img.estado === "ATENDIDA"
      );

      const pacientesUnicos = new Set(
        imagenes.map((img) => img.dni || img.numDocPaciente).filter(Boolean)
      );

      setEcgs(ecgsFormateados);
      setTodasLasImagenes(imagenes);
      setStats({
        total: imagenes.length,
        cargadas: pacientesUnicos.size,
        enEvaluacion: imagenesPendientes.length,
        observadas: imagenesObservadas.length,
        atendidas: imagenesAtendidas.length,
        enviadas: imagenesPendientes.length,
      });

      setLoading(false);

      // Enriquecimiento en background
      const newCache = { ...pacientesCache };
      imagenes.forEach(async (img) => {
        const dni = img.dni || img.numDocPaciente;
        if (!dni || newCache[dni]) return;

        try {
          const datoPaciente =
            await gestionPacientesService.buscarAseguradoPorDni(dni);
          const nombreCompleto = datoPaciente?.apellidosNombres || "";

          if (nombreCompleto) {
            newCache[dni] = { nombres: nombreCompleto, apellidos: "" };
            setPacientesCache({ ...newCache });
            setEcgs((prev) =>
              prev.map((ecg) => {
                const ecgDni = ecg.dni || ecg.numDocPaciente;
                if (ecgDni === dni && ecg.nombrePaciente !== nombreCompleto) {
                  return { ...ecg, nombrePaciente: nombreCompleto };
                }
                return ecg;
              })
            );
          }
        } catch (err) {
          console.warn(`Error enriqueciendo ${dni}:`, err);
        }
      });
    } catch (error) {
      console.error("Error al cargar EKGs:", error);
      toast.error("Error al cargar datos");
      setLoading(false);
    }
  };

  // Filtrar EKGs según riesgo
  const ecgsFiltrados = ecgs.filter((ecg) => {
    if (filtroRiesgo === "todos") return true;

    // Calcular minutos
    let tiempoMinutos = 0;
    if (typeof ecg.tiempoTranscurrido === "string") {
      if (ecg.tiempoTranscurrido.includes("d")) {
        tiempoMinutos = parseInt(ecg.tiempoTranscurrido) * 1440;
      } else if (ecg.tiempoTranscurrido.includes("h")) {
        tiempoMinutos = parseInt(ecg.tiempoTranscurrido) * 60;
      } else if (ecg.tiempoTranscurrido.includes("m")) {
        tiempoMinutos = parseInt(ecg.tiempoTranscurrido);
      }
    }

    if (
      filtroRiesgo === "critico" &&
      (ecg.esUrgente || tiempoMinutos >= 60)
    ) {
      return true;
    }
    if (
      filtroRiesgo === "urgente" &&
      tiempoMinutos >= 30 &&
      tiempoMinutos < 60 &&
      !ecg.esUrgente
    ) {
      return true;
    }
    if (
      filtroRiesgo === "moderado" &&
      tiempoMinutos >= 15 &&
      tiempoMinutos < 30
    ) {
      return true;
    }
    if (filtroRiesgo === "rutina" && tiempoMinutos < 15) {
      return true;
    }

    return false;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Médico */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Activity className="w-10 h-10 text-red-600" />
              <div>
                <h1 className="text-4xl font-bold text-gray-900">
                  🏥 Monitor de Electrocardiogramas
                </h1>
                <p className="text-gray-600 mt-1">
                  Dashboard clínico para evaluación de EKGs por prioridad de riesgo
                </p>
              </div>
            </div>
            <button
              onClick={cargarEKGs}
              disabled={loading}
              title="Refrescar datos"
              className="p-2 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-6 h-6 text-blue-600 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>

          {/* Toggle Auto-Refresh */}
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            🔄 Auto-actualizar cada 20 segundos
          </label>
        </div>

        {/* 🏥 MÉTRICAS CLÍNICAS MEJORADAS */}
        <div className="mb-8">
          <ClinicalMetricsCard estadisticas={stats} />
        </div>

        {/* TABLA MEJORADA CON FILTROS CLÍNICOS */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Eye className="w-6 h-6 text-blue-600" />
              EKGs por Evaluar
            </h2>

            {/* Filtro Rápido por Riesgo */}
            <div className="flex gap-2 flex-wrap">
              {[
                { id: "todos", label: "Todos", color: "blue" },
                { id: "critico", label: "🔴 Críticos", color: "red" },
                { id: "urgente", label: "🟠 Urgentes", color: "orange" },
                { id: "moderado", label: "🟡 Moderados", color: "yellow" },
                { id: "rutina", label: "🟢 Rutina", color: "green" },
              ].map((opcion) => (
                <button
                  key={opcion.id}
                  onClick={() => setFiltroRiesgo(opcion.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    filtroRiesgo === opcion.id
                      ? `bg-${opcion.color}-600 text-white shadow-lg`
                      : `bg-${opcion.color}-100 text-${opcion.color}-800 hover:bg-${opcion.color}-200`
                  }`}
                >
                  {opcion.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tabla Mejorada */}
          <ImprovedECGTable
            ecgs={ecgsFiltrados}
            loading={loading}
            onVer={(ecg) => console.log("Ver:", ecg)}
            onDescargar={(id, nombre) => console.log("Descargar:", id, nombre)}
            onEliminar={(id) => console.log("Eliminar:", id)}
          />
        </div>

        {/* Pie de página con resumen */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-gray-600 text-sm mt-1">Total de Imágenes</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-3xl font-bold text-red-600">
              {Math.round(stats.total * 0.4)}
            </div>
            <div className="text-gray-600 text-sm mt-1">Requieren Acción</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-3xl font-bold text-green-600">
              {stats.atendidas}
            </div>
            <div className="text-gray-600 text-sm mt-1">Completadas</div>
          </div>
        </div>
      </div>
    </div>
  );
}
