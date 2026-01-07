import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EstrategiaService from "../../services/estrategiaService";
import Toast from "../ui/Toast";

/**
 * 🎯 Componente: Selector de Estrategia para Paciente
 * Permite asignar una estrategia a un paciente durante una atención
 *
 * @component
 * @param {Object} props
 * @param {string} props.pkAsegurado - ID del paciente (asegurado)
 * @param {Array} props.estrategias - Lista de estrategias disponibles
 * @param {Function} props.onEstrategiaAsignada - Callback cuando se asigna estrategia
 * @param {boolean} props.disabled - Deshabilitar el selector
 */
export default function SelectorEstrategia({
  pkAsegurado,
  estrategias = [],
  onEstrategiaAsignada,
  disabled = false,
}) {
  // Estado
  const [mostrarModal, setMostrarModal] = useState(false);
  const [estrategiaSeleccionada, setEstrategiaSeleccionada] = useState(null);
  const [observacion, setObservacion] = useState("");
  const [cargando, setCargando] = useState(false);
  const [toast, setToast] = useState(null);
  const [estrategiasActivas, setEstrategiasActivas] = useState([]);
  const [cargandoActivas, setCargandoActivas] = useState(true);

  // Cargar estrategias activas del paciente
  useEffect(() => {
    if (pkAsegurado) {
      cargarEstrategiasActivas();
    }
  }, [pkAsegurado]);

  const cargarEstrategiasActivas = async () => {
    try {
      setCargandoActivas(true);
      const activas = await EstrategiaService.obtenerEstrategiasActivas(
        pkAsegurado
      );
      setEstrategiasActivas(activas || []);
    } catch (error) {
      console.error("Error cargando estrategias activas:", error);
    } finally {
      setCargandoActivas(false);
    }
  };

  // Obtener estrategias disponibles (que no estén activas)
  const estrategiasDisponibles = estrategias.filter(
    (est) =>
      !estrategiasActivas.some(
        (activa) => activa.idEstrategia === est.idEstrategia
      )
  );

  const handleAsignar = async () => {
    if (!estrategiaSeleccionada) {
      setToast({
        type: "error",
        message: "Selecciona una estrategia",
      });
      return;
    }

    try {
      setCargando(true);

      const request = {
        pkAsegurado,
        idEstrategia: estrategiaSeleccionada.idEstrategia,
        observacion: observacion || undefined,
      };

      const resultado = await EstrategiaService.asignarEstrategia(request);

      if (resultado.success) {
        setToast({
          type: "success",
          message: `✅ ${estrategiaSeleccionada.estrategiaSigla} asignada exitosamente`,
        });

        // Actualizar lista de estrategias activas
        await cargarEstrategiasActivas();

        // Callback
        if (onEstrategiaAsignada) {
          onEstrategiaAsignada(resultado.data);
        }

        // Cerrar modal
        setMostrarModal(false);
        setEstrategiaSeleccionada(null);
        setObservacion("");
      } else {
        setToast({
          type: "error",
          message: resultado.error || "Error al asignar estrategia",
        });
      }
    } catch (error) {
      setToast({
        type: "error",
        message: error.error || "Error al asignar estrategia",
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
      {/* 🎯 Selector Principal */}
      <motion.div className="space-y-4">
        {/* Estrategias Activas */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
          <h3 className="text-sm font-semibold text-green-900 mb-3">
            📋 Estrategias Activas
          </h3>

          {cargandoActivas ? (
            <div className="flex items-center justify-center py-4 text-2xl">
              ⏳
            </div>
          ) : estrategiasActivas.length > 0 ? (
            <div className="space-y-2">
              {estrategiasActivas.map((est) => (
                <div
                  key={est.idAsignacion}
                  className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-green-100 flex items-start justify-between"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-green-900">
                      {est.estrategiaSigla}
                    </p>
                    <p className="text-xs text-gray-600">
                      {est.estrategiaDescripcion}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Desde:{" "}
                      {new Date(est.fechaAsignacion).toLocaleDateString("es-PE")}
                    </p>
                  </div>
                  <span className="text-xl flex-shrink-0 mt-1">✅</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600 italic">
              Sin estrategias activas asignadas
            </p>
          )}
        </div>

        {/* Botón Agregar Nueva */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setMostrarModal(true)}
          disabled={disabled || estrategiasDisponibles.length === 0}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
        >
          ➕ {estrategiasDisponibles.length === 0
            ? "Sin estrategias disponibles"
            : "Agregar Nueva Estrategia"}
        </motion.button>
      </motion.div>

      {/* 🎯 Modal de Selección */}
      <AnimatePresence>
        {mostrarModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Encabezado */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h2 className="text-xl font-bold text-white">
                  Asignar Estrategia
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  Selecciona una estrategia para el paciente
                </p>
              </div>

              {/* Contenido */}
              <div className="p-6 space-y-4">
                {/* Selector de Estrategia */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Estrategia
                  </label>
                  <select
                    value={estrategiaSeleccionada?.idEstrategia || ""}
                    onChange={(e) => {
                      const est = estrategiasDisponibles.find(
                        (s) => s.idEstrategia === parseInt(e.target.value)
                      );
                      setEstrategiaSeleccionada(est);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Seleccionar --</option>
                    {estrategiasDisponibles.map((est) => (
                      <option key={est.idEstrategia} value={est.idEstrategia}>
                        {est.sigla} - {est.descEstrategia}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Observación */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Observación (opcional)
                  </label>
                  <textarea
                    value={observacion}
                    onChange={(e) => setObservacion(e.target.value)}
                    placeholder="Ej: Paciente seleccionado para programa especial"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows="3"
                  />
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setMostrarModal(false);
                      setEstrategiaSeleccionada(null);
                      setObservacion("");
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAsignar}
                    disabled={cargando || !estrategiaSeleccionada}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    {cargando ? (
                      <span className="animate-spin">⏳</span>
                    ) : (
                      <>➕</>
                    )}
                    Asignar
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🎯 Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
