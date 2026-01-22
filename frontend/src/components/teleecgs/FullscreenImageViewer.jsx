import React, { useState, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import MillimeterRuler from './MillimeterRuler';
import ImageCanvas from './ImageCanvas';
import FilterControlsPanel from './FilterControlsPanel';

/**
 * FullscreenImageViewer - Componente para visualizar imagen en pantalla completa
 * v10.0.0 - Con filtros en tiempo real y navegación de imágenes
 */
export default function FullscreenImageViewer({
  isOpen = false,
  imagenData = null,
  indiceImagen = 0,
  totalImagenes = 0,
  rotacion = 0,
  filters = {},
  zoomLevel = 100,
  onClose = () => {},
  onRotate = () => {},
  onFilterChange = () => {},
  onResetFilters = () => {},
  onImageNavigation = () => {}
}) {
  const [showFilterControls, setShowFilterControls] = useState(false);
  const canvasRef = useRef(null);

  if (!isOpen || !imagenData) return null;

  const handleRotationChange = (nuevaRotacion) => {
    onRotate(nuevaRotacion);
  };

  const handleFilterChange = (key, value) => {
    onFilterChange(key, value);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center relative overflow-hidden">
      {/* ✅ v10.0.0: Regla milimétrica en fullscreen */}
      <MillimeterRuler zoomLevel={zoomLevel} />

      {/* Botón cerrar */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 bg-white text-black p-2 rounded-lg hover:bg-gray-200 z-20"
      >
        <X size={24} />
      </button>

      {/* Botón Filtros Avanzados - Esquina superior izquierda */}
      <button
        onClick={() => setShowFilterControls(!showFilterControls)}
        className="absolute top-4 left-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors z-20"
      >
        {showFilterControls ? '✕ Cerrar Filtros' : '⚙️ Filtros Avanzados'}
      </button>

      {/* Controles de navegación - Inferior */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 z-20 bg-black/70 px-6 py-3 rounded-lg">
        <button
          onClick={() => onImageNavigation('anterior')}
          disabled={indiceImagen === 0}
          className="p-2 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors text-white"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-white font-semibold min-w-[100px] text-center">
          {indiceImagen + 1} de {totalImagenes}
        </span>
        <button
          onClick={() => onImageNavigation('siguiente')}
          disabled={indiceImagen >= totalImagenes - 1}
          className="p-2 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors text-white"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Imagen a pantalla completa con canvas para aplicar filtros */}
      <div className="flex-1 overflow-hidden relative" style={{ marginLeft: '60px', marginTop: '40px' }}>
        <ImageCanvas
          ref={canvasRef}
          imagenData={imagenData}
          rotacion={rotacion}
          filters={filters}
          onRotacionChange={handleRotationChange}
        />
      </div>

      {/* Panel de Filtros Avanzados - Overlay transparente sin blur */}
      {showFilterControls && (
        <>
          {/* Backdrop transparente */}
          <div
            className="fixed inset-0 bg-transparent z-40 transition-opacity duration-300"
            onClick={() => setShowFilterControls(false)}
          />

          {/* Panel de controles */}
          <div className="absolute bottom-24 right-4 z-50 max-h-[calc(100vh-200px)] overflow-y-auto">
            <FilterControlsPanel
              rotacion={rotacion}
              filters={filters}
              onRotationChange={handleRotationChange}
              onFilterChange={handleFilterChange}
              onResetFilters={onResetFilters}
              showRotation={true}
            />
          </div>
        </>
      )}
    </div>
  );
}
