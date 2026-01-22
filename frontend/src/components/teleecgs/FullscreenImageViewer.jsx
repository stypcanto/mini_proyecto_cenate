import React, { useState, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw, Filter } from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import MillimeterRuler from './MillimeterRuler';
import FilterControlsPanel from './FilterControlsPanel';

/**
 * FullscreenImageViewer - Componente para visualizar imagen en pantalla completa
 * v12.0.0 - Zoom digital real (hasta 500%) + Filtros automáticos + Pan/Pinch
 *
 * Características:
 * - Zoom digital sin pérdida de calidad (1x - 5x / 100% - 500%)
 * - Rueda del ratón, pinch, doble clic para zoom
 * - Pan (arrastrar) para navegar imagen ampliada
 * - Panel de filtros automático cuando zoom > 100%
 * - Filtros en tiempo real: rotación, brightness, contrast, invert, flip
 * - Regla milimétrica que se actualiza con zoom
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
  const [userClosedPanel, setUserClosedPanel] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(1);
  const transformRef = useRef(null);

  if (!isOpen || !imagenData) return null;

  // Mostrar filtros automáticamente si zoom > 100% Y usuario no los cerró manualmente
  const autoShowFilters = currentZoom > 1 && !userClosedPanel;

  // Función para cerrar el panel manualmente
  const handleClosePanel = () => {
    setShowFilterPanel(false);
    setUserClosedPanel(true);
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
      {/* CONTENEDOR PRINCIPAL - Zoom digital + Imagen + Reglas Fijas */}
      {/* ═════════════════════════════════════════ */}
      <div className="flex-1 flex relative overflow-hidden bg-black">
        {/* REGLA LATERAL IZQUIERDA - Fija */}
        <div className="w-12 bg-gray-800 border-r border-gray-700 flex flex-col items-center py-2 overflow-y-auto">
          <div className="text-white text-xs font-bold mb-2">mm</div>
          {Array.from({ length: 100 }).map((_, i) => (
            <div
              key={`ruler-v-${i}`}
              className="w-full text-center text-xs text-gray-400"
              style={{
                height: `${Math.round(currentZoom * 25.4 / 2.54)}px`,
                borderBottom: i % 5 === 0 ? '2px solid #888' : '1px solid #444',
              }}
            >
              {i % 10 === 0 && <span className="text-[8px]">{i * 5}</span>}
            </div>
          ))}
        </div>

        {/* CONTENEDOR DE ZOOM - Con regla superior */}
        <div className="flex-1 flex flex-col relative">
          {/* REGLA SUPERIOR - Fija */}
          <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center px-2 overflow-x-auto">
            <div className="text-white text-xs font-bold mr-4">mm</div>
            <div className="flex">
              {Array.from({ length: 200 }).map((_, i) => (
                <div
                  key={`ruler-h-${i}`}
                  className="flex flex-col items-center justify-center text-xs text-gray-400"
                  style={{
                    width: `${Math.round(currentZoom * 25.4 / 2.54)}px`,
                    minWidth: `${Math.round(currentZoom * 25.4 / 2.54)}px`,
                    borderRight: i % 5 === 0 ? '2px solid #888' : '1px solid #444',
                    height: '100%',
                  }}
                >
                  {i % 10 === 0 && <span className="text-[8px]">{i * 5}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* ÁREA DE ZOOM */}
          <TransformWrapper
            ref={transformRef}
            initialScale={1}
            minScale={1}
            maxScale={5}
            centerOnInit={true}
            disabled={false}
            panning={{
              disabled: false,
              velocityDisabled: false,
            }}
            pinch={{
              disabled: false,
              step: 5,
            }}
            wheel={{
              step: 0.1,
              wheelEnabled: true,
              touchPadEnabled: true,
            }}
            doubleClick={{
              disabled: false,
              step: 0.7,
              mode: 'zoomIn',
            }}
            onTransformed={(instance) => {
              // Actualizar zoom actual para mostrar filtros automáticamente
              setCurrentZoom(instance.state.scale);
            }}
          >
            <TransformComponent
              wrapperClass="flex-1 flex items-center justify-center relative overflow-auto bg-black"
              contentClass="flex items-center justify-center"
            >
              {/* Imagen con filtros aplicados */}
              <img
                src={imagenData}
                alt="ECG Fullscreen"
                className="max-w-fit object-contain cursor-grab active:cursor-grabbing"
                style={getImageStyle()}
                draggable={false}
              />
            </TransformComponent>
          </TransformWrapper>
        </div>
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
          <span className="text-sm text-gray-400 min-w-[60px] text-center">{Math.round(currentZoom * 100)}%</span>
          <button
            onClick={() => transformRef.current?.zoomIn(0.5)}
            className="p-2 hover:bg-gray-800 rounded transition-colors text-white"
            title="Zoom in"
          >
            <ZoomIn size={18} />
          </button>
          <button
            onClick={() => transformRef.current?.zoomOut(0.5)}
            className="p-2 hover:bg-gray-800 rounded transition-colors text-white"
            title="Zoom out"
          >
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
            onClick={() => {
              setShowFilterPanel(!showFilterPanel);
              // Si el usuario abre manualmente, permitir cerrar y abrir libremente
              if (!showFilterPanel) {
                setUserClosedPanel(false);
              }
            }}
            className="p-2 hover:bg-gray-800 rounded transition-colors text-white"
            title="Filtros Avanzados"
          >
            <Filter size={18} />
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
      {/* Mostrar automáticamente si zoom > 100% o si se abre manualmente */}
      {/* ═════════════════════════════════════════ */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-40 transform transition-transform duration-300 overflow-y-auto ${
          showFilterPanel || autoShowFilters ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header del panel */}
        <div className="bg-indigo-600 text-white p-4 flex items-center justify-between sticky top-0 z-50">
          <h3 className="font-bold">
            Filtros Avanzados {autoShowFilters && <span className="text-sm opacity-75">(Zoom {Math.round(currentZoom * 100)}%)</span>}
          </h3>
          <button
            onClick={handleClosePanel}
            className="p-1 hover:bg-indigo-700 rounded transition-colors"
            title="Cerrar panel de filtros"
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

    </div>
  );
}
