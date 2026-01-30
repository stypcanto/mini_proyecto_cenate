// ========================================================================
// 📑 TabContainer.jsx – Componente reutilizable de navegación por pestañas
// ========================================================================

import React from 'react';

/**
 * 📑 Contenedor de pestañas reutilizable
 *
 * @component
 * @param {Array} tabs - Array de objetos tab: { id, label, icon }
 * @param {String} activeTab - ID de la pestaña activa
 * @param {Function} onChange - Callback al cambiar de pestaña (recibe id)
 *
 * @example
 * const tabs = [
 *   { id: 'perfil', label: 'Perfil', icon: <User className="w-4 h-4" /> },
 *   { id: 'seguridad', label: 'Seguridad', icon: <Lock className="w-4 h-4" /> }
 * ];
 *
 * <TabContainer tabs={tabs} activeTab="perfil" onChange={setActiveTab} />
 */
export default function TabContainer({ tabs, activeTab, onChange }) {
  if (!tabs || tabs.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="flex gap-1 px-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-4 border-b-2 transition-all
              ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }
            `}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
          >
            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
