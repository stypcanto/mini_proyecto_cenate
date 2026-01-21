// ========================================================================
// 🎠 CarrouselECGModal.jsx – Visualizador de Múltiples ECGs en Carrusel
// ✅ VERSIÓN 1.1.0 - CENATE 2026
// Especialmente diseñado para PADOMI (4-10 imágenes por paciente)
// v1.1.0: Carga dinámica de imágenes desde API
// ========================================================================

import React, { useState, useEffect, useCallback } from "react";
import {
  X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut,
  RotateCw, AlertCircle, Loader2
} from "lucide-react";
import teleecgService from "../../services/teleecgService";

/**
 * Carrusel de múltiples imágenes ECG con navegación
 * Props:
 * - imagenes: Array de objetos imagen
 * - paciente: { numDoc, nombres, apellidos }
 * - onClose: Callback al cerrar
 * - onDescargar: Callback para descargar
 */
export default function CarrouselECGModal({ imagenes, paciente, onClose, onDescargar }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  // v1.1.0: Estado para imágenes cargadas dinámicamente
  const [loadedImages, setLoadedImages] = useState({});
  const [loadingImage, setLoadingImage] = useState(false);
  const [imageError, setImageError] = useState(null);

  // v1.1.0: Cargar imagen actual desde API
  const cargarImagen = useCallback(async (index) => {
    const imagen = imagenes[index];
    if (!imagen) return;

    const idImagen = imagen.id_imagen || imagen.idImagen;

    // Si ya está cargada, no recargar
    if (loadedImages[idImagen]) return;

    setLoadingImage(true);
    setImageError(null);

    try {
      console.log(`📥 Cargando imagen ${idImagen}...`);
      const data = await teleecgService.verPreview(idImagen);

      setLoadedImages(prev => ({
        ...prev,
        [idImagen]: {
          contenidoImagen: data.contenidoImagen,
          tipoContenido: data.tipoContenido || 'image/jpeg'
        }
      }));
      console.log(`✅ Imagen ${idImagen} cargada`);
    } catch (error) {
      console.error(`❌ Error cargando imagen ${idImagen}:`, error);
      setImageError(`Error al cargar la imagen: ${error.message}`);
    } finally {
      setLoadingImage(false);
    }
  }, [imagenes, loadedImages]);

  // v1.1.0: Cargar imagen al cambiar de índice
  useEffect(() => {
    cargarImagen(currentIndex);
  }, [currentIndex, cargarImagen]);

  if (!imagenes || imagenes.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full p-6">
          <div className="flex items-center gap-3 text-yellow-700 mb-4">
            <AlertCircle className="w-6 h-6" />
            <p className="font-semibold">No hay imágenes disponibles</p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  const imagenActual = imagenes[currentIndex];
  const idImagenActual = imagenActual?.id_imagen || imagenActual?.idImagen;

  // v1.1.0: Obtener imagen cargada del estado
  const loadedImage = loadedImages[idImagenActual];
  const imageUrl = loadedImage?.contenidoImagen
    ? `data:${loadedImage.tipoContenido || 'image/jpeg'};base64,${loadedImage.contenidoImagen}`
    : null;

  const siguienteFoto = () => {
    setCurrentIndex((prev) => (prev + 1) % imagenes.length);
    resetZoom();
  };

  const fotoAnterior = () => {
    setCurrentIndex((prev) => (prev - 1 + imagenes.length) % imagenes.length);
    resetZoom();
  };

  const resetZoom = () => {
    setScale(1);
    setRotation(0);
  };

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.1, 3));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.1, 0.5));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleDateString("es-PE", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEstadoBadge = (estado) => {
    const estilos = {
      ENVIADA: "bg-blue-100 text-blue-800 border border-blue-300",
      OBSERVADA: "bg-purple-100 text-purple-800 border border-purple-300",
      RECHAZADA: "bg-red-100 text-red-800 border border-red-300",
      ATENDIDA: "bg-green-100 text-green-800 border border-green-300",
      PENDIENTE: "bg-yellow-100 text-yellow-800 border border-yellow-300"
    };
    return estilos[estado] || "bg-gray-100 text-gray-800 border border-gray-300";
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">
              ECGs de {paciente?.nombres} {paciente?.apellidos}
            </h2>
            <p className="text-blue-100 text-sm">
              DNI: {paciente?.numDoc} | Total: {imagenes.length} imágenes
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Contenido principal */}
        <div className="flex flex-1 overflow-hidden">
          {/* Área de la imagen */}
          <div className="flex-1 flex flex-col bg-gray-100">
            {/* Visor */}
            <div className="flex-1 flex items-center justify-center relative overflow-auto">
              {loadingImage ? (
                <div className="text-center text-gray-500">
                  <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                  <p>Cargando imagen...</p>
                </div>
              ) : imageError ? (
                <div className="text-center text-red-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                  <p>{imageError}</p>
                  <button
                    onClick={() => cargarImagen(currentIndex)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Reintentar
                  </button>
                </div>
              ) : imageUrl ? (
                <img
                  src={imageUrl}
                  alt={`ECG ${currentIndex + 1}`}
                  style={{
                    transform: `scale(${scale}) rotate(${rotation}deg)`,
                    transition: "transform 0.2s",
                  }}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="text-center text-gray-500">
                  <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                  <p>Cargando imagen...</p>
                </div>
              )}

              {/* Botones de navegación left/right */}
              {imagenes.length > 1 && (
                <>
                  <button
                    onClick={fotoAnterior}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={siguienteFoto}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Indicador de posición */}
              <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {currentIndex + 1} / {imagenes.length}
              </div>
            </div>

            {/* Toolbar de zoom/rotación */}
            <div className="bg-gray-200 border-t border-gray-300 p-3 flex items-center justify-center gap-2 flex-wrap">
              <button
                onClick={handleZoomOut}
                disabled={scale <= 0.5}
                className="p-2 hover:bg-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Reducir zoom"
              >
                <ZoomOut className="w-5 h-5 text-gray-700" />
              </button>

              <span className="text-sm font-medium text-gray-700 px-3">
                {Math.round(scale * 100)}%
              </span>

              <button
                onClick={handleZoomIn}
                disabled={scale >= 3}
                className="p-2 hover:bg-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Aumentar zoom"
              >
                <ZoomIn className="w-5 h-5 text-gray-700" />
              </button>

              <div className="w-px h-6 bg-gray-400"></div>

              <button
                onClick={handleRotate}
                className="p-2 hover:bg-white rounded-lg transition-colors"
                title="Rotar 90°"
              >
                <RotateCw className="w-5 h-5 text-gray-700" />
              </button>

              <button
                onClick={resetZoom}
                className="p-2 hover:bg-white rounded-lg transition-colors text-sm font-medium text-gray-700"
                title="Restaurar"
              >
                Restaurar
              </button>
            </div>
          </div>

          {/* Panel lateral: Thumbnails y detalles */}
          <div className="w-72 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
            {/* Thumbnails */}
            {imagenes.length > 1 && (
              <div className="p-3 border-b border-gray-200 overflow-y-auto max-h-40">
                <p className="text-xs font-semibold text-gray-600 mb-2">Imágenes</p>
                <div className="flex flex-wrap gap-2">
                  {imagenes.map((img, index) => {
                    const imgId = img?.id_imagen || img?.idImagen;
                    const loadedImg = loadedImages[imgId];
                    const thumbUrl = loadedImg?.contenidoImagen
                      ? `data:${loadedImg.tipoContenido || 'image/jpeg'};base64,${loadedImg.contenidoImagen}`
                      : null;

                    return (
                      <button
                        key={index}
                        onClick={() => {
                          setCurrentIndex(index);
                          resetZoom();
                        }}
                        className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                          currentIndex === index
                            ? "border-blue-600 ring-2 ring-blue-300"
                            : "border-gray-300 hover:border-blue-400"
                        }`}
                      >
                        {thumbUrl ? (
                          <img
                            src={thumbUrl}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                            {index + 1}
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white text-xs font-bold">
                          {index + 1}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Detalles de la imagen actual */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">Estado</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getEstadoBadge(imagenActual?.estadoTransformado || imagenActual?.estado)}`}>
                  {imagenActual?.estadoTransformado || imagenActual?.estado}
                </span>
              </div>

              {imagenActual?.observaciones && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1">💬 Observaciones</p>
                  <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded border border-gray-200">
                    {imagenActual.observaciones}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">Archivo</p>
                <p className="text-xs text-gray-700 truncate" title={imagenActual?.nombreArchivo}>
                  {imagenActual?.nombreArchivo || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">Tamaño</p>
                <p className="text-xs text-gray-700">
                  {imagenActual?.sizeBytes
                    ? (imagenActual.sizeBytes / 1024 / 1024).toFixed(2) + " MB"
                    : "N/A"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">Tipo</p>
                <p className="text-xs text-gray-700">{imagenActual?.mimeType || "N/A"}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">Enviado</p>
                <p className="text-xs text-gray-700">
                  {formatearFecha(imagenActual?.fechaEnvio)}
                </p>
              </div>

              {imagenActual?.fechaRecepcion && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1">Recibido</p>
                  <p className="text-xs text-gray-700">
                    {formatearFecha(imagenActual?.fechaRecepcion)}
                  </p>
                </div>
              )}

              {imagenActual?.fueSubsanado && (
                <div className="bg-green-50 border border-green-200 rounded p-2">
                  <p className="text-xs font-semibold text-green-700">✅ Subsanada</p>
                  <p className="text-xs text-green-600">Esta imagen fue reenvío de una anterior</p>
                </div>
              )}
            </div>

            {/* Botón descargar */}
            <div className="p-3 border-t border-gray-200">
              <button
                onClick={() => onDescargar?.(imagenActual)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
              >
                <Download className="w-4 h-4" />
                Descargar
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Imagen {currentIndex + 1} de {imagenes.length}
          </div>
          <div className="flex gap-2">
            {imagenes.length > 1 && (
              <>
                <button
                  onClick={fotoAnterior}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  ← Anterior
                </button>
                <button
                  onClick={siguienteFoto}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Siguiente →
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
