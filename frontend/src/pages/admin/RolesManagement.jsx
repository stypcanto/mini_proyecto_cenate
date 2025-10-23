// ========================================================================
// 🔐 Gestión de Roles y Permisos - Sistema MBAC CENATE
// ------------------------------------------------------------------------
// Página completa para administrar roles y permisos con sistema MBAC
// ========================================================================

import React, { useState } from "react";
import {
  FiShield,
  FiUsers,
  FiCheck,
  FiX,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiEye,
  FiLock,
  FiUnlock,
} from "react-icons/fi";

export default function RolesManagement() {
  const [roles, setRoles] = useState([
    {
      id: 1,
      name: "Administrador",
      description: "Acceso completo al sistema",
      users: 18,
      permissions: 42,
      color: "purple",
      active: true,
    },
    {
      id: 2,
      name: "Médico",
      description: "Acceso a pacientes y expedientes médicos",
      users: 85,
      permissions: 25,
      color: "blue",
      active: true,
    },
    {
      id: 3,
      name: "Enfermera",
      description: "Acceso a pacientes y seguimiento",
      users: 120,
      permissions: 18,
      color: "green",
      active: true,
    },
    {
      id: 4,
      name: "Recepcionista",
      description: "Gestión de citas y registros básicos",
      users: 22,
      permissions: 8,
      color: "yellow",
      active: true,
    },
  ]);

  const [selectedRole, setSelectedRole] = useState(roles[0]);
  const [showPermissions, setShowPermissions] = useState(true);

  const permissionCategories = [
    {
      category: "Dashboard",
      permissions: [
        { id: "view_dashboard", name: "Ver Dashboard", enabled: true },
        { id: "view_stats", name: "Ver Estadísticas", enabled: true },
      ],
    },
    {
      category: "Pacientes",
      permissions: [
        { id: "view_patients", name: "Ver Pacientes", enabled: true },
        { id: "create_patient", name: "Crear Paciente", enabled: true },
        { id: "edit_patient", name: "Editar Paciente", enabled: true },
        { id: "delete_patient", name: "Eliminar Paciente", enabled: true },
        { id: "export_patients", name: "Exportar Pacientes", enabled: false },
      ],
    },
    {
      category: "Citas",
      permissions: [
        { id: "view_appointments", name: "Ver Citas", enabled: true },
        { id: "create_appointment", name: "Crear Cita", enabled: true },
        { id: "edit_appointment", name: "Editar Cita", enabled: true },
        { id: "delete_appointment", name: "Eliminar Cita", enabled: false },
        { id: "cancel_appointment", name: "Cancelar Cita", enabled: true },
      ],
    },
    {
      category: "Expedientes Médicos",
      permissions: [
        { id: "view_records", name: "Ver Expedientes", enabled: true },
        { id: "create_record", name: "Crear Expediente", enabled: true },
        { id: "edit_record", name: "Editar Expediente", enabled: true },
        { id: "delete_record", name: "Eliminar Expediente", enabled: false },
      ],
    },
    {
      category: "Telemedicina",
      permissions: [
        { id: "access_telemedicine", name: "Acceso a Telemedicina", enabled: true },
        { id: "start_consultation", name: "Iniciar Consulta", enabled: true },
        { id: "view_consultations", name: "Ver Consultas", enabled: true },
      ],
    },
    {
      category: "Reportes",
      permissions: [
        { id: "view_reports", name: "Ver Reportes", enabled: true },
        { id: "generate_reports", name: "Generar Reportes", enabled: true },
        { id: "export_reports", name: "Exportar Reportes", enabled: false },
      ],
    },
    {
      category: "Administración",
      permissions: [
        { id: "manage_users", name: "Gestionar Usuarios", enabled: true },
        { id: "manage_roles", name: "Gestionar Roles", enabled: true },
        { id: "manage_permissions", name: "Gestionar Permisos", enabled: true },
        { id: "system_settings", name: "Configuración del Sistema", enabled: true },
        { id: "view_audit", name: "Ver Auditoría", enabled: true },
      ],
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      purple: "from-purple-500 to-purple-600",
      blue: "from-blue-500 to-blue-600",
      green: "from-green-500 to-green-600",
      yellow: "from-yellow-500 to-yellow-600",
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Roles y Permisos MBAC</h1>
          <p className="text-gray-600 mt-1">
            Control de acceso basado en modelo para el sistema CENATE
          </p>
        </div>
        <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl">
          <FiPlus className="w-5 h-5" />
          Nuevo Rol
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Roles</p>
              <p className="text-3xl font-bold mt-1">8</p>
            </div>
            <FiShield className="w-12 h-12 opacity-30" />
          </div>
          <p className="text-xs text-purple-100 mt-2">+2 este mes</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Usuarios Asignados</p>
              <p className="text-3xl font-bold mt-1">245</p>
            </div>
            <FiUsers className="w-12 h-12 opacity-30" />
          </div>
          <p className="text-xs text-blue-100 mt-2">Distribuidos en roles</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Permisos</p>
              <p className="text-3xl font-bold mt-1">42</p>
            </div>
            <FiLock className="w-12 h-12 opacity-30" />
          </div>
          <p className="text-xs text-green-100 mt-2">Sistema MBAC activo</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Roles Activos</p>
              <p className="text-3xl font-bold mt-1">8</p>
            </div>
            <FiUnlock className="w-12 h-12 opacity-30" />
          </div>
          <p className="text-xs text-yellow-100 mt-2">100% operativos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles List */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Roles Disponibles</h2>
          <div className="space-y-3">
            {roles.map((role) => (
              <div
                key={role.id}
                onClick={() => setSelectedRole(role)}
                className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedRole.id === role.id
                    ? "bg-green-50 border-2 border-green-500 shadow-md"
                    : "bg-gray-50 border-2 border-transparent hover:border-gray-300"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 bg-gradient-to-br ${getColorClasses(
                        role.color
                      )} rounded-lg flex items-center justify-center text-white shadow-md`}
                    >
                      <FiShield className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{role.name}</h3>
                      <p className="text-xs text-gray-500">{role.permissions} permisos</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{role.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">{role.users} usuarios</span>
                  {role.active ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full font-medium">
                      Activo
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full font-medium">
                      Inactivo
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Permissions Panel */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 bg-gradient-to-br ${getColorClasses(
                  selectedRole.color
                )} rounded-xl flex items-center justify-center text-white shadow-lg`}
              >
                <FiShield className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{selectedRole.name}</h2>
                <p className="text-gray-600">{selectedRole.description}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <FiEdit className="w-5 h-5" />
              </button>
              <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <FiTrash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Permisos Asignados ({selectedRole.permissions})
              </h3>
              <button className="text-green-600 hover:text-green-700 font-medium text-sm">
                Guardar Cambios
              </button>
            </div>

            <div className="space-y-6">
              {permissionCategories.map((category, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FiLock className="w-4 h-4 text-gray-500" />
                    {category.category}
                  </h4>
                  <div className="space-y-2">
                    {category.permissions.map((perm) => (
                      <label
                        key={perm.id}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={perm.enabled}
                            className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                            onChange={() => {}}
                          />
                          <span className="text-gray-700 font-medium">{perm.name}</span>
                        </div>
                        {perm.enabled ? (
                          <FiCheck className="w-5 h-5 text-green-600" />
                        ) : (
                          <FiX className="w-5 h-5 text-gray-400" />
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
