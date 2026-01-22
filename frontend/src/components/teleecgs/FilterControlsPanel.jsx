import React, { useState, useCallback } from "react";
import { RefreshCw, FlipHorizontal, FlipVertical } from "lucide-react";
import { FILTER_PRESETS } from "./useImageFilters";

/**
 * 🎛️ FilterControlsPanel - Panel de Control de Filtros EKG
 *
 * Componente colapsable que proporciona interfaz para:
 * - Checkbox de inversión de colores
 * - Sliders para contraste y brillo
 * - Botones de presets médicos
 * - Botón de reset
 *
 * @param {Object} props
 * @param {Object} props.filters - Estado actual de filtros
 * @param {Function} props.onFilterChange - Callback al cambiar filtro (key, value)
 * @param {Function} props.onReset - Callback para reset
 * @param {Function} props.onPresetSelect - Callback al seleccionar preset (presetKey)
 */
export default function FilterControlsPanel({
  filters = {},
  onFilterChange = () => {},
  onReset = () => {},
  onPresetSelect = () => {},
}) {
  const [debounceTimers, setDebounceTimers] = useState({});

  const {
    invert = false,
    contrast = 100,
    brightness = 100,
    flipHorizontal = false,
    flipVertical = false,
  } = filters;

  /**
   * Debounce sliders para evitar re-renders excesivos
   */
  const debouncedFilterChange = useCallback(
    (key, value) => {
      // Limpiar timer anterior
      if (debounceTimers[key]) {
        clearTimeout(debounceTimers[key]);
      }

      // Crear nuevo timer
      const timer = setTimeout(() => {
        onFilterChange(key, value);
      }, 50);

      setDebounceTimers((prev) => ({
        ...prev,
        [key]: timer,
      }));

      // Actualización inmediata en UI (sin debounce)
      // para que el slider se vea responsivo
    },
    [debounceTimers, onFilterChange]
  );

  const handleSliderChange = (key, value) => {
    // Validar rangos
    let validValue = value;
    if (key === "contrast" || key === "brightness") {
      validValue = Math.max(50, Math.min(200, value));
    }
    debouncedFilterChange(key, validValue);
  };

  return (
    <div className="mt-3 pt-3 border-t border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-indigo-800 uppercase tracking-wider">🎨 Filtros de Imagen</h3>
        <button
          onClick={onReset}
          className="text-xs px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-1 font-semibold shadow-sm hover:shadow-md"
          title="Restablecer filtros"
        >
          <RefreshCw size={13} /> Reset
        </button>
      </div>

      {/* CHECKBOX: Invertir colores */}
      <label className="flex items-center gap-2 cursor-pointer text-xs bg-white px-3 py-2 rounded-lg border border-indigo-200 hover:border-indigo-400 transition-colors">
        <input
          type="checkbox"
          checked={invert}
          onChange={(e) => onFilterChange("invert", e.target.checked)}
          className="w-4 h-4 cursor-pointer accent-indigo-600 rounded"
        />
        <span className="text-gray-700 font-medium">Invertir (blanco ↔ negro)</span>
      </label>

      {/* SLIDER: Contraste */}
      <div className="space-y-2 bg-white px-3 py-3 rounded-lg border border-indigo-200">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-800">📊 Contraste</label>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{contrast}%</span>
        </div>
        <input
          type="range"
          min="50"
          max="200"
          value={contrast}
          onChange={(e) => handleSliderChange("contrast", parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
          title="Ajusta contraste (50-200%)"
        />
      </div>

      {/* SLIDER: Brillo */}
      <div className="space-y-2 bg-white px-3 py-3 rounded-lg border border-indigo-200">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-800">☀️ Brillo</label>
          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">{brightness}%</span>
        </div>
        <input
          type="range"
          min="50"
          max="200"
          value={brightness}
          onChange={(e) => handleSliderChange("brightness", parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-amber-500"
          title="Ajusta brillo (50-200%)"
        />
      </div>

      {/* BUTTONS: Flip Horizontal/Vertical */}
      <div className="space-y-2 bg-white px-3 py-3 rounded-lg border border-indigo-200">
        <p className="text-xs font-bold text-gray-800 uppercase tracking-wider">🔄 Orientación</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onFilterChange("flipHorizontal", !flipHorizontal)}
            className={`px-3 py-2 text-xs font-semibold rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
              flipHorizontal
                ? "bg-blue-100 border-blue-500 text-blue-800 shadow-md"
                : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
            title="Voltear horizontalmente (espejo izquierda-derecha)"
          >
            <FlipHorizontal size={16} />
            Horizontal
          </button>

          <button
            onClick={() => onFilterChange("flipVertical", !flipVertical)}
            className={`px-3 py-2 text-xs font-semibold rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
              flipVertical
                ? "bg-blue-100 border-blue-500 text-blue-800 shadow-md"
                : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
            title="Voltear verticalmente (de cabeza)"
          >
            <FlipVertical size={16} />
            Vertical
          </button>
        </div>
      </div>

      {/* PRESETS - Diseño mejorado */}
      <div className="space-y-2 bg-white px-3 py-3 rounded-lg border border-indigo-200">
        <p className="text-xs font-bold text-gray-800 uppercase tracking-wider">⚡ Preajustes Médicos</p>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(FILTER_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => onPresetSelect(key)}
              className="px-2.5 py-2 text-xs font-semibold bg-gradient-to-r from-indigo-100 to-purple-100 border-2 border-indigo-300 rounded-lg hover:from-indigo-200 hover:to-purple-200 hover:border-indigo-500 transition-all text-indigo-800 shadow-sm hover:shadow-md"
              title={`Aplicar: ${preset.label}`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
