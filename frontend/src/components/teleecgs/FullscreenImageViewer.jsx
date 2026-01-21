import React, { useRef } from "react";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import ImageCanvas from "./ImageCanvas";
import FilterControlsPanel from "./FilterControlsPanel";

/**
 * 🖥️ FULLSCREEN IMAGE VIEWER - v1.0.0 (2026-01-21)
 *
 * Visualización a pantalla completa de ECG con:
 * - Zoom ilimitado (50-500%)
 * - Rotación y filtros
 * - Pan/drag para navegación
 * - Cierre rápido con ESC o botón
 * - Sincronización de estado con modal original
 */
export default function FullscreenImageViewer({
  isOpen,
  imagenData,
  indiceImagen,
  totalImagenes,
  rotacion,
  filters,
  onClose,
  onRotate,
  onFilterChange,
  onResetFilters,
  onImageNavigation,
}) {
  const transformRef = useRef(null);
  const [showFilterControls, setShowFilterControls] = React.useState(false);

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  React.useEffect(() => {
    if (!isOpen) return;

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const getCurrentZoomPercentage = () => {
    if (!transformRef.current) return 100;
    const currentScale = transformRef.current.state?.scale || 1;
    return Math.round(currentScale * 100);
  };

  const handleZoomMas = () => {
    if (transformRef.current) {
      transformRef.current.zoomIn();
    }
  };

  const handleZoomMenos = () => {
    if (transformRef.current) {
      transformRef.current.zoomOut();
    }
  };

  const handleResetTransform = () => {
    if (transformRef.current) {
      transformRef.current.resetTransform();
    }
  };

  const handleResetAll = () => {
    handleResetTransform();
    onResetFilters();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold">🔍 Visualizador ECG - Pantalla Completa</h2>
          <span className="text-sm text-gray-400">
            Imagen {indiceImagen + 1} de {totalImagenes}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-800 rounded transition-colors"
          title="Cerrar (ESC)"
        >
          <X size={24} />
        </button>
      </div>

      {/* Contenido */}
      <div className="flex-1 flex items-center justify-center overflow-hidden bg-black">
        {imagenData ? (
          <TransformWrapper
            ref={transformRef}
            initialScale={1}
            minScale={0.5}
            maxScale={5}
            centerOnInit
            wheel={{ step: 0.1 }}
            doubleClick={{ mode: "reset" }}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <TransformComponent
                wrapperClass="w-full h-full flex items-center justify-center"
                contentClass="cursor-move"
              >
                <ImageCanvas
                  imageSrc={imagenData}
                  rotation={rotacion}
                  filters={filters}
                  onImageLoad={() => console.log("✅ ECG cargada en pantalla completa")}
                />
              </TransformComponent>
            )}
          </TransformWrapper>
        ) : (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {/* Footer con Controles */}
      <div className="bg-gray-900 text-white px-6 py-4 border-t border-gray-700">
        {/* Panel de filtros (si está activo) */}
        {showFilterControls && (
          <div className="mb-4 bg-gray-800 p-4 rounded-lg border border-gray-700">
            <FilterControlsPanel
              filters={filters}
              onFilterChange={onFilterChange}
              onReset={onResetFilters}
              onPresetSelect={(preset) => {
                // Aplicar preset (esto debería manejarse en el padre)
                console.log("Preset seleccionado:", preset);
              }}
            />
          </div>
        )}

        {/* Controles principales */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {/* Navegación de imágenes */}
          {totalImagenes > 1 && (
            <>
              <button
                onClick={() => onImageNavigation("anterior")}
                disabled={indiceImagen === 0}
                className="p-2 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                title="Imagen anterior"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="w-px h-6 bg-gray-600" />

              <button
                onClick={() => onImageNavigation("siguiente")}
                disabled={indiceImagen === totalImagenes - 1}
                className="p-2 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                title="Imagen siguiente"
              >
                <ChevronRight size={20} />
              </button>

              <div className="w-px h-6 bg-gray-600" />
            </>
          )}

          {/* Zoom controls */}
          <button
            onClick={handleZoomMenos}
            className="p-2 hover:bg-gray-800 rounded transition-colors"
            title="Zoom menos (-)"
          >
            <ZoomOut size={20} />
          </button>

          <span className="font-semibold min-w-16 text-center text-sm">
            {getCurrentZoomPercentage()}%
          </span>

          <button
            onClick={handleZoomMas}
            className="p-2 hover:bg-gray-800 rounded transition-colors"
            title="Zoom más (+)"
          >
            <ZoomIn size={20} />
          </button>

          <div className="w-px h-6 bg-gray-600" />

          {/* Rotación */}
          <button
            onClick={() => onRotate((rotacion + 90) % 360)}
            className="p-2 hover:bg-gray-800 rounded transition-colors"
            title="Rotar 90° (R)"
          >
            <RotateCw size={20} />
          </button>

          <div className="w-px h-6 bg-gray-600" />

          {/* Filtros */}
          <button
            onClick={() => setShowFilterControls(!showFilterControls)}
            className={`p-2 rounded transition-all relative ${
              showFilterControls
                ? "bg-amber-700 text-amber-100"
                : filters.invert ||
                    filters.contrast !== 100 ||
                    filters.brightness !== 100
                  ? "bg-amber-900 text-amber-300"
                  : "hover:bg-gray-800"
            }`}
            title="Alternar filtros (F)"
          >
            <Filter size={20} />
            {(filters.invert ||
              filters.contrast !== 100 ||
              filters.brightness !== 100) && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full"></span>
            )}
          </button>

          {/* Reset */}
          <button
            onClick={handleResetAll}
            className="p-2 hover:bg-gray-800 rounded transition-colors"
            title="Reset todo (0)"
          >
            <RefreshCw size={20} />
          </button>
        </div>

        {/* Atajos */}
        <p className="text-xs text-gray-500 mt-3 text-center">
          ⌨️ ESC=Cerrar • ←→=Imágenes • +/-=Zoom • R=Rotar • F=Filtros • 0=Reset
        </p>
      </div>
    </div>
  );
}
