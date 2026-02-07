// ========================================================================
// Design System - CENATE v1.55.0
// Sistema unificado de colores, estilos y componentes (Paleta Médica Profesional)
// ========================================================================

// 🏥 PALETA MÉDICA PROFESIONAL
export const MEDICAL_PALETTE = {
  // Fondos: Blanco hueso (reduce deslumbramiento ocular)
  backgrounds: {
    primary: '#f9f8f6',      // Blanco hueso - fondo principal
    secondary: '#f5f3f0',    // Gris muy claro - backgrounds secundarios
    neutral: '#ffffff',      // Blanco puro - componentes
  },

  // Acciones principales: Azul médico (confianza)
  primary: {
    main: '#2c5282',         // Azul médico oscuro - botones, links
    hover: '#1e3a5f',        // Más oscuro al hover
    light: '#e8f1fd',        // Muy claro para backgrounds
    medium: '#0369a1',       // Azul medio para variantes
  },

  // Estados clínicos
  states: {
    success: '#059669',      // Verde médico (éxito, enviado)
    warning: '#d97706',      // Ámbar médico (precaución, observación)
    error: '#dc2626',        // Rojo médico (error, crítico)
    info: '#0369a1',         // Azul claro (información)
    pending: '#f59e0b',      // Ámbar para pendiente
  },

  // Texto: Contraste máximo (accesibilidad)
  text: {
    primary: '#1f2937',      // Gris oscuro (body text)
    secondary: '#6b7280',    // Gris medio (labels, descriptions)
    light: '#9ca3af',        // Gris claro (hints, disabled)
    white: '#ffffff',        // Blanco puro
  },

  // Bordes: Sutiles pero visibles
  borders: {
    light: '#e5e7eb',        // Gris muy claro
    medium: '#d1d5db',       // Gris medio
    focus: '#2c5282',        // Azul médico (focus states)
  },
};

export const COLORS = {
  // Paleta médica principal
  medical: MEDICAL_PALETTE,

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
      bg: 'bg-green-50',
      bgGradient: 'bg-gradient-to-r from-green-50 to-emerald-50',
      border: 'border-green-300',
      text: 'text-green-900',
      badge: 'bg-green-600 text-white',
      badgeBg: 'bg-green-100',
      badgeText: 'text-green-800',
    },
    OBSERVADA: {
      bg: 'bg-amber-50',
      bgGradient: 'bg-gradient-to-r from-amber-50 to-orange-50',
      border: 'border-amber-300',
      text: 'text-amber-900',
      badge: 'bg-amber-600 text-white',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-800',
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

  // Botones - Estilos médicos
  buttons: {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    outline: 'bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
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

  // Sombras médicas - sutiles pero profesionales
  shadow: {
    sm: 'shadow-sm',      // 0 1px 2px
    md: 'shadow-md',      // 0 4px 12px
    lg: 'shadow-lg',      // 0 8px 24px
    medical: 'shadow-md',  // Defecto médico
    'medical-lg': '0 8px 24px rgba(44, 82, 130, 0.15)',
  },

  // Transiciones estándar
  transition: 'transition-all duration-200',
  'transition-smooth': 'transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)',

  // Estados de interacción
  hover: {
    scale: 'hover:scale-105 hover:shadow-lg',
    lift: 'hover:shadow-lg hover:translate-y-[-2px]',
    highlight: 'hover:bg-opacity-80',
  },

  // Focados accesibles
  focus: 'focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2',
  'focus-medical': 'focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent',
};

// Helper: Obtener estilos de estado
export const getEstadoClasses = (estado) => {
  return COLORS.estados[estado] || COLORS.estados.TODOS;
};

// Helper: Colores médicos
export const getMedicalColor = (type) => {
  return MEDICAL_PALETTE[type] || MEDICAL_PALETTE.primary.main;
};
