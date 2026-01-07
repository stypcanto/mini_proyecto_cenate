// ========================================================================
// 🛡️ ProtectedButton.jsx – Botón protegido por permisos MBAC
// ------------------------------------------------------------------------
// Muestra u oculta botones según los permisos del usuario.
// Soporta diferentes modos: ocultar, deshabilitar, o mostrar tooltip.
// ========================================================================

import React from "react";
import { usePermisos } from "../../context/PermisosContext";
import { Lock } from "lucide-react";

/**
 * Botón protegido por permisos MBAC
 *
 * @param {string} ruta - Ruta de la página (ej: "/admin/users")
 * @param {string} accion - Acción requerida: "ver", "crear", "editar", "eliminar", "exportar", "aprobar"
 * @param {string} modo - Comportamiento cuando no tiene permiso: "ocultar" (default), "deshabilitar", "tooltip"
 * @param {string} mensajeDenegado - Mensaje personalizado cuando no tiene acceso
 * @param {React.ReactNode} children - Contenido del botón
 * @param {string} className - Clases CSS adicionales
 * @param {function} onClick - Handler del click
 * @param {object} props - Props adicionales del botón
 */
export const ProtectedButton = ({
  ruta,
  accion,
  modo = "ocultar",
  mensajeDenegado = "No tienes permiso para realizar esta acción",
  children,
  className = "",
  onClick,
  disabled = false,
  ...props
}) => {
  const { tienePermiso, loading, esSuperAdmin } = usePermisos();

  // Mientras carga, mostrar skeleton o nada
  if (loading) {
    if (modo === "ocultar") return null;
    return (
      <button
        className={`${className} opacity-50 cursor-wait`}
        disabled
        {...props}
      >
        {children}
      </button>
    );
  }

  // Verificar permiso
  const tieneAcceso = tienePermiso(ruta, accion);

  // Si no tiene permiso
  if (!tieneAcceso) {
    switch (modo) {
      case "ocultar":
        return null;

      case "deshabilitar":
        return (
          <button
            className={`${className} opacity-50 cursor-not-allowed`}
            disabled
            title={mensajeDenegado}
            {...props}
          >
            {children}
          </button>
        );

      case "tooltip":
        return (
          <div className="relative group inline-block">
            <button
              className={`${className} opacity-50 cursor-not-allowed`}
              disabled
              {...props}
            >
              <Lock className="w-4 h-4 mr-1 inline" />
              {children}
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              {mensajeDenegado}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        );

      default:
        return null;
    }
  }

  // Tiene permiso - renderizar botón normal
  return (
    <button
      className={className}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

/**
 * Wrapper para cualquier elemento que requiera permisos
 * Útil para proteger secciones completas
 */
export const ProtectedElement = ({
  ruta,
  accion,
  modo = "ocultar",
  fallback = null,
  children,
}) => {
  const { tienePermiso, loading } = usePermisos();

  if (loading) {
    return modo === "ocultar" ? null : fallback;
  }

  const tieneAcceso = tienePermiso(ruta, accion);

  if (!tieneAcceso) {
    return modo === "ocultar" ? null : fallback;
  }

  return <>{children}</>;
};

/**
 * Hook para obtener el estado de múltiples acciones
 * Útil cuando un componente necesita verificar varios permisos
 */
export const useAcciones = (ruta) => {
  const { obtenerPermisos, loading, esSuperAdmin } = usePermisos();
  const permisos = obtenerPermisos(ruta);

  return {
    loading,
    esSuperAdmin,
    puedeVer: permisos.puedeVer,
    puedeCrear: permisos.puedeCrear,
    puedeEditar: permisos.puedeEditar,
    puedeEliminar: permisos.puedeEliminar,
    puedeExportar: permisos.puedeExportar,
    puedeAprobar: permisos.puedeAprobar,
  };
};

export default ProtectedButton;
