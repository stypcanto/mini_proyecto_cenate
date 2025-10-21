// ========================================================================
// 🧩 AppLayout – Sistema MBAC CENATE
// ------------------------------------------------------------------------
// Estructura base del layout con Sidebar dinámico y control MBAC
// Incluye ActionToolbar y RowActions para gestión granular de permisos.
// ========================================================================

import React from 'react';
import DynamicSidebar from './DynamicSidebar';
import ThemeToggle from './ThemeToggle';
import { usePermissions } from '../hooks/usePermissions';
import { PermissionGate } from './security/PermissionGate'; // ✅ CORREGIDO
import { Plus, Download, Trash2, Edit, Check } from 'lucide-react';

/**
 * ===========================================================
 * 🧩 AppLayout – Estructura base con Sidebar y Main content
 * ===========================================================
 */
const AppLayout = ({ children, currentPath = null, title = null }) => {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden transition-colors">
      <DynamicSidebar />

      <main className="flex-1 overflow-y-auto">
        {title && (
          <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-8 py-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</h1>
            <ThemeToggle />
          </div>
        )}

        <div className="p-8 bg-slate-50 dark:bg-slate-900 min-h-full">{children}</div>
      </main>
    </div>
  );
};

/**
 * ===========================================================
 * 🎛️ ActionToolbar – Barra de acciones con control MBAC
 * ===========================================================
 */
export const ActionToolbar = ({
  currentPath,
  onCrear,
  onExportar,
  onAprobar,
  customActions = [],
}) => {
  const { tienePermiso } = usePermissions();

  const actions = [
    {
      action: 'crear',
      label: 'Crear Nuevo',
      icon: Plus,
      onClick: onCrear,
      className: 'bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600',
    },
    {
      action: 'exportar',
      label: 'Exportar',
      icon: Download,
      onClick: onExportar,
      className: 'bg-slate-600 text-white hover:bg-slate-700 dark:bg-slate-500 dark:hover:bg-slate-600',
    },
    {
      action: 'aprobar',
      label: 'Aprobar',
      icon: Check,
      onClick: onAprobar,
      className: 'bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600',
    },
    ...customActions,
  ];

  // Evitar render si el usuario no tiene permisos para ninguna acción
  const tieneAccionesVisibles = actions.some((a) =>
    tienePermiso(currentPath, a.action)
  );
  if (!tieneAccionesVisibles) return null;

  return (
    <div className="flex items-center gap-3 mb-6">
      {actions.map((actionConfig, index) => (
        <PermissionGate
          key={index}
          path={currentPath}
          action={actionConfig.action}
        >
          <button
            onClick={actionConfig.onClick}
            className={`
              inline-flex items-center gap-2 px-4 py-2.5 rounded-xl
              font-semibold text-sm transition-all duration-200
              transform hover:scale-105 shadow-lg hover:shadow-xl
              ${actionConfig.className}
            `}
          >
            {actionConfig.icon && <actionConfig.icon className="w-4 h-4" />}
            {actionConfig.label}
          </button>
        </PermissionGate>
      ))}
    </div>
  );
};

/**
 * ===========================================================
 * 🧱 RowActions – Acciones por fila (editar / eliminar)
 * ===========================================================
 */
export const RowActions = ({ currentPath, onEdit, onDelete, item }) => {
  return (
    <div className="flex items-center gap-2">
      <PermissionGate path={currentPath} action="editar">
        <button
          onClick={() => onEdit(item)}
          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          title="Editar"
        >
          <Edit className="w-4 h-4" />
        </button>
      </PermissionGate>

      <PermissionGate path={currentPath} action="eliminar">
        <button
          onClick={() => onDelete(item)}
          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          title="Eliminar"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </PermissionGate>
    </div>
  );
};

export default AppLayout;