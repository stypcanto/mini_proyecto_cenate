// ========================================================================
// 🧾 InfoCard.jsx – Tarjeta de dato institucional (reutilizable)
// ========================================================================

import React from "react";

export default function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 border rounded-xl p-4 bg-[var(--bg-card)] shadow-sm hover:shadow-md transition-all">
      {Icon && <Icon className="w-5 h-5 text-[var(--color-primary)] mt-1" />}
      <div className="min-w-0">
        <p className="text-sm text-[var(--text-secondary)]">{label}</p>
        <p className="text-base font-semibold text-[var(--text-primary)] break-words">
          {value ?? "—"}
        </p>
      </div>
    </div>
  );
}