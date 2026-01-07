// ========================================================================
// 📋 ModalListadoAsegurados.jsx – Modal con Debugging
// ========================================================================

import React, { useEffect } from "react";
import { X, Users, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ModalListadoAsegurados({
  mostrar,
  cerrar,
  asegurados,
  loading,
  paginaActual,
  totalPaginas,
  totalElementos,
  onCambiarPagina,
}) {
  const navigate = useNavigate();

  // DEBUG: Ver qué datos están llegando
  useEffect(() => {
    if (asegurados && asegurados.length > 0) {
      console.log("📊 Datos recibidos en modal:", asegurados[0]);
      console.log("📊 Todas las keys:", Object.keys(asegurados[0]));
    }
  }, [asegurados]);

  if (!mostrar) return null;

  const irABuscarAsegurados = () => {
    cerrar();
    navigate("/asegurados/buscar");
  };

  const handleCambiarPagina = (nuevaPagina) => {
    console.log("🔄 Cambiando a página:", nuevaPagina);
    if (onCambiarPagina && typeof onCambiarPagina === 'function') {
      onCambiarPagina(nuevaPagina);
    } else {
      console.error("❌ onCambiarPagina no es una función:", onCambiarPagina);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Listado de Asegurados</h2>
              <p className="text-sm text-emerald-100">
                Total: {totalElementos?.toLocaleString() || 0} registros
              </p>
            </div>
          </div>
          <button
            onClick={cerrar}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* CONTENIDO - TABLA */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                <p className="text-slate-600">Cargando asegurados...</p>
              </div>
            </div>
          ) : asegurados && asegurados.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b-2 border-slate-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">#</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Nombre Completo</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Tipo Doc.</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">N° Documento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {asegurados.map((asegurado, index) => {
                    // DEBUG: Intentar múltiples variaciones de nombres de campos
                    const nombre = asegurado.paciente || asegurado.nomAsegurado || asegurado.nombreCompleto || asegurado.nombre || "Sin nombre";
                    const documento = asegurado.docPaciente || asegurado.numDocumento || asegurado.documento || asegurado.dni || "Sin documento";

                    return (
                      <tr
                        key={asegurado.pkAsegurado || asegurado.id || index}
                        className="hover:bg-emerald-50/50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {paginaActual * 25 + index + 1}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">
                          {nombre}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          DNI
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700 font-mono">
                          {documento}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">No hay asegurados para mostrar</p>
            </div>
          )}
        </div>

        {/* FOOTER - PAGINACIÓN Y BOTÓN */}
        <div className="bg-slate-50 px-6 py-4 rounded-b-2xl border-t border-slate-200">
          <div className="flex items-center justify-between">

            {/* Paginación */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCambiarPagina(paginaActual - 1)}
                disabled={paginaActual === 0}
                className="p-2 rounded-lg border border-slate-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-slate-700" />
              </button>

              <div className="px-4 py-2 bg-white rounded-lg border border-slate-300">
                <span className="text-sm font-medium text-slate-700">
                  Página {paginaActual + 1} de {totalPaginas}
                </span>
              </div>

              <button
                onClick={() => handleCambiarPagina(paginaActual + 1)}
                disabled={paginaActual >= totalPaginas - 1}
                className="p-2 rounded-lg border border-slate-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-slate-700" />
              </button>
            </div>

            {/* Botón Ver más información */}
            <button
              onClick={irABuscarAsegurados}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-md hover:shadow-lg"
            >
              <Eye className="w-5 h-5" />
              Más información
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
