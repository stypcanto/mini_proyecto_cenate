// ========================================================================
// 🧠 AdminDashboard.jsx – Versión final CENATE 2025 (UI profesional)
// ------------------------------------------------------------------------
// • Colores institucionales EsSalud/CENATE con degradados suaves
// • Contadores visibles en las acciones rápidas
// • Inspirado en interfaz Apple/macOS con efectos de luz y sombra
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

  // 📊 Estadísticas generales
  const stats = [
    { icon: Users, label: "Usuarios", value: "245", trend: "+12%", color: "#0A5BA9" },
    { icon: Shield, label: "Roles", value: "8", trend: "+2", color: "#7C3AED" },
    { icon: Activity, label: "Permisos", value: "42", trend: "+5", color: "#2B844E" },
    { icon: FileText, label: "Auditorías", value: "1.2K", trend: "+234", color: "#F59E0B" },
  ];

  // ⚡ Acciones rápidas
  const quickActions = [
    { icon: Users, label: "Gestionar Usuarios", color: "blue", path: "/admin/users" },
    { icon: Shield, label: "Configurar Roles", color: "purple", path: "/admin/roles" },
    { icon: Activity, label: "Ver Permisos", color: "green", path: "/admin/permisos" },
    { icon: FileText, label: "Auditoría", color: "orange", path: "/admin/auditoria" },
  ];

  // 🔢 Contadores (simulados, luego pueden venir del backend)
  const counts = {
    blue: 245, // Usuarios
    purple: 8, // Roles
    green: 42, // Permisos
    orange: 1200, // Auditorías
  };

  // 🕒 Actividad reciente
  const recentActivity = [
    { action: "Nuevo usuario registrado", time: "Hace 5 min", icon: Users },
    { action: "Rol actualizado", time: "Hace 1 hora", icon: Shield },
    { action: "Configuración modificada", time: "Hace 2 horas", icon: Activity },
  ];

  return (
    <div className="p-8 bg-[var(--bg-main)] transition-colors min-h-screen">
      {/* HEADER */}
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

      {/* 📈 ESTADÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="rounded-2xl p-6 border border-[var(--border-color)]
                         shadow-sm bg-white hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: `${stat.color}15`,
                  }}
                >
                  <Icon size={24} style={{ color: stat.color }} />
                </div>
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full border"
                  style={{
                    color: stat.color,
                    backgroundColor: `${stat.color}10`,
                    borderColor: `${stat.color}30`,
                  }}
                >
                  {stat.trend}
                </span>
              </div>
              <p
                className="text-2xl font-bold mb-1"
                style={{
                  color: "var(--text-primary)",
                  textShadow: "0 1px 1px rgba(0,0,0,0.05)",
                }}
              >
                {stat.value}
              </p>
              <p className="text-sm text-[var(--text-secondary)]">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* ⚙️ CUERPO PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ACCIONES RÁPIDAS + ACTIVIDAD */}
        <div className="lg:col-span-2 space-y-6">
          {/* 🚀 ACCIONES RÁPIDAS con contadores */}
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
                  blue: "from-[#0A5BA9] to-[#3B82F6]",
                  purple: "from-[#8B5CF6] to-[#A78BFA]",
                  green: "from-[#2B844E] to-[#4ADE80]",
                  orange: "from-[#F59E0B] to-[#FBBF24]",
                }[action.color];

                const count = counts[action.color] ?? 0;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => action.path && navigate(action.path)}
                    className={`group p-6 rounded-2xl bg-gradient-to-br ${gradient} text-white
                               shadow-md hover:shadow-lg hover:scale-[1.03] transition-all
                               duration-300 flex flex-col justify-between relative overflow-hidden`}
                  >
                    {/* ✨ Brillo Apple */}
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-10 transition-opacity"></div>

                    {/* 🔢 Contador superior derecho */}
                    <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-white shadow-sm">
                      {count.toLocaleString("es-PE")}
                    </div>

                    {/* Icono */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center group-hover:bg-white/25 transition-all">
                        <Icon size={22} className="text-white drop-shadow-sm" />
                      </div>
                    </div>

                    {/* Texto */}
                    <div>
                      <p className="text-sm font-semibold leading-snug drop-shadow-sm">
                        {action.label}
                      </p>
                      <ChevronRight
                        size={16}
                        className="mt-2 opacity-70 group-hover:translate-x-1 transition-transform"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 🕒 ACTIVIDAD RECIENTE */}
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

        {/* 💡 ESTADO DEL SISTEMA */}
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
                  className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-100 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-green-700" />
                    <span className="text-sm font-medium text-green-800">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-green-900 bg-green-200 px-2 py-1 rounded-full">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 🟦 ESTADO GENERAL */}
          <div className="bg-gradient-to-br from-[#0A5BA9] to-[#2563EB] rounded-2xl p-6 text-white shadow-md">
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