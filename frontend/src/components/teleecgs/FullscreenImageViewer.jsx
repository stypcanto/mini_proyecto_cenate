import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import MillimeterRuler from './MillimeterRuler';
import FilterControlsPanel from './FilterControlsPanel';

/**
 * FullscreenImageViewer - Componente para visualizar imagen en pantalla completa
 * v11.0.0 - Layout profesional con header, imagen centrada, toolbar, panel lateral de filtros
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
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  if (!isOpen || !imagenData) return null;

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
      `
    };
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* ═════════════════════════════════════════ */}
      {/* HEADER */}
      {/* ═════════════════════════════════════════ */}
      <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-4">
          <span className="text-lg font-semibold">🫀 Visualizador EKG - Pantalla Completa</span>
          <span className="text-sm text-gray-400">Imagen {indiceImagen + 1} de {totalImagenes}</span>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* ═════════════════════════════════════════ */}
      {/* CONTENEDOR PRINCIPAL - Imagen + Regla */}
      {/* ═════════════════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-black">
        {/* Regla milimétrica */}
        <MillimeterRuler zoomLevel={zoomLevel} />

        {/* Imagen centrada */}
        <img
          src={imagenData}
          alt="ECG Fullscreen"
          className="max-w-[90%] max-h-[85%] object-contain"
          style={getImageStyle()}
        />
      </div>

      {/* ═════════════════════════════════════════ */}
      {/* TOOLBAR INFERIOR */}
      {/* ═════════════════════════════════════════ */}
      <div className="bg-gray-900 border-t border-gray-700 px-6 py-4 flex items-center justify-between">
        {/* Navegación izquierda */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onImageNavigation('anterior')}
            disabled={indiceImagen === 0}
            className="p-2 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors text-white"
            title="Imagen anterior"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="w-px h-6 bg-gray-700" />
          <button
            onClick={() => onImageNavigation('siguiente')}
            disabled={indiceImagen >= totalImagenes - 1}
            className="p-2 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors text-white"
            title="Siguiente imagen"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Herramientas centro */}
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-gray-800 rounded transition-colors text-white" title="Buscar">
            🔍
          </button>
          <span className="text-sm text-gray-400 min-w-[60px] text-center">{zoomLevel}%</span>
          <button className="p-2 hover:bg-gray-800 rounded transition-colors text-white" title="Zoom in">
            <ZoomIn size={18} />
          </button>
          <button className="p-2 hover:bg-gray-800 rounded transition-colors text-white" title="Zoom out">
            <ZoomOut size={18} />
          </button>
          <button
            onClick={() => onRotate((rotacion + 90) % 360)}
            className="p-2 hover:bg-gray-800 rounded transition-colors text-white"
            title="Rotar"
          >
            <RotateCcw size={18} />
          </button>
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className="p-2 hover:bg-gray-800 rounded transition-colors text-white"
            title="Filtros"
          >
            ⚙️
          </button>
          <button
            onClick={onResetFilters}
            className="p-2 hover:bg-gray-800 rounded transition-colors text-white"
            title="Reset"
          >
            🔄
          </button>
        </div>

        {/* Acciones derecha */}
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold transition-colors">
            ✓ Válida
          </button>
          <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold transition-colors">
            ✕ Rechazar
          </button>
        </div>
      </div>

      {/* ═════════════════════════════════════════ */}
      {/* PANEL LATERAL DE FILTROS - Desliza desde derecha */}
      {/* ═════════════════════════════════════════ */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-40 transform transition-transform duration-300 overflow-y-auto ${
          showFilterPanel ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header del panel */}
        <div className="bg-indigo-600 text-white p-4 flex items-center justify-between sticky top-0">
          <h3 className="font-bold">Filtros Avanzados</h3>
          <button
            onClick={() => setShowFilterPanel(false)}
            className="p-1 hover:bg-indigo-700 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido de filtros */}
        <div className="p-4">
          <FilterControlsPanel
            rotacion={rotacion}
            filters={filters}
            onRotationChange={onRotate}
            onFilterChange={onFilterChange}
            onResetFilters={onResetFilters}
            showRotation={true}
          />
        </div>
      </div>

      {/* Backdrop semi-transparente cuando panel está abierto */}
      {showFilterPanel && (
        <div
          className="fixed inset-0 bg-black/40 z-30 transition-opacity duration-300"
          onClick={() => setShowFilterPanel(false)}
        />
      )}
    </div>
  );
}
