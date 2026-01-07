import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EstrategiaService from "../../services/estrategiaService";
import Toast from "../ui/Toast";

/**
 * 📜 Componente: Historial de Estrategias del Paciente
 * Muestra todas las estrategias (activas, inactivas, completadas) del paciente
 * Permite desasignar estrategias si están activas
 *
 * @component
 * @param {Object} props
 * @param {string} props.pkAsegurado - ID del paciente (asegurado)
 * @param {Function} props.onEstrategiaDesasignada - Callback cuando se desasigna
 */
export default function HistorialEstrategias({
  pkAsegurado,
  onEstrategiaDesasignada,
}) {
  // Estado
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null);
  const [desasignando, setDesasignando] = useState(false);
  const [observacion, setObservacion] = useState("");

  // Cargar historial al montar componente o cambiar paciente
  useEffect(() => {
    if (pkAsegurado) {
      cargarHistorial();
    }
  }, [pkAsegurado]);

  const cargarHistorial = async () => {
    try {
      setCargando(true);
      const resultado = await EstrategiaService.obtenerHistorialEstrategias(
        pkAsegurado,
        0,
        100
      );
      setHistorial(resultado.data || []);
    } catch (error) {
      console.error("Error cargando historial:", error);
      setToast({
        type: "error",
        message: "Error al cargar historial de estrategias",
      });
    } finally {
      setCargando(false);
    }
  };

  const handleDesasignar = async () => {
    if (!modal) return;

    try {
      setDesasignando(true);

      const request = {
        nuevoEstado: modal.nuevoEstado || "INACTIVO",
        observacionDesvinculacion: observacion || undefined,
      };

      const resultado = await EstrategiaService.desasignarEstrategia(
        modal.idAsignacion,
        request
      );

      if (resultado.success) {
        setToast({
          type: "success",
          message: "✅ Estrategia desasignada exitosamente",
        });

        // Recargar historial
        await cargarHistorial();

        // Callback
        if (onEstrategiaDesasignada) {
          onEstrategiaDesasignada(resultado.data);
        }

        setModal(null);
        setObservacion("");
      } else {
        setToast({
          type: "error",
          message: resultado.error || "Error al desasignar",
        });
      }
    } catch (error) {
      setToast({
        type: "error",
        message: error.error || "Error al desasignar estrategia",
      });
    } finally {
      setDesasignando(false);
    }
  };

  // Separar activas de históricas
  const activas = historial.filter((h) => h.estado === "ACTIVO");
  const historicas = historial.filter((h) => h.estado !== "ACTIVO");

  // Función para obtener ícono según estado
  const getIconoEstado = (estado) => {
    switch (estado) {
      case "ACTIVO":
        return <span className="text-lg">✅</span>;
      case "INACTIVO":
        return <span className="text-lg">⏸️</span>;
      case "COMPLETADO":
        return <span className="text-lg">⏰</span>;
      default:
        return null;
    }
  };

  // Función para obtener color según estado
  const getColorEstado = (estado) => {
    switch (estado) {
      case "ACTIVO":
        return "bg-green-50 border-green-200";
      case "INACTIVO":
        return "bg-yellow-50 border-yellow-200";
      case "COMPLETADO":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-8 text-3xl animate-spin">
        ⏳
      </div>
    );
  }

  return (
    <>
      <motion.div className="space-y-6">
        {/* 📊 Resumen */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-600">
              {activas.length}
            </p>
            <p className="text-xs text-gray-600 mt-1">Activas</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {historial.filter((h) => h.estado === "INACTIVO").length}
            </p>
            <p className="text-xs text-gray-600 mt-1">Pausadas</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {historial.filter((h) => h.estado === "COMPLETADO").length}
            </p>
            <p className="text-xs text-gray-600 mt-1">Completadas</p>
          </div>
        </div>

        {/* 📋 Estrategias Activas */}
        {activas.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">
              ✅ En Curso
            </h3>
            <div className="space-y-2">
              {activas.map((estrategia) => (
                <motion.div
                  key={estrategia.idAsignacion}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`${getColorEstado(
                    estrategia.estado
                  )} border rounded-lg p-4 flex items-start justify-between`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getIconoEstado(estrategia.estado)}
                      <p className="font-semibold text-gray-900">
                        {estrategia.estrategiaSigla}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {estrategia.estrategiaDescripcion}
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                      <p>
                        Inicio:{" "}
                        <span className="font-semibold">
                          {new Date(
                            estrategia.fechaAsignacion
                          ).toLocaleDateString("es-PE")}
                        </span>
                      </p>
                      <p>
                        Días:{" "}
                        <span className="font-semibold">
                          {estrategia.diasEnEstrategia}
                        </span>
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      setModal({
                        idAsignacion: estrategia.idAsignacion,
                        estrategia: estrategia.estrategiaSigla,
                        nuevoEstado: "INACTIVO",
                      })
                    }
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600 text-lg"
                    title="Desasignar"
                  >
                    🗑️
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* 📜 Historial */}
        {historicas.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">
              📜 Historial
            </h3>
            <div className="space-y-2">
              {historicas.map((estrategia) => (
                <motion.div
                  key={estrategia.idAsignacion}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`${getColorEstado(
                    estrategia.estado
                  )} border rounded-lg p-4`}
                >
                  <div className="flex items-start gap-3">
                    {getIconoEstado(estrategia.estado)}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {estrategia.estrategiaSigla}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        {estrategia.estrategiaDescripcion}
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 mb-2">
                        <p>
                          Inicio:{" "}
                          <span className="font-semibold">
                            {new Date(
                              estrategia.fechaAsignacion
                            ).toLocaleDateString("es-PE")}
                          </span>
                        </p>
                        {estrategia.fechaDesvinculacion && (
                          <p>
                            Fin:{" "}
                            <span className="font-semibold">
                              {new Date(
                                estrategia.fechaDesvinculacion
                              ).toLocaleDateString("es-PE")}
                            </span>
                          </p>
                        )}
                        <p>
                          Duración:{" "}
                          <span className="font-semibold">
                            {estrategia.diasTotalEnEstrategia || 0} días
                          </span>
                        </p>
                        <p>
                          Estado:{" "}
                          <span className="font-semibold">
                            {estrategia.estado}
                          </span>
                        </p>
                      </div>
                      {estrategia.observacionDesvinculacion && (
                        <div className="text-xs bg-white/50 rounded px-2 py-1 text-gray-700 italic">
                          ⚠️ {estrategia.observacionDesvinculacion}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* 📭 Sin estrategias */}
        {historial.length === 0 && (
          <div className="text-center py-8">
            <div className="text-5xl text-gray-300 mx-auto mb-3">⏰</div>
            <p className="text-gray-500">
              No hay estrategias asignadas a este paciente
            </p>
          </div>
        )}
      </motion.div>

      {/* 🎯 Modal de Desasignación */}
      <AnimatePresence>
        {modal && (
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
              <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
                <h2 className="text-xl font-bold text-white">
                  Desasignar Estrategia
                </h2>
                <p className="text-red-100 text-sm mt-1">
                  {modal.estrategia}
                </p>
              </div>

              {/* Contenido */}
              <div className="p-6 space-y-4">
                {/* Estado */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Estado Final
                  </label>
                  <div className="space-y-2">
                    {["INACTIVO", "COMPLETADO"].map((estado) => (
                      <label
                        key={estado}
                        className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <input
                          type="radio"
                          name="estado"
                          value={estado}
                          checked={modal.nuevoEstado === estado}
                          onChange={(e) =>
                            setModal({ ...modal, nuevoEstado: e.target.value })
                          }
                          className="w-4 h-4"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{estado}</p>
                          <p className="text-xs text-gray-500">
                            {estado === "INACTIVO"
                              ? "Pausar - Puede reactivarse después"
                              : "Completada - No puede reactivarse"}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Observación */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Observación (opcional)
                  </label>
                  <textarea
                    value={observacion}
                    onChange={(e) => setObservacion(e.target.value)}
                    placeholder="Ej: Paciente completó el programa"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    rows="3"
                  />
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setModal(null);
                      setObservacion("");
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDesasignar}
                    disabled={desasignando}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    {desasignando ? (
                      <span className="animate-spin">⏳</span>
                    ) : (
                      <>🗑️</>
                    )}
                    Desasignar
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
