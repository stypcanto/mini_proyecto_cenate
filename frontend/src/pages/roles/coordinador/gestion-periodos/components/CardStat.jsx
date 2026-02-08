// src/pages/coordinador/turnos/components/CardStat.jsx
import React from "react";

export default function CardStat({ title, value, subtitle, icon, tone = "blue", onClick, isActive = false }) {
  const toneMap = {
    blue: "bg-gradient-to-br from-[#0A5BA9] to-[#084a8a]",
    green: "bg-gradient-to-br from-emerald-500 to-emerald-700",
    orange: "bg-gradient-to-br from-orange-500 to-orange-700",
    purple: "bg-gradient-to-br from-purple-500 to-purple-700",
  };

  const bgGradient = toneMap[tone] || toneMap.blue;

  return (
    <button
      onClick={onClick}
      className={`rounded-lg p-4 transition-all cursor-pointer text-left text-white shadow-lg hover:shadow-xl hover:scale-105 ${bgGradient}`}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold">{title}</p>
        <div className="opacity-90">{icon}</div>
      </div>
      <p className="text-3xl font-bold">{value ?? "—"}</p>
      <p className="text-xs mt-1 opacity-90">{subtitle ?? "—"}</p>
    </button>
  );
}
