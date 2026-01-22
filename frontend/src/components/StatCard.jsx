import React from 'react';

/**
 * 📊 Componente Reutilizable: StatCard
 *
 * Tarjeta de estadística siguiendo Design System CENATE v1.0.0
 *
 * Props:
 * - label: string - Etiqueta de la estadística
 * - value: number - Valor a mostrar
 * - borderColor: string - Color del borde izquierdo (ej: "border-blue-500")
 * - textColor: string - Color del texto de valor (ej: "text-blue-600")
 * - icon: string - Emoji o ReactComponent
 *
 * Ejemplo:
 * <StatCard
 *   label="Total Pacientes"
 *   value={8}
 *   borderColor="border-blue-500"
 *   textColor="text-blue-600"
 *   icon="👥"
 * />
 */
export default function StatCard({
  label = "",
  value = 0,
  borderColor = "border-blue-500",
  textColor = "text-blue-600",
  icon = null
}) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-4 border-l-4 ${borderColor}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className={`text-3xl font-bold ${textColor} mt-1`}>{value}</p>
        </div>
        {icon && <div className={`text-2xl ${textColor} opacity-70`}>{icon}</div>}
      </div>
    </div>
  );
}
