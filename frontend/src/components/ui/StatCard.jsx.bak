// ========================================================================
// 📊 StatCard.jsx - Tarjeta de estadísticas reutilizable
// ========================================================================

import React from "react";

export default function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  trend = null,
  color = "blue",
  onClick = null 
}) {
  const colorClasses = {
    blue: {
      bg: "from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20",
      border: "border-blue-100 dark:border-blue-800",
      iconBg: "bg-white dark:bg-blue-900/40",
      iconText: "text-blue-600 dark:text-blue-400",
      label: "text-blue-600 dark:text-blue-400",
      value: "text-slate-900 dark:text-white"
    },
    green: {
      bg: "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
      border: "border-green-100 dark:border-green-800",
      iconBg: "bg-white dark:bg-green-900/40",
      iconText: "text-green-600 dark:text-green-400",
      label: "text-green-600 dark:text-green-400",
      value: "text-slate-900 dark:text-white"
    },
    purple: {
      bg: "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
      border: "border-purple-100 dark:border-purple-800",
      iconBg: "bg-white dark:bg-purple-900/40",
      iconText: "text-purple-600 dark:text-purple-400",
      label: "text-purple-600 dark:text-purple-400",
      value: "text-slate-900 dark:text-white"
    },
    teal: {
      bg: "from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20",
      border: "border-teal-100 dark:border-teal-800",
      iconBg: "bg-white dark:bg-teal-900/40",
      iconText: "text-teal-600 dark:text-teal-400",
      label: "text-teal-600 dark:text-teal-400",
      value: "text-slate-900 dark:text-white"
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div 
      className={`
        bg-gradient-to-br ${colors.bg} rounded-2xl p-6 border ${colors.border}
        transition-all duration-200 hover:shadow-lg
        ${onClick ? 'cursor-pointer hover:scale-105' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-xl ${colors.iconBg} shadow-sm flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-7 h-7 ${colors.iconText}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${colors.label} uppercase tracking-wide`}>
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <p className={`text-3xl font-bold ${colors.value} truncate`}>
              {value}
            </p>
            {trend && (
              <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-2 py-0.5 rounded-full">
                {trend}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
