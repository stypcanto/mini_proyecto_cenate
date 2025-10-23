// ========================================================================
// 🔐 Control MBAC - Sistema de Permisos Dinámico CENATE
// ------------------------------------------------------------------------
// Página de control granular de permisos MBAC
// ========================================================================

import React, { useState } from "react";
import {
  FiShield,
  FiLock,
  FiUnlock,
  FiAlertCircle,
  FiCheck,
  FiX,
  FiSearch,
  FiFilter,
  FiDownload,
  FiRefreshCw,
} from "react-icons/fi";

export default function MBACControl() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const mbacPermissions = [
    {
      id: "p001",
      code: "VIEW_DASHBOARD",
      name: "Ver Dashboard",
      description: "Permite visualizar el panel principal del sistema",
      category: "Dashboard",
      roles: ["Administrador", "Médico", "Enfermera"],
      critical: false,
      active: true,
    },
    {
      id: "p002",
      code: "VIEW_PATIENTS",
      name: "Ver Pacientes",
      description: "Permite visualizar la lista y detalles de pacientes",
      category: "Pacientes",
      roles: ["Administrador", "Médico", "Enfermera"],
      critical: false,
      active: true,
    },
    {
      id: "p003",
      code: "CREATE_PATIENT",
      name: "Crear Paciente",
      description: "Permite registrar nuevos pacientes en el sistema",
      category: "Pacientes",
      roles: ["Administrador", "Médico", "Recepcionista"],
      critical: false,
      active: true,
    },
    {
      id: "p004",
      code: "EDIT_PATIENT",
      name: "Editar Paciente",
      description: "Permite modificar información de pacientes existentes",
      category: "Pacientes",
      roles: ["Administrador", "Médico"],
      critical: false,
      active: true,
    },
    {
      id: "p005",
      code: "DELETE_PATIENT",
      name: "Eliminar Paciente",
      description: "Permite eliminar registros de pacientes (acción irreversible)",
      category: "Pacientes",
      roles: ["Administrador"],
      critical: true,
      active: true,
    },
    {
      id: "p006",
      code: "VIEW_MEDICAL_RECORDS",
      name: "Ver Expedientes Médicos",
      description: "Permite acceder a expedientes médicos completos",
      category: "Expedientes",
      roles: ["Administrador", "Médico"],
      critical: false,
      active: true,
    },
    {
      id: "p007",
      code: "EDIT_MEDICAL_RECORDS",
      name: "Editar Expedientes Médicos",
      description: "Permite modificar información en expedientes médicos",
      category: "Expedientes",
      roles: ["Administrador", "Médico"],
      critical: true,
      active: true,
    },
    {
      id: "p008",
      code: "VIEW_APPOINTMENTS",
      name: "Ver Citas",
      description: "Permite visualizar el calendario de citas",
      category: "Citas",
      roles: ["Administrador", "Médico", "Enfermera", "Recepcionista"],
      critical: false,
      active: true,
    },
    {
      id: "p009",
      code: "CREATE_APPOINTMENT",
      name: "Crear Cita",
      description: "Permite agendar nuevas citas médicas",
      category: "Citas",
      roles: ["Administrador", "Recepcionista"],
      critical: false,
      active: true,
    },
    {
      id: "p010",
      code: "CANCEL_APPOINTMENT",
      name: "Cancelar Cita",
      description: "Permite cancelar citas programadas",
      category: "Citas",
      roles: ["Administrador", "Médico", "Recepcionista"],
      critical: false,
      active: true,
    },
    {
      id: "p011",
      code: "ACCESS_TELEMEDICINE",
      name: "Acceso a Telemedicina",
      description: "Permite iniciar y participar en consultas de telemedicina",
      category: "Telemedicina",
      roles: ["Administrador", "Médico"],
      critical: false,
      active: true,
    },
    {
      id: "p012",
      code: "VIEW_REPORTS",
      name: "Ver Reportes",
      description: "Permite visualizar reportes del sistema",
      category: "Reportes",
      roles: ["Administrador", "Médico"],
      critical: false,
      active: true,
    },
    {
      id: "p013",
      code: "GENERATE_REPORTS",
      name: "Generar Reportes",
      description: "Permite crear y exportar reportes personalizados",
      category: "Reportes",
      roles: ["Administrador"],
      critical: false,
      active: true,
    },
    {
      id: "p014",
      code: "MANAGE_USERS",
      name: "Gestionar Usuarios",
      description: "Permite crear, editar y eliminar usuarios del sistema",
      category: "Administración",
      roles: ["Administrador"],
      critical: true,
      active: true,
    },
    {
      id: "p015",
      code: "MANAGE_ROLES",
      name: "Gestionar Roles",
      description: "Permite crear y modificar roles de usuario",
      category: "Administración",
      roles: ["Administrador"],
      critical: true,
      active: true,
    },
    {
      id: "p016",
      code: "MANAGE_PERMISSIONS",
      name: "Gestionar Permisos",
      description: "Permite asignar y revocar permisos MBAC",
      category: "Administración",
      roles: ["Administrador"],
      critical: true,
      active: true,
    },
    {
      id: "p017",
      code: "SYSTEM_SETTINGS",
      name: "Configuración del Sistema",
      description: "Permite modificar configuraciones globales del sistema",
      category: "Administración",
      roles: ["Administrador"],
      critical: true,
      active: true,
    },
    {
      id: "p018",
      code: "VIEW_AUDIT",
      name: "Ver Auditoría",
      description: "Permite acceder a registros de auditoría del sistema",
      category: "Administración",
      roles: ["Administrador"],
      critical: false,
      active: true,
    },
  ];

  const categories = [
    "Dashboard",
    "Pacientes",
    "Citas",
    "Expedientes",
    "Telemedicina",
    "Reportes",
    "Administración",
  ];

  const filteredPermissions = mbacPermissions.filter((perm) => {
    const matchesSearch =
      perm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      perm.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      perm.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || perm.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPermissions = mbacPermissions.length;
  const activePermissions = mbacPermissions.filter((p) => p.active).length;
  const criticalPermissions = mbacPermissions.filter((p) => p.critical).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Control MBAC</h1>
          <p className="text-gray-600 mt-1">
            Control de Acceso Basado en Modelo - Gestión de Permisos
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl shadow-lg transition-all duration-200">
            <FiDownload className="w-5 h-5" />
            Exportar
          </button>
          <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl shadow-lg transition-all duration-200">
            <FiRefreshCw className="w-5 h-5" />
            Sincronizar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Permisos</p>
              <p className="text-3xl font-bold mt-1">{totalPermissions}</p>
            </div>
            <FiShield className="w-12 h-12 opacity-30" />
          </div>
          <p className="text-xs text-purple-100 mt-2">Sistema MBAC completo</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Permisos Activos</p>
              <p className="text-3xl font-bold mt-1">{activePermissions}</p>
            </div>
            <FiCheck className="w-12 h-12 opacity-30" />
          </div>
          <p className="text-xs text-green-100 mt-2">
            {((activePermissions / totalPermissions) * 100).toFixed(1)}% operativos
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Permisos Críticos</p>
              <p className="text-3xl font-bold mt-1">{criticalPermissions}</p>
            </div>
            <FiAlertCircle className="w-12 h-12 opacity-30" />
          </div>
          <p className="text-xs text-red-100 mt-2">Requieren autorización especial</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Categorías</p>
              <p className="text-3xl font-bold mt-1">{categories.length}</p>
            </div>
            <FiFilter className="w-12 h-12 opacity-30" />
          </div>
          <p className="text-xs text-blue-100 mt-2">Módulos del sistema</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar permiso por nombre, código o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="pl-12 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white cursor-pointer"
            >
              <option value="all">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Permissions Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Permiso
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Roles Asignados
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Nivel
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPermissions.map((perm) => (
                <tr key={perm.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-800 flex items-center gap-2">
                        {perm.critical && (
                          <FiAlertCircle className="w-4 h-4 text-red-500" />
                        )}
                        {perm.name}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">{perm.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-mono">
                      {perm.code}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {perm.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {perm.roles.map((role, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {perm.critical ? (
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium flex items-center gap-1 w-fit">
                        <FiLock className="w-4 h-4" />
                        Crítico
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-1 w-fit">
                        <FiUnlock className="w-4 h-4" />
                        Normal
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {perm.active ? (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
