// ========================================================================
// 👥 UsersPage.jsx – Gestión de Usuarios (versión final CENATE 2025)
// ------------------------------------------------------------------------
// Diseño inspirado en macOS: limpio, balanceado y profesional.
// Renderiza dentro de AppLayout (no incluye sidebar directamente).
// ========================================================================

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  UserPlus,
  Users,
  Loader2,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { apiClient } from "../lib/apiClient";

export default function UsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // ============================================================
  // 📦 Cargar usuarios desde API
  // ============================================================
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get("/personal/total", true);
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      toast.error("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este usuario?")) return;
    try {
      await apiClient.delete(`/usuarios/${id}`, true);
      toast.success("Usuario eliminado correctamente");
      fetchUsers();
    } catch {
      toast.error("Error al eliminar usuario");
    }
  };

  // ============================================================
  // 🔍 Filtros y estadísticas
  // ============================================================
  const filteredUsers = users.filter(
    (u) =>
      u.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.numero_documento?.includes(searchTerm)
  );

  const statsData = {
    total: users.length,
    activos: users.filter((u) => u.estado_usuario === "ACTIVO").length,
    inactivos: users.filter((u) => u.estado_usuario !== "ACTIVO").length,
  };

  // ============================================================
  // 🧱 Render principal
  // ============================================================
  return (
    <div className="p-8 bg-[var(--bg-main)] transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-info)] flex items-center justify-center shadow-lg">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">
              Gestión de Usuarios
            </h1>
            <p className="text-base text-[var(--text-secondary)] mt-1">
              Administra los usuarios del sistema CENATE
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin/users/create")}
            className="px-5 py-3 rounded-xl font-semibold text-white flex items-center gap-2
                       bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-info)]
                       hover:brightness-110 active:scale-95 shadow-md transition-all"
          >
            <UserPlus className="w-5 h-5" />
            Crear Usuario
          </button>
          <button
            onClick={fetchUsers}
            className="px-5 py-3 rounded-xl font-semibold flex items-center gap-2
                       border border-[var(--border-color)] bg-[var(--bg-card)]
                       text-[var(--text-primary)] hover:bg-[var(--bg-hover)]
                       hover:shadow-md active:scale-95 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard label="Total Usuarios" value={statsData.total} color="var(--color-primary)" />
        <StatCard label="Usuarios Activos" value={statsData.activos} color="var(--color-accent)" />
        <StatCard label="Usuarios Inactivos" value={statsData.inactivos} color="#8B5CF6" />
      </div>

      {/* Buscador */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]/70" />
          <input
            type="text"
            placeholder="Buscar por nombre, usuario o documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]
                       text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/70
                       focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)]
                       hover:bg-[var(--bg-hover)] shadow-sm transition-all duration-200"
          />
        </div>
      </div>

      {/* ============================================================ */}
      {/* 🧾 Tabla de usuarios estilo Apple/macOS */}
      {/* ============================================================ */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]/95 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden backdrop-blur-sm">
        {loading ? (
          <div className="p-16 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)] mx-auto mb-4" />
            <p className="text-lg font-semibold text-[var(--text-secondary)]">
              Cargando usuarios...
            </p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-16 text-center">
            <AlertCircle className="w-10 h-10 text-[var(--text-secondary)] mx-auto mb-4" />
            <p className="text-lg font-semibold text-[var(--text-primary)]">
              No se encontraron usuarios
            </p>
            <p className="text-sm text-[var(--text-secondary)] mt-2">
              Intenta con otros términos de búsqueda
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                {/* 📊 Cabecera estilo macOS */}
                <thead className="bg-gradient-to-b from-[#F9FAFB] to-[#F3F4F6] border-b border-[var(--border-color)]/70">
                  <tr>
                    {["Usuario", "Nombre Completo", "Documento", "Rol", "Estado", "Acciones"].map(
                      (header, i) => (
                        <th
                          key={i}
                          className="px-6 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-[var(--text-secondary)] border-r last:border-r-0 border-[var(--border-color)]/40 select-none"
                        >
                          {header}
                        </th>
                      )
                    )}
                  </tr>
                </thead>

                {/* 📋 Cuerpo con efecto hover sutil */}
                <tbody className="divide-y divide-[var(--border-color)]/40">
                  {filteredUsers.map((user, idx) => (
                    <tr
                      key={user.id_user}
                      className={`transition-all duration-150 ${
                        idx % 2 === 0
                          ? "bg-[var(--bg-card)]/60"
                          : "bg-[var(--bg-card)]/40"
                      } hover:bg-[var(--color-primary)]/5`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold shadow-sm"
                            style={{
                              background:
                                "linear-gradient(to bottom right, var(--color-primary), var(--color-info))",
                            }}
                          >
                            {user.username?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-[var(--text-primary)] text-[15px]">
                            {user.username}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[var(--text-primary)] text-[15px]">
                        {user.nombre_completo || "—"}
                      </td>
                      <td className="px-6 py-4 text-[var(--text-primary)] text-[15px]">
                        {user.numero_documento || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1.5 text-[12px] font-semibold rounded-full border bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/30 shadow-sm">
                          {user.roles}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1.5 text-[12px] font-semibold rounded-full border shadow-sm ${
                            user.estado_usuario === "ACTIVO"
                              ? "bg-green-500/10 text-green-600 border-green-500/30"
                              : "bg-red-500/10 text-red-600 border-red-500/30"
                          }`}
                        >
                          {user.estado_usuario}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center gap-3 justify-center">
                          <ActionButton
                            icon={Eye}
                            color="var(--color-primary)"
                            onClick={() => navigate(`/admin/users/${user.id_user}`)}
                            tooltip="Ver detalles"
                          />
                          <ActionButton
                            icon={Edit}
                            color="#FBBF24"
                            onClick={() => navigate(`/admin/users/${user.id_user}/edit`)}
                            tooltip="Editar"
                          />
                          <ActionButton
                            icon={Trash2}
                            color="var(--color-danger)"
                            onClick={() => deleteUser(user.id_user)}
                            tooltip="Eliminar"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer tabla */}
            <div className="px-6 py-3 bg-[#F9FAFB] border-t border-[var(--border-color)]/70 text-[13px] text-[var(--text-secondary)]">
              Mostrando{" "}
              <span className="font-semibold text-[var(--color-primary)]">
                {filteredUsers.length}
              </span>{" "}
              de{" "}
              <span className="font-semibold text-[var(--color-primary)]">
                {users.length}
              </span>{" "}
              usuarios
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ========================================================================
// 📊 Subcomponentes
// ========================================================================
function StatCard({ label, value, color }) {
  return (
    <div
      className="rounded-2xl p-6 border shadow-sm hover:shadow-lg transition-all duration-200"
      style={{
        backgroundColor: "var(--bg-card)",
        borderColor: "var(--border-color)",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
          style={{ backgroundColor: `${color}20` }}
        >
          <Users size={22} style={{ color }} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>
            {label}
          </p>
          <p className="text-3xl font-bold text-[var(--text-primary)] mt-1">{value}</p>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ icon: Icon, color, onClick, tooltip }) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className="p-2.5 rounded-lg transition-all hover:bg-[var(--bg-hover)]/70 hover:scale-105"
      style={{
        color,
        backgroundColor: `${color}10`,
      }}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}