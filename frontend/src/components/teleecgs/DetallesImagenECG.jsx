// ========================================================================
// 📊 DetallesImagenECG.jsx – Modal de Detalles y Acciones
// ✅ VERSIÓN 1.0.0 - CENATE 2026
// ========================================================================

import React, { useState } from "react";
import {
  X, CheckCircle, XCircle, Link2, Download, Eye,
  Loader, AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";
import teleekgService from "../../services/teleekgService";

export default function DetallesImagenECG({ imagen, onClose, onSuccess }) {
  const [accion, setAccion] = useState(null); // null, 'procesar', 'rechazar', 'vincular'
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleDescargar = async () => {
    try {
      toast.loading("Descargando...");
      await teleekgService.descargarImagen(imagen.idImagen);
      toast.dismiss();
      toast.success("Descargado correctamente");
    } catch (error) {
      toast.error("Error al descargar");
    }
  };

  const handleProcesar = async () => {
    if (!accion) return;

    try {
      setLoading(true);

      let payload = {
        accion: accion.toUpperCase(),
        observaciones: motivo
      };

      if (accion === "rechazar") {
        payload.motivoRechazo = motivo;
      }

      await teleekgService.procesarImagen(imagen.idImagen, payload);
      toast.success(`ECG ${accion} correctamente`);
      onSuccess?.();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al procesar ECG");
    } finally {
      setLoading(false);
    }
  };

  const renderFormAccion = () => {
    switch (accion) {
      case "procesar":
        return (
          <div className="space-y-4">
            <p className="text-gray-600">¿Aceptar este ECG como válido?</p>
            <div className="flex gap-3">
              <button
                onClick={handleProcesar}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Confirmar Aceptación
              </button>
              <button
                onClick={() => setAccion(null)}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        );

      case "rechazar":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo del Rechazo *
              </label>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Especifica el motivo del rechazo..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                rows="3"
                disabled={loading}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleProcesar}
                disabled={!motivo.trim() || loading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Rechazar ECG
              </button>
              <button
                onClick={() => {
                  setAccion(null);
                  setMotivo("");
                }}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        );

      case "vincular":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                DNI del Asegurado a Vincular *
              </label>
              <input
                type="text"
                maxLength="8"
                placeholder="12345678"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                disabled={loading}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleProcesar}
                disabled={loading}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                Vincular Asegurado
              </button>
              <button
                onClick={() => setAccion(null)}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Detalles del ECG</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {/* Información Principal */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">DNI del Paciente</p>
              <p className="text-lg font-semibold text-gray-900 font-mono">{imagen.numDocPaciente}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Estado</p>
              {/* v3.0.0: Mostrar estado transformado si está disponible */}
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                {imagen.estadoTransformado || imagen.estado}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Nombres</p>
              <p className="font-medium text-gray-900">{imagen.nombresPaciente}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Apellidos</p>
              <p className="font-medium text-gray-900">{imagen.apellidosPaciente}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tamaño</p>
              <p className="font-medium text-gray-900">{(imagen.tamanioBytes / 1024 / 1024).toFixed(2)}MB</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Vigencia</p>
              <p className={`font-medium ${
                imagen.vigencia === "VENCIDA"
                  ? "text-red-600"
                  : imagen.vigencia === "PRÓX_A_VENCER"
                  ? "text-yellow-600"
                  : "text-green-600"
              }`}>
                {imagen.vigencia} ({imagen.diasRestantes}d)
              </p>
            </div>
          </div>

          {/* Línea separadora */}
          <div className="border-t border-gray-200" />

          {/* Fechas y Detalles */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 mb-1">Fecha de Envío</p>
              <p className="font-medium">
                {new Date(imagen.fechaEnvio).toLocaleString("es-PE")}
              </p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Fecha de Expiración</p>
              <p className="font-medium">
                {new Date(imagen.fechaExpiracion).toLocaleString("es-PE")}
              </p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">IPRESS Origen</p>
              <p className="font-medium">{imagen.nombreIpress}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Tipo de Contenido</p>
              <p className="font-medium">{imagen.tipoContenido}</p>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="border-t border-gray-200 pt-6">
            {accion ? (
              renderFormAccion()
            ) : (
              <div className="space-y-3">
                <button
                  onClick={handleDescargar}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
                >
                  <Download className="w-4 h-4" />
                  Descargar Imagen
                </button>

                {/* v3.0.0: Verificar PENDIENTE y ENVIADA para backward compatibility */}
                {(imagen.estadoTransformado === "PENDIENTE" || imagen.estado === "PENDIENTE" || imagen.estado === "ENVIADA") && (
                  <>
                    <button
                      onClick={() => setAccion("procesar")}
                      className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Aceptar ECG
                    </button>
                    <button
                      onClick={() => setAccion("rechazar")}
                      className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition"
                    >
                      <XCircle className="w-4 h-4" />
                      Rechazar ECG
                    </button>
                  </>
                )}

                <button
                  onClick={onClose}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition"
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
