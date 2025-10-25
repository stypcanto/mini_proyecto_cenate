// ========================================================================
// 👥 UsersPage.jsx – Gestión de Usuarios (CENATE MBAC 2025.10.25)
// ------------------------------------------------------------------------
// Incluye: Filtro por mes de cumpleaños, IPRESS, UX empresarial EsSalud.
// ========================================================================

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  UserPlus,
  Users,
  Filter,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Cake,
} from "lucide-react";
import toast from "react-hot-toast";
import { apiClient } from "../lib/apiClient";

export default function UsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    rol: "TODOS",
    tipo: "TODOS",
    estado: "TODOS",
    mesCumple: "TODOS",
  });
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // ============================================================
  // 📦 Cargar usuarios desde API
  // ============================================================
  useEffect(() => {
    fetchUsers();
  }, [filters.mesCumple]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let data;
      if (filters.mesCumple !== "TODOS") {
        data = await apiClient.get(`/personal/cumpleaneros/mes/${filters.mesCumple}`, true);
      } else {
        data = await apiClient.get("/personal/total", true);
      }
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      toast.error("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // 🔍 Filtros, búsqueda y paginación
  // ============================================================
  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          u.nombre_completo?.toLowerCase().includes(search) ||
          u.username?.toLowerCase().includes(search) ||
          u.numero_documento?.includes(search);

        const matchesRol =
          filters.rol === "TODOS" ||
          (u.roles && u.roles.toUpperCase().includes(filters.rol.toUpperCase()));

        const matchesTipo =
          filters.tipo === "TODOS" ||
          (u.tipo_personal &&
            u.tipo_personal.toUpperCase() === filters.tipo.toUpperCase());

        const matchesEstado =
          filters.estado === "TODOS" ||
          (u.estado_usuario &&
            u.estado_usuario.toUpperCase().startsWith(filters.estado[0]));

        return matchesSearch && matchesRol && matchesTipo && matchesEstado;
      })
      .slice((page - 1) * pageSize, page * pageSize);
  }, [users, searchTerm, filters, page]);

  const totalPages = Math.ceil(users.length / pageSize);

  // ============================================================
  // 🎨 Helpers
  // ============================================================
  const getEstadoColor = (estado) => {
    if (!estado) return "bg-gray-400/10 text-gray-600 border-gray-300";
    const val = estado.toUpperCase();
    if (val.startsWith("A")) return "bg-green-500/10 text-green-600 border-green-500/30";
    if (val.startsWith("I")) return "bg-red-500/10 text-red-600 border-red-500/30";
    return "bg-gray-500/10 text-gray-600 border-gray-400";
  };

  const meses = [
    { nombre: "Todos", valor: "TODOS" },
    { nombre: "Enero", valor: 1 },
    { nombre: "Febrero", valor: 2 },
    { nombre: "Marzo", valor: 3 },
    { nombre: "Abril", valor: 4 },
    { nombre: "Mayo", valor: 5 },
    { nombre: "Junio", valor: 6 },
    { nombre: "Julio", valor: 7 },
    { nombre: "Agosto", valor: 8 },
    { nombre: "Septiembre", valor: 9 },
    { nombre: "Octubre", valor: 10 },
    { nombre: "Noviembre", valor: 11 },
    { nombre: "Diciembre", valor: 12 },
  ];

  // ============================================================
  // 🧱 Render principal
  // ============================================================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===================================================== */}
      {/* Encabezado institucional */}
      {/* ===================================================== */}
      <div className="bg-gradient-to-r from-[#0A5BA9] to-[#1C5B36] text-white px-8 py-6 shadow-md flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Users className="w-8 h-8 text-white" />
          <div>
            <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
            <p className="text-sm opacity-80">
              Administra los usuarios del sistema CENATE
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin/users/create")}
            className="flex items-center gap-2 bg-white text-[#0A5BA9] font-semibold px-5 py-2.5 rounded-xl shadow-sm hover:bg-gray-100 transition-all"
          >
            <UserPlus className="w-5 h-5" /> Crear Usuario
          </button>
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 border border-white/40 text-white px-5 py-2.5 rounded-xl hover:bg-white/10 transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Actualizar
          </button>
        </div>
      </div>

      {/* ===================================================== */}
      {/* Filtros y búsqueda */}
      {/* ===================================================== */}
      <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3 flex-wrap">
          <Filter className="w-5 h-5 text-gray-500" />
          {/* Filtros */}
          <select
            value={filters.rol}
            onChange={(e) => setFilters({ ...filters, rol: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="TODOS">Todos los Roles</option>
            <option value="SUPERADMIN">Superadmin</option>
            <option value="ADMIN">Admin</option>
            <option value="INSTITUCION_EX">Institución Externa</option>
          </select>

          <select
            value={filters.tipo}
            onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="TODOS">Todos los Tipos</option>
            <option value="CENATE">CENATE</option>
            <option value="EXTERNO">Externo</option>
          </select>

          <select
            value={filters.estado}
            onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="TODOS">Todos los Estados</option>
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
          </select>

          <div className="flex items-center gap-2">
            <Cake className="w-5 h-5 text-pink-500" />
            <select
              value={filters.mesCumple}
              onChange={(e) => setFilters({ ...filters, mesCumple: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              {meses.map((m) => (
                <option key={m.valor} value={m.valor}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre o documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 focus:ring-2 focus:ring-[#0A5BA9]/40"
          />
        </div>
      </div>

      {/* ===================================================== */}
      {/* Tabla de datos */}
      {/* ===================================================== */}
      <div className="p-6">
        <div className="bg-white rounded-2xl shadow overflow-hidden border border-gray-200">
          {loading ? (
            <div className="p-10 text-center text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-[#0A5BA9]" />
              Cargando usuarios...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              No se encontraron resultados.
            </div>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead className="bg-[#0A5BA9] text-white">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Usuario</th>
                  <th className="px-6 py-3 text-left font-semibold">Nombre Completo</th>
                  <th className="px-6 py-3 text-left font-semibold">Documento</th>
                  <th className="px-6 py-3 text-left font-semibold">Rol</th>
                  <th className="px-6 py-3 text-left font-semibold">Tipo</th>
                  <th className="px-6 py-3 text-left font-semibold">IPRESS Asignada</th>
                  {filters.mesCumple !== "TODOS" && (
                    <th className="px-6 py-3 text-left font-semibold">Cumpleaños</th>
                  )}
                  <th className="px-6 py-3 text-left font-semibold">Estado</th>
                  <th className="px-6 py-3 text-left font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((u) => (
                  <tr key={u.id_user || u.nombre_completo} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-3 font-medium">{u.username || "—"}</td>
                    <td className="px-6 py-3">{u.nombre_completo}</td>
                    <td className="px-6 py-3">{u.numero_documento || "—"}</td>
                    <td className="px-6 py-3">{u.roles || "—"}</td>
                    <td className="px-6 py-3">{u.tipo_personal || "—"}</td>
                    <td className="px-6 py-3 text-gray-800">
                      {u.ipress_asignada || u.ipress || "—"}
                    </td>
                    {filters.mesCumple !== "TODOS" && (
                      <td className="px-6 py-3 text-gray-800">
                        {u.dia ? `${u.dia} ${u.mes}` : "—"}
                      </td>
                    )}
                    <td className="px-6 py-3">
                      <span
                        className={`px-3 py-1 rounded-full border text-xs font-semibold ${getEstadoColor(
                          u.estado_usuario
                        )}`}
                      >
                        {u.estado_usuario || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-3 flex items-center gap-2">
                      <ActionButton icon={Eye} color="#0A5BA9" tooltip="Ver detalles" />
                      <ActionButton icon={Edit} color="#FBBF24" tooltip="Editar usuario" />
                      <ActionButton icon={Trash2} color="#EF4444" tooltip="Eliminar usuario" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ===================================================== */}
        {/* Paginación */}
        {/* ===================================================== */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-6 gap-3">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="p-2 rounded-lg border bg-white disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-gray-700 text-sm">
              Página {page} de {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="p-2 rounded-lg border bg-white disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// 🎯 Subcomponente ActionButton
// ============================================================
function ActionButton({ icon: Icon, color, tooltip, onClick }) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className="p-2 rounded-lg hover:bg-gray-100 transition-all"
      style={{ color }}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}