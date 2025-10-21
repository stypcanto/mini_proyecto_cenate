// ========================================================================
// 👥 UsersPage.jsx
// ------------------------------------------------------------------------
// Gestión de usuarios del sistema CENATE.
// Incluye búsqueda, detalle, edición y eliminación.
// Integrado con AuthContext y apiClient.
// ========================================================================

import React, { useState, useEffect } from "react";
import {
  Search,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Save,
  Camera,
  X,
  Download,
  UserPlus,
} from "lucide-react";
import toast from "react-hot-toast";
import { apiClient } from "../lib/apiClient";
import AppLayout, { ActionToolbar, RowActions } from "../components/AppLayout";
import { PermissionGate } from "../components/security/PermissionGate";

// ========================================================================
// 📄 Página principal
// ========================================================================
export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalMode, setModalMode] = useState(null); // 'view' | 'edit'
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔹 Cargar usuarios
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

  // 🔹 Ver detalles
  const viewDetails = async (id) => {
    try {
      const data = await apiClient.get(`/personal/detalle/${id}`, true);
      setSelectedUser(data);
      setModalMode("view");
      setShowModal(true);
    } catch (err) {
      toast.error("Error al cargar detalles");
    }
  };

  // 🔹 Editar usuario
  const editUser = async (id) => {
    try {
      const data = await apiClient.get(`/personal/detalle/${id}`, true);
      setSelectedUser(data);
      setModalMode("edit");
      setShowModal(true);
    } catch (err) {
      toast.error("Error al cargar usuario");
    }
  };

  // 🔹 Eliminar usuario
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

  // 🔹 Filtro de búsqueda
  const filteredUsers = users.filter(
    (u) =>
      u.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.numero_documento?.includes(searchTerm)
  );

  return (
    <AppLayout title="Gestión de Usuarios" currentPath="/admin/users">
      {/* Barra de acciones */}
      <ActionToolbar currentPath="/admin/users" onExportar={fetchUsers} />

      {/* Buscador */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre, usuario o documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={fetchUsers}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2 transition-colors"
          >
            <RefreshCw size={18} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-4" />
            <p className="text-gray-500">Cargando usuarios...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Usuario
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Nombre Completo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Documento
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Rol
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id_user} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-bold">
                        {user.username?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{user.username}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {user.nombre_completo || "Sin nombre"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {user.numero_documento || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700">
                        {user.roles}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          user.estado_usuario === "ACTIVO"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {user.estado_usuario}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <RowActions
                        currentPath="/admin/users"
                        onEdit={() => editUser(user.id_user)}
                        onDelete={() => deleteUser(user.id_user)}
                        item={user}
                      />
                      <PermissionGate path="/admin/users" action="ver">
                        <button
                          onClick={() => viewDetails(user.id_user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <Eye size={18} />
                        </button>
                      </PermissionGate>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                No se encontraron usuarios
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Mostrando {filteredUsers.length} de {users.length} usuarios
      </div>

      {/* Modal dinámico */}
      {showModal && selectedUser && (
        <UserModal
          mode={modalMode}
          user={selectedUser}
          onClose={() => {
            setShowModal(false);
            setSelectedUser(null);
          }}
          onSave={() => {
            fetchUsers();
            setShowModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </AppLayout>
  );
}

// ========================================================================
// 🧩 Modal genérico (Vista / Edición)
// ========================================================================
function UserModal({ mode, user, onClose, onSave }) {
  const isView = mode === "view";
  const [formData, setFormData] = useState(user.personal || {});
  const [photoPreview, setPhotoPreview] = useState(
    user.personal?.foto ? `/api/personal/foto/${user.personal.foto}` : null
  );

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.put(`/personal/${user.id_user}`, formData, true);
      toast.success("Usuario actualizado correctamente");
      onSave();
    } catch {
      toast.error("Error al actualizar usuario");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div
          className={`px-8 py-6 text-white ${
            isView
              ? "bg-gradient-to-r from-teal-600 to-cyan-600"
              : "bg-gradient-to-r from-green-600 to-emerald-600"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Foto"
                  className="w-16 h-16 rounded-full border-4 border-white/30 object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold border-4 border-white/30">
                  <UserPlus size={28} />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold">
                  {isView ? "Detalles del Usuario" : "Editar Usuario"}
                </h2>
                <p className="text-teal-100 mt-1">{user.username}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-8 overflow-y-auto max-h-[calc(90vh-180px)]"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Nombre Completo"
              name="nombre_completo"
              value={formData.nombre_completo || ""}
              onChange={handleChange}
              disabled={isView}
            />
            <FormField
              label="Número Documento"
              name="numero_documento"
              value={formData.numero_documento || ""}
              onChange={handleChange}
              disabled={isView}
            />
            <FormField
              label="Correo Corporativo"
              name="correo_corporativo"
              value={formData.correo_corporativo || ""}
              onChange={handleChange}
              disabled={isView}
            />
            <FormField
              label="Teléfono"
              name="telefono"
              value={formData.telefono || ""}
              onChange={handleChange}
              disabled={isView}
            />
          </div>
        </form>

        <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          {isView ? (
            <>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                type="button"
                className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <Save size={18} />
                Guardar Cambios
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ========================================================================
// 🧱 Campos reutilizables
// ========================================================================
function FormField({ label, name, value, onChange, disabled = false }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <input
        type="text"
        name={name}
        value={value}
        disabled={disabled}
        onChange={onChange}
        className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
          disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
        }`}
      />
    </div>
  );
}