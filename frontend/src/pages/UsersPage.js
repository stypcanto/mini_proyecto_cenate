// ========================================================================
// 👥 UsersPage.jsx - MEJORADO CON PLANTILLA ESCALABLE
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
import AdminLayout from "../components/layout/AdminLayout";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";

export default function UsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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
    } catch (err) {
      toast.error("Error al eliminar usuario");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.numero_documento?.includes(searchTerm)
  );

  const statsData = {
    total: users.length,
    activos: users.filter(u => u.estado_usuario === "ACTIVO").length,
    inactivos: users.filter(u => u.estado_usuario !== "ACTIVO").length,
  };

  return (
    <AdminLayout>
      <div className="p-8 bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Gestión de Usuarios
              </h1>
              <p className="text-base text-gray-400 mt-1">
                Administra los usuarios del sistema CENATE
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin/users/create")}
              className="px-5 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg"
            >
              <UserPlus className="w-5 h-5" />
              Crear Usuario
            </button>
            <button
              onClick={fetchUsers}
              className="px-4 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-gray-300 font-semibold rounded-xl transition-colors flex items-center gap-2 border border-slate-700"
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </button>
          </div>
        </div>

      {/* Stats Cards - Diseño profesional */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-2xl p-6 border border-blue-500/20 hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider">Total Usuarios</p>
                <p className="text-3xl font-bold text-white mt-1">{statsData.total}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-2xl p-6 border border-green-500/20 hover:border-green-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-green-400 font-semibold uppercase tracking-wider">Usuarios Activos</p>
                <p className="text-3xl font-bold text-white mt-1">{statsData.activos}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-2xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-purple-400 font-semibold uppercase tracking-wider">Usuarios Inactivos</p>
                <p className="text-3xl font-bold text-white mt-1">{statsData.inactivos}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buscador profesional */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por nombre, usuario o documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-slate-800/40 rounded-xl border border-slate-700/50 
                     focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 
                     text-base font-medium text-white placeholder:text-gray-500
                     transition-all hover:bg-slate-800/60"
          />
        </div>
      </div>

      {/* Tabla profesional */}
      <div className="bg-slate-800/20 rounded-2xl border border-slate-700/50 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-300">Cargando usuarios...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-16 text-center">
            <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-300">No se encontraron usuarios</p>
            <p className="text-sm text-gray-500 mt-2">Intenta con otros términos de búsqueda</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/60 border-b border-slate-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Nombre Completo
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Documento
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {filteredUsers.map((user) => (
                    <tr 
                      key={user.id_user} 
                      className="hover:bg-slate-800/40 transition-all"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {user.username?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-base text-white">
                            {user.username}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {user.nombre_completo || "Sin nombre"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {user.numero_documento || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          {user.roles}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1.5 text-xs font-bold rounded-full border ${
                            user.estado_usuario === "ACTIVO"
                              ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
                              : "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                          }`}
                        >
                          {user.estado_usuario}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => navigate(`/admin/users/${user.id_user}`)}
                            className="p-2.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors border border-transparent hover:border-blue-500/30"
                            title="Ver detalles"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/users/${user.id_user}/edit`)}
                            className="p-2.5 text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors border border-transparent hover:border-amber-500/30"
                            title="Editar"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => deleteUser(user.id_user)}
                            className="p-2.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/30"
                            title="Eliminar"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-800/40 border-t border-slate-700/50">
              <p className="text-sm font-medium text-gray-400">
                Mostrando <span className="text-blue-400 font-bold">{filteredUsers.length}</span> de{" "}
                <span className="text-blue-400 font-bold">{users.length}</span> usuarios
              </p>
            </div>
          </>
        )}
      </div>
      </div>
    </AdminLayout>
  );
}
