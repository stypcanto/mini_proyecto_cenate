// ========================================================================
// Design System - CENATE v1.52.3
// Sistema unificado de colores, estilos y componentes
// ========================================================================

export const COLORS = {
  // Estados de EKG (deben coincidir entre stats y badges)
  estados: {
    TODOS: {
      bg: 'bg-blue-50',
      bgGradient: 'bg-gradient-to-r from-blue-50 to-blue-100',
      border: 'border-blue-200',
      text: 'text-blue-900',
      badge: 'bg-blue-600 text-white',
      badgeBg: 'bg-blue-100',
      badgeText: 'text-blue-800',
    },
    ENVIADA: {
      bg: 'bg-yellow-50',
      bgGradient: 'bg-gradient-to-r from-yellow-50 to-yellow-100',
      border: 'border-yellow-200',
      text: 'text-yellow-900',
      badge: 'bg-yellow-600 text-white',
      badgeBg: 'bg-yellow-100',
      badgeText: 'text-yellow-800',
    },
    OBSERVADA: {
      bg: 'bg-orange-50',
      bgGradient: 'bg-gradient-to-r from-orange-50 to-orange-100',
      border: 'border-orange-200',
      text: 'text-orange-900',
      badge: 'bg-orange-600 text-white',
      badgeBg: 'bg-orange-100',
      badgeText: 'text-orange-800',
    },
    ATENDIDA: {
      bg: 'bg-green-50',
      bgGradient: 'bg-gradient-to-r from-green-50 to-green-100',
      border: 'border-green-200',
      text: 'text-green-900',
      badge: 'bg-green-600 text-white',
      badgeBg: 'bg-green-100',
      badgeText: 'text-green-800',
    },
  },

  // Botones primarios/secundarios
  buttons: {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-slate-200 hover:bg-slate-300 text-slate-800',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    outline: 'bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
  },
};

export const STYLES = {
  // Bordes redondeados consistentes
  rounded: {
    sm: 'rounded',        // 4px
    md: 'rounded-lg',     // 8px
    lg: 'rounded-xl',     // 12px
    full: 'rounded-full', // Círculo/píldora
  },

  // Sombras consistentes
  shadow: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
  },

  // Transiciones estándar
  transition: 'transition-all duration-200',
};

// Helper: Obtener estilos de estado
export const getEstadoClasses = (estado) => {
  return COLORS.estados[estado] || COLORS.estados.TODOS;
};
