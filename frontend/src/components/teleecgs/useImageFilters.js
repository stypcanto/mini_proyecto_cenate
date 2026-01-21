import { useState } from "react";

/**
 * 🎨 useImageFilters - Hook para Gestión de Filtros de Imagen
 *
 * Proporciona estado y funciones para manejar filtros ECG:
 * - Invertir colores
 * - Contraste ajustable (50-200%)
 * - Brillo ajustable (50-200%)
 *
 * Incluye presets médicos predefinidos para casos comunes.
 */
export const FILTER_PRESETS = {
  normal: {
    label: "Normal",
    invert: false,
    contrast: 100,
    brightness: 100,
  },
  highContrast: {
    label: "Alto Contraste",
    invert: false,
    contrast: 150,
    brightness: 110,
  },
  inverted: {
    label: "Invertido",
    invert: true,
    contrast: 100,
    brightness: 100,
  },
  invertedHighContrast: {
    label: "Invertido + Contraste",
    invert: true,
    contrast: 140,
    brightness: 105,
  },
};

export default function useImageFilters() {
  // Estado de filtros
  const [filters, setFilters] = useState({
    invert: false,
    contrast: 100,
    brightness: 100,
  });

  /**
   * Actualizar un filtro individual
   * @param {string} key - Clave del filtro ('invert', 'contrast', 'brightness')
   * @param {any} value - Nuevo valor
   */
  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  /**
   * Restablecer todos los filtros a valores por defecto
   */
  const resetFilters = () => {
    setFilters({
      invert: false,
      contrast: 100,
      brightness: 100,
    });
  };

  /**
   * Aplicar un preset predefinido
   * @param {string} presetKey - Clave del preset (ej: 'highContrast')
   */
  const applyPreset = (presetKey) => {
    const preset = FILTER_PRESETS[presetKey];
    if (preset) {
      const { label, ...filterValues } = preset;
      setFilters(filterValues);
    }
  };

  return {
    filters,
    updateFilter,
    resetFilters,
    applyPreset,
    presets: FILTER_PRESETS,
  };
}
