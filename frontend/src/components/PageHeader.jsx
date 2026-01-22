import React from 'react';
import { Plus } from 'lucide-react';

/**
 * 📋 Componente Reutilizable: PageHeader
 *
 * Header estándar para todas las páginas siguiendo Design System CENATE v1.0.0
 *
 * Props:
 * - badge: objeto {icon: ReactComponent, label: string, bgColor: string}
 * - title: string - Título principal de la página
 * - primaryAction: objeto {label: string, onClick: function} - Botón principal
 * - subtitle: string (opcional)
 *
 * Ejemplo:
 * <PageHeader
 *   badge={{ label: "Recepción de Bolsa", bgColor: "bg-blue-100 text-blue-700" }}
 *   title="Solicitudes"
 *   primaryAction={{ label: "Agregar Paciente", onClick: () => {} }}
 * />
 */
export default function PageHeader({
  badge = {},
  title = "",
  primaryAction = null,
  subtitle = null
}) {
  const { label: badgeLabel, bgColor: badgeBgColor, icon: BadgeIcon } = badge;

  return (
    <div className="mb-6">
      {/* Header con título y botón principal */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {badgeLabel && (
            <div className={`${badgeBgColor || 'bg-blue-100 text-blue-700'} px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-2`}>
              {BadgeIcon && <BadgeIcon size={16} />}
              {badgeLabel}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
            {subtitle && <p className="text-gray-600 text-sm mt-1">{subtitle}</p>}
          </div>
        </div>

        {primaryAction && (
          <button
            onClick={primaryAction.onClick}
            className="flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
          >
            <Plus size={24} className="font-bold" />
            {primaryAction.label}
          </button>
        )}
      </div>
    </div>
  );
}
