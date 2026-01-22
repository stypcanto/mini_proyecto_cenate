import React, { useState } from 'react';
import { X } from 'lucide-react';
import MillimeterRuler from './MillimeterRuler';
import FilterControlsPanel from './FilterControlsPanel';

/**
 * FullscreenImageViewer - Componente para visualizar imagen en pantalla completa
 * v10.0.0 - Con filtros en tiempo real sin desenfoque
 */
export default function FullscreenImageViewer({
  isOpen = false,
  imagenData = "",
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

  if (!isOpen || !imagenData) return null;

  const handleRotationChange = (nuevaRotacion) => {
    onRotate(nuevaRotacion);
  };

  const handleFilterChange = (key, value) => {
    onFilterChange(key, value);
  };

  // Calcular transformaciones CSS
  const getImageStyle = () => {
    const transforms = [];

    // Rotación
    if (rotacion) {
      transforms.push(`rotate(${rotacion}deg)`);
    }

    // Flip horizontal y vertical
    if (filters.flipHorizontal || filters.flipVertical) {
      const scaleX = filters.flipHorizontal ? -1 : 1;
      const scaleY = filters.flipVertical ? -1 : 1;
      transforms.push(`scale(${scaleX}, ${scaleY})`);
    }

    return {
      transform: transforms.length > 0 ? transforms.join(' ') : 'none',
      filter: `
        invert(${filters.invert ? 100 : 0}%)
        brightness(${filters.brightness || 100}%)
        contrast(${filters.contrast || 100}%)
      `,
      marginLeft: '60px',
      marginTop: '40px'
    };
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

      {/* Imagen a pantalla completa */}
      <img
        src={imagenData}
        alt="ECG Fullscreen"
        className="w-full h-full object-contain"
        style={getImageStyle()}
      />

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
