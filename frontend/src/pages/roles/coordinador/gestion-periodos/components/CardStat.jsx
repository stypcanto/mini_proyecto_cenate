// src/pages/coordinador/turnos/components/CardStat.jsx
import React from "react";

export default function CardStat({ title, value, subtitle, icon, tone = "blue" }) {
  const toneMap = {
    green: "bg-green-50 border-green-200 text-green-800",
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    orange: "bg-orange-50 border-orange-200 text-orange-800",
    purple: "bg-purple-50 border-purple-200 text-purple-800",
  };
  const cls = toneMap[tone] || toneMap.blue;

  return (
    <div className={`rounded-lg border p-2.5 ${cls}`}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-semibold">{title}</p>
        <div className="opacity-80">{icon}</div>
      </div>
      <p className="text-xl font-bold">{value ?? "—"}</p>
      <p className="text-[10px] mt-0.5 opacity-80">{subtitle ?? "—"}</p>
    </div>
  );
}
