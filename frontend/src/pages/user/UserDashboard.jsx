// ========================================================================
// 🧭 UserDashboard.jsx – Panel Personal del Usuario (CENATE 2025)
// ------------------------------------------------------------------------
// Solo contenido interno (sin layout duplicado). Compatible con AppLayout.
// Diseñado con estética iOS/macOS y colores corporativos improvements.css.
// ========================================================================

import React from "react";
import { Activity, CalendarDays, Bell, Settings, Shield } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function UserDashboard() {
  const { user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Bienvenida */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          Bienvenido, {user?.nombre_completo?.split(" ")[0] || "Usuario"}
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Panel personal — Sistema CENATE
        </p>
      </div>

      {/* Tarjetas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <DashboardCard
          icon={Activity}
          title="Actividad Reciente"
          description="Revisa tus acciones recientes dentro del sistema."
          color="var(--color-primary)"
        />
        <DashboardCard
          icon={CalendarDays}
          title="Calendario"
          description="Consulta tus eventos o asignaciones programadas."
          color="var(--color-accent)"
        />
        <DashboardCard
          icon={Shield}
          title="Roles y Permisos"
          description="Verifica tus privilegios y accesos asignados."
          color="#8B5CF6"
        />
      </div>

      {/* Notificaciones */}
      <div
        className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]/80 shadow-sm p-6 backdrop-blur-sm"
      >
        <h2 className="text-xl font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-[var(--color-primary)]" />
          Notificaciones
        </h2>

        <ul className="space-y-4 text-[var(--text-primary)]">
          <li className="flex items-start gap-3">
            <Settings className="w-5 h-5 text-[var(--color-info)] mt-1" />
            <p>Tu contraseña fue actualizada correctamente.</p>
          </li>
          <li className="flex items-start gap-3">
            <CalendarDays className="w-5 h-5 text-[var(--color-accent)] mt-1" />
            <p>Tienes una reunión programada el <strong>21 de octubre</strong>.</p>
          </li>
        </ul>
      </div>
    </div>
  );
}

function DashboardCard({ icon: Icon, title, description, color }) {
  return (
    <div
      className="rounded-2xl p-6 border shadow-sm hover:shadow-lg transition-all duration-200
                 bg-[var(--bg-card)] border-[var(--border-color)] backdrop-blur-sm"
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}25` }}
        >
          <Icon size={22} style={{ color }} />
        </div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
      </div>
      <p className="text-[var(--text-secondary)] text-sm">{description}</p>
    </div>
  );
}