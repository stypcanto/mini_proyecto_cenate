// ========================================================================
// 👤 Profile.jsx – Perfil de Usuario (versión final CENATE 2025)
// ------------------------------------------------------------------------
// Contenido interno sin layout duplicado. Compatible con AppLayout global.
// Mantiene diseño Apple/macOS y tema improvements.css.
// ========================================================================

import React from "react";
import { User, Mail, Phone, ShieldCheck, CalendarDays } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-6 mb-10">
        <div
          className="w-24 h-24 rounded-full bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-info)]
                     flex items-center justify-center text-4xl font-bold text-white shadow-lg"
        >
          {user?.username?.charAt(0).toUpperCase() || "U"}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            {user?.nombre_completo || "Usuario CENATE"}
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">
            {user?.rol || "Administrador"}
          </p>
        </div>
      </div>

      {/* Datos principales */}
      <div
        className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]/80
                   shadow-sm backdrop-blur-sm p-8 space-y-6 transition-all hover:shadow-lg"
      >
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-[var(--color-primary)]" /> Información Personal
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[var(--text-primary)]">
          <InfoItem icon={Mail} label="Correo" value={user?.email || "No registrado"} />
          <InfoItem icon={Phone} label="Teléfono" value={user?.telefono || "—"} />
          <InfoItem icon={ShieldCheck} label="Rol" value={user?.rol || "Administrador"} />
          <InfoItem icon={CalendarDays} label="Fecha de Registro" value={user?.fecha_registro || "2025-01-01"} />
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-5 h-5 text-[var(--color-primary)] mt-1" />
      <div>
        <p className="text-sm text-[var(--text-secondary)]">{label}</p>
        <p className="text-base font-semibold text-[var(--text-primary)]">{value}</p>
      </div>
    </div>
  );
}