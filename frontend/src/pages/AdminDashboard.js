// ========================================================================
// 🧠 AdminDashboard.jsx – Versión final CENATE 2025
// ------------------------------------------------------------------------
// Renderizado dentro del AppLayout global (no lo incluye directamente).
// Mantiene diseño Apple/macOS, tema improvements.css y estructura MBAC.
// ========================================================================

import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Shield,
  Activity,
  FileText,
  Bell,
  CheckCircle2,
  Clock,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 📊 Tarjetas de estadísticas
  const stats = [
    { icon: Users, label: "Usuarios", value: "245", trend: "+12%", color: "blue" },
    { icon: Shield, label: "Roles", value: "8", trend: "+2", color: "purple" },
    { icon: Activity, label: "Permisos", value: "42", trend: "+5", color: "green" },
    { icon: FileText, label: "Auditorías", value: "1.2K", trend: "+234", color: "orange" },
  ];

  // ⚡ Acciones rápidas
  const quickActions = [
    { icon: Users, label: "Gestionar Usuarios", color: "blue", path: "/admin/users" },
    { icon: Shield, label: "Configurar Roles", color: "purple", path: "/admin/roles" },
    { icon: Activity, label: "Ver Permisos", color: "green", path: "/admin/permisos" },
    { icon: FileText, label: "Auditoría", color: "orange", path: "/admin/auditoria" },
  ];

  // 🕒 Actividad reciente
  const recentActivity = [
    { action: "Nuevo usuario registrado", time: "Hace 5 min", icon: Users },
    { action: "Rol actualizado", time: "Hace 1 hora", icon: Shield },
    { action: "Configuración modificada", time: "Hace 2 horas", icon: Activity },
  ];

  // ============================================================
  // 🧱 Render principal (sin AppLayout interno)
  // ============================================================
  return (
    <div className="p-8 bg-[var(--bg-main)] transition-colors min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Bienvenido, {user?.nombreCompleto || user?.username || "Usuario"}
          </h1>
          <p className="text-base text-[var(--text-secondary)] mt-1">
            Panel de Administración — CENATE
          </p>
        </div>

        <button
          type="button"
          className="relative p-3 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-hover)]
                     transition-colors shadow-sm border border-[var(--border-color)]"
        >
          <Bell size={20} className="text-[var(--text-secondary)]" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--color-danger)] rounded-full ring-2 ring-[var(--bg-card)]" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          const color = {
            blue: "var(--color-primary)",
            purple: "#8B5CF6",
            green: "var(--color-accent)",
            orange: "#F59E0B",
          }[stat.color];

          return (
            <div
              key={idx}
              className="rounded-2xl p-6 border border-[var(--border-color)] shadow-sm bg-[var(--bg-card)] hover-lift transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <Icon size={24} style={{ color }} />
                </div>
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full border"
                  style={{
                    color: "var(--color-accent)",
                    backgroundColor: "rgba(67,160,71,0.1)",
                    borderColor: "rgba(67,160,71,0.3)",
                  }}
                >
                  {stat.trend}
                </span>
              </div>
              <p className="text-2xl font-bold text-[var(--text-primary)] mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-[var(--text-secondary)]">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Acciones rápidas y actividad */}
        <div className="lg:col-span-2 space-y-6">
          {/* Acciones rápidas */}
          <div className="rounded-2xl p-6 border border-[var(--border-color)] shadow-sm bg-[var(--bg-card)]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                <TrendingUp size={20} className="text-[var(--color-primary)]" />
                Acciones Rápidas
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, idx) => {
                const Icon = action.icon;
                const gradient = {
                  blue: "from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200",
                  purple: "from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200",
                  green: "from-green-50 to-green-100 hover:from-green-100 hover:to-green-200",
                  orange: "from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200",
                }[action.color];

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => action.path && navigate(action.path)}
                    className={`group p-5 rounded-xl bg-gradient-to-br ${gradient} transition-all hover:scale-105 text-left shadow-sm`}
                  >
                    <Icon
                      size={24}
                      className="mb-3 text-gray-700 group-hover:scale-110 transition-transform"
                    />
                    <p className="text-sm font-semibold text-gray-900">
                      {action.label}
                    </p>
                    <ChevronRight
                      size={16}
                      className="mt-2 text-gray-400 group-hover:text-gray-600 transition-colors"
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actividad reciente */}
          <div className="rounded-2xl p-6 border border-[var(--border-color)] shadow-sm bg-[var(--bg-card)]">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Clock size={20} className="text-[var(--color-primary)]" />
              Actividad Reciente
            </h3>
            <div className="space-y-4">
              {recentActivity.map((activity, idx) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-[var(--bg-hover)] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center">
                      <Icon size={18} className="text-[var(--color-primary)]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {activity.action}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1 mt-1">
                        <Clock size={12} />
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Estado del sistema */}
        <div className="space-y-6">
          <div className="rounded-2xl p-6 border border-[var(--border-color)] shadow-sm bg-[var(--bg-card)]">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">
              Estado del Sistema
            </h3>
            <div className="space-y-3">
              {[
                { label: "Autenticación", status: "Operativo" },
                { label: "Base de Datos", status: "Operativo" },
                { label: "API Rest", status: "Operativo" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-[var(--color-accent)]" />
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Info card */}
          <div className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-info)] rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold mb-1">Todo funcionando</h4>
                <p className="text-sm text-white/80">
                  Sistema operativo correctamente
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}