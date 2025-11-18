// ========================================================================
// 📋 PageHeader.jsx - Componente reutilizable para encabezados de página
// ========================================================================

import React from "react";

export default function PageHeader({ 
  icon: Icon, 
  title, 
  subtitle, 
  actions = null,
  gradient = "from-teal-500 to-cyan-600" 
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {Icon && (
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-xl shadow-teal-500/20`}>
              <Icon className="w-7 h-7 text-white" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-base text-slate-600 dark:text-slate-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
