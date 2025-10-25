// ========================================================================
// 👥 Gestión de Usuarios - Sistema MBAC CENATE - VERSION CORREGIDA
// ========================================================================

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch, FiPlus, FiEdit, FiTrash2, FiUser, FiMail, FiShield,
  FiCheck, FiX, FiFilter, FiEye, FiEyeOff, FiLock, FiAlertCircle,
  FiPhone, FiCalendar, FiCreditCard, FiBriefcase, FiMapPin, FiRefreshCw,
} from "react-icons/fi";
import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

export default function UsersManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [formData, setFormData] = useState({
    username: "", password: "", confirmPassword: "",
    nombres: "", apellido_paterno: "", apellido_materno: "",
    numero_documento: "", tipo_documento: "DNI", genero: "M",
    fecha_nacimiento: "", telefono: "", correo_personal: "",
    correo_corporativo: "", rol: "USER", esInterno: true,
    ipress: "", area: "", profesion: "", regimen_laboral: "", codigo_planilla: "",
  });

  const [formErrors, setFormErrors] = useState({});

  const rolesInternos = [
    { value: "SUPERADMIN", label: "Super Administrador" },
    { value: "ADMIN", label: "Administrador" },
    { value: "MEDICO", label: "Médico" },
    { value: "ENFERMERO", label: "Enfermero(a)" },
    { value: "PERSONAL_CNT", label: "Personal CENATE" },
  ];

  const rolesExternos = [
    { value: "INSTITUCION_EX", label: "Institución Externa" },
    { value: "ASEGURADORA", label: "Aseguradora" },
    { value: "REGULADOR", label: "Regulador" },
    { value: "PERSONAL_EXTERNO", label: "Personal Externo" },
  ];

  const tiposDocumento = [
    { value: "DNI", label: "DNI" },
    { value: "CE", label: "Carnet de Extranjería" },
    { value: "PASAPORTE", label: "Pasaporte" },
  ];

  useEffect(() => {
    console.log("=== COMPONENTE MONTADO ===");
    fetchUsers();
  }, []);

  const getAuthToken = () => {
    // Intentar obtener el token desde las diferentes ubicaciones posibles
    const token = localStorage.getItem("auth.token") || 
                  localStorage.getItem("token") || 
                  sessionStorage.getItem("auth.token") ||
                  sessionStorage.getItem("token");
    console.log("🔑 Token encontrado:", token ? "SÍ" : "NO");
    if (token) {
      console.log("🔑 Primeros 30 caracteres:", token.substring(0, 30) + "...");
    }
    return token;
  };

  const fetchUsers = async () => {
    console.log("📡 === INICIANDO FETCH USUARIOS ===");
    setLoadingUsers(true);
    setError(null);
    
    try {
      const token = getAuthToken();
      
      if (!token) {
        console.error("❌ No hay token en localStorage");
        setError("No hay token de autenticación. Por favor inicia sesión.");
        setLoadingUsers(false);
        return;
      }

      const url = `${API_BASE_URL}/personal/total`;
      console.log("📡 URL:", url);
      console.log("📡 Enviando petición con Authorization Bearer...");
      
      const response = await axios.get(url, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("✅ Respuesta recibida:");
      console.log("  - Status:", response.status);
      console.log("  - Total usuarios en respuesta:", response.data?.length || 0);
      
      // Mapear los datos de la API al formato esperado por el componente
      const usuariosMapeados = Array.isArray(response.data) ? response.data.map(user => ({
        idUser: user.id_user,
        username: user.username,
        nombres: user.nombres,
        apellido_paterno: user.apellido_paterno,
        apellido_materno: user.apellido_materno,
        correo_corporativo: user.ipress_asignada,
        correo_personal: user.numero_documento,
        rol: user.roles || 'USER',
        estado: user.estado_usuario === 'ACTIVO' || user.estado_usuario === 'A' ? 'ACTIVO' : 'INACTIVO',
        tipo_personal: user.tipo_personal,
        nombre_completo: user.nombre_completo,
        ipress_asignada: user.ipress_asignada
      })) : [];
      
      console.log("📊 Usuarios mapeados correctamente:", usuariosMapeados.length);
      setUsers(usuariosMapeados);
      
    } catch (err) {
      console.error("❌ === ERROR AL CARGAR USUARIOS ===");
      console.error("Mensaje:", err.message);
      console.error("Response:", err.response?.data);
      console.error("Status:", err.response?.status);
      console.error("Headers:", err.response?.headers);
      
      let errorMsg = "Error desconocido";
      
      if (!err.response) {
        errorMsg = "No se puede conectar al servidor. ¿Está el backend corriendo en localhost:8080?";
      } else if (err.response.status === 401) {
        errorMsg = "Token inválido o expirado. Por favor inicia sesión nuevamente.";
      } else if (err.response.status === 403) {
        errorMsg = "No tienes permisos para ver usuarios.";
      } else if (err.response.status === 404) {
        errorMsg = "Endpoint no encontrado. Verifica que el backend esté corriendo correctamente.";
      } else {
        errorMsg = err.response?.data?.message || `Error ${err.response?.status}`;
      }
      
      setError(errorMsg);
      
    } finally {
      setLoadingUsers(false);
      console.log("📡 === FIN FETCH USUARIOS ===");
    }
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      user.username?.toLowerCase().includes(searchLower) ||
      user.correo_personal?.toLowerCase().includes(searchLower) ||
      user.correo_corporativo?.toLowerCase().includes(searchLower) ||
      user.nombres?.toLowerCase().includes(searchLower) ||
      user.apellido_paterno?.toLowerCase().includes(searchLower) ||
      user.nombre_completo?.toLowerCase().includes(searchLower);
    const matchesRole = filterRole === "all" || user.rol === filterRole;
    return matchesSearch && matchesRole;
  });

  const esUsuarioInterno = (tipo) => {
    return tipo === "CENATE";
  };

  const totalUsuarios = users.length;
  const usuariosInternos = users.filter((u) => esUsuarioInterno(u.tipo_personal)).length;
  const usuariosExternos = users.filter((u) => !esUsuarioInterno(u.tipo_personal)).length;
  const usuariosAdmin = users.filter((u) => u.rol?.includes("ADMIN")).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-1">Administra los usuarios del sistema CENATE</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchUsers}
            disabled={loadingUsers}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl shadow-lg transition-all disabled:opacity-50"
          >
            <FiRefreshCw className={`w-5 h-5 ${loadingUsers ? 'animate-spin' : ''}`} />
            Recargar
          </button>
          <button
            onClick={() => navigate('/admin/crear-usuario')}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl shadow-lg"
          >
            <FiPlus className="w-5 h-5" />
            Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Usuarios</p>
              <p className="text-3xl font-bold mt-1">{totalUsuarios}</p>
            </div>
            <FiUser className="w-12 h-12 opacity-30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Internos CENATE</p>
              <p className="text-3xl font-bold mt-1">{usuariosInternos}</p>
            </div>
            <FiCheck className="w-12 h-12 opacity-30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Externos</p>
              <p className="text-3xl font-bold mt-1">{usuariosExternos}</p>
            </div>
            <FiMapPin className="w-12 h-12 opacity-30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Con Acceso Admin</p>
              <p className="text-3xl font-bold mt-1">{usuariosAdmin}</p>
            </div>
            <FiShield className="w-12 h-12 opacity-30" />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-300 text-red-900 px-6 py-4 rounded-lg flex items-start gap-3">
          <FiAlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-lg">Error al cargar usuarios</p>
            <p className="text-sm mt-1">{error}</p>
            <button 
              onClick={fetchUsers}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, usuario o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="pl-12 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white cursor-pointer"
            >
              <option value="all">Todos los roles</option>
              <optgroup label="Internos">
                {rolesInternos.map((role) => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </optgroup>
              <optgroup label="Externos">
                {rolesExternos.map((role) => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Usuario</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">DNI</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Rol</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Tipo</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">IPRESS</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loadingUsers ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <FiRefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                      <span className="text-lg text-gray-600">Cargando usuarios...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.idUser} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {(user.nombres || user.username || "U").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {user.nombre_completo || `${user.nombres || ''} ${user.apellido_paterno || ''}`.trim() || user.username}
                          </p>
                          <p className="text-xs text-gray-400">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{user.correo_personal || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {user.rol || 'USER'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {esUsuarioInterno(user.tipo_personal) ? (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-1 w-fit">
                          <FiBriefcase className="w-3 h-3" />
                          CENATE
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium flex items-center gap-1 w-fit">
                          <FiMapPin className="w-3 h-3" />
                          Externo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 truncate max-w-xs block" title={user.ipress_asignada}>
                        {user.ipress_asignada || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.estado === "ACTIVO" ? (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-1 w-fit">
                          <FiCheck className="w-4 h-4" />
                          Activo
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium flex items-center gap-1 w-fit">
                          <FiX className="w-4 h-4" />
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => window.location.href = `/admin/usuarios/${user.idUser}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                          title="Ver detalle"
                        >
                          <FiEye className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors" title="Editar">
                          <FiEdit className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>


    </div>
  );
}
