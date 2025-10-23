// ========================================================================
// 📊 Auditoría - Sistema MBAC CENATE
// ------------------------------------------------------------------------
// Registro y seguimiento de acciones en el sistema
// ========================================================================

import React, { useState } from "react";
import {
  FiClipboard,
  FiUser,
  FiCalendar,
  FiFilter,
  FiSearch,
  FiDownload,
  FiAlertCircle,
  FiCheck,
  FiX,
  FiEye,
  FiEdit,
  FiTrash2,
  FiLogIn,
  FiLogOut,
} from "react-icons/fi";

export default function AuditLog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [filterUser, setFilterUser] = useState("all");
  const [dateRange, setDateRange] = useState("today");

  const auditLogs = [
    {
      id: 1,
      timestamp: "2025-10-23 09:45:32",
      user: "Carlos Rodríguez",
      userId: 3,
      action: "LOGIN",
      actionType: "Autenticación",
      details: "Inicio de sesión exitoso",
      ipAddress: "192.168.1.105",
      status: "success",
      critical: false,
    },
    {
      id: 2,
      timestamp: "2025-10-23 09:47:15",
      user: "Carlos Rodríguez",
      userId: 3,
      action: "VIEW_PATIENT",
      actionType: "Consulta",
      details: "Visualizó expediente del paciente Juan Pérez (ID: 1234)",
      ipAddress: "192.168.1.105",
      status: "success",
      critical: false,
    },
    {
      id: 3,
      timestamp: "2025-10-23 10:12:48",
      user: "Dr. Juan Pérez",
      userId: 1,
      action: "EDIT_MEDICAL_RECORD",
      actionType: "Modificación",
      details: "Actualizó expediente médico - Diagnóstico: Hipertensión",
      ipAddress: "192.168.1.87",
      status: "success",
      critical: true,
    },
    {
      id: 4,
      timestamp: "2025-10-23 10:23:11",
      user: "María González",
      userId: 2,
      action: "CREATE_APPOINTMENT",
      actionType: "Creación",
      details: "Agendó nueva cita para el paciente Ana Martínez",
      ipAddress: "192.168.1.92",
      status: "success",
      critical: false,
    },
    {
      id: 5,
      timestamp: "2025-10-23 10:45:03",
      user: "Carlos Rodríguez",
      userId: 3,
      action: "DELETE_USER",
      actionType: "Eliminación",
      details: "Eliminó usuario inactivo: Pedro Sánchez (ID: 157)",
      ipAddress: "192.168.1.105",
      status: "success",
      critical: true,
    },
    {
      id: 6,
      timestamp: "2025-10-23 11:08:27",
      user: "Ana Martínez",
      userId: 4,
      action: "LOGIN_FAILED",
      actionType: "Autenticación",
      details: "Intento de inicio de sesión fallido - Contraseña incorrecta",
      ipAddress: "192.168.1.143",
      status: "error",
      critical: false,
    },
    {
      id: 7,
      timestamp: "2025-10-23 11:32:54",
      user: "Dr. Juan Pérez",
      userId: 1,
      action: "GENERATE_REPORT",
      actionType: "Generación",
      details: "Generó reporte de pacientes atendidos - Octubre 2025",
      ipAddress: "192.168.1.87",
      status: "success",
      critical: false,
    },
    {
      id: 8,
      timestamp: "2025-10-23 11:55:19",
      user: "Carlos Rodríguez",
      userId: 3,
      action: "MODIFY_PERMISSIONS",
      actionType: "Modificación",
      details: "Modificó permisos del rol 'Enfermera' - Agregó VIEW_REPORTS",
      ipAddress: "192.168.1.105",
      status: "success",
      critical: true,
    },
    {
      id: 9,
      timestamp: "2025-10-23 12:15:42",
      user: "María González",
      userId: 2,
      action: "CANCEL_APPOINTMENT",
      actionType: "Cancelación",
      details: "Canceló cita del paciente Roberto López por solicitud telefónica",
      ipAddress: "192.168.1.92",
      status: "success",
      critical: false,
    },
    {
      id: 10,
      timestamp: "2025-10-23 12:45:08",
      user: "Dr. Juan Pérez",
      userId: 1,
      action: "LOGOUT",
      actionType: "Autenticación",
      details: "Cerró sesión correctamente",
      ipAddress: "192.168.1.87",
      status: "success",
      critical: false,
    },
  ];

  const actionTypes = [
    "Autenticación",
    "Consulta",
    "Creación",
    "Modificación",
    "Eliminación",
    "Generación",
    "Cancelación",
  ];

  const users = ["Carlos Rodríguez", "Dr. Juan Pérez", "María González", "Ana Martínez"];

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.includes(searchTerm);
    const matchesAction = filterAction === "all" || log.actionType === filterAction;
    const matchesUser = filterUser === "all" || log.user === filterUser;
    return matchesSearch && matchesAction && matchesUser;
  });

  const getActionIcon = (action) => {
    if (action.includes("LOGIN")) return <FiLogIn className="w-5 h-5" />;
    if (action.includes("LOGOUT")) return <FiLogOut className="w-5 h-5" />;
    if (action.includes("VIEW")) return <FiEye className="w-5 h-5" />;
    if (action.includes("EDIT") || action.includes("MODIFY")) return <FiEdit className="w-5 h-5" />;
    if (action.includes("DELETE")) return <FiTrash2 className="w-5 h-5" />;
    return <FiCheck className="w-5 h-5" />;
  };

  const getStatusColor = (status) => {
    if (status === "success") return "bg-green-100 text-green-800";
    if (status === "error") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  const totalLogs = auditLogs.length;
  const successLogs = auditLogs.filter((l) => l.status === "success").length;
  const errorLogs = auditLogs.filter((l) => l.status === "error").length;
  const criticalActions = auditLogs.filter((l) => l.critical).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Auditoría del Sistema</h1>
          <p className="text-gray-600 mt-1">
            Registro completo de actividades y eventos del sistema CENATE
          </p>
        </div>
        <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-200">
          <FiDownload className="w-5 h-5" />
          Exportar Logs
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Eventos</p>
              <p className="text-3xl font-bold mt-1">1.2K</p>
            </div>
            <FiClipboard className="w-12 h-12 opacity-30" />
          </div>
          <p className="text-xs text-blue-100 mt-2">+234 hoy</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Acciones Exitosas</p>
              <p className="text-3xl font-bold mt-1">{successLogs}</p>
            </div>
            <FiCheck className="w-12 h-12 opacity-30" />
          </div>
          <p className="text-xs text-green-100 mt-2">
            {((successLogs / totalLogs) * 100).toFixed(1)}% del total
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Errores</p>
              <p className="text-3xl font-bold mt-1">{errorLogs}</p>
            </div>
            <FiX className="w-12 h-12 opacity-30" />
          </div>
          <p className="text-xs text-red-100 mt-2">
            {((errorLogs / totalLogs) * 100).toFixed(1)}% del total
          </p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Acciones Críticas</p>
              <p className="text-3xl font-bold mt-1">{criticalActions}</p>
            </div>
            <FiAlertCircle className="w-12 h-12 opacity-30" />
          </div>
          <p className="text-xs text-yellow-100 mt-2">Requieren supervisión</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative col-span-2">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por usuario, acción o IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white cursor-pointer"
          >
            <option value="all">Todas las acciones</option>
            {actionTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white cursor-pointer"
          >
            <option value="all">Todos los usuarios</option>
            {users.map((user) => (
              <option key={user} value={user}>
                {user}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Fecha y Hora
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Acción
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Detalles
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  IP
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-gray-700">
                      <FiCalendar className="w-4 h-4 text-gray-400" />
                      {log.timestamp}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {log.user.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-800">{log.user}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {log.critical && <FiAlertCircle className="w-4 h-4 text-red-500" />}
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {log.actionType}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-700 text-sm">{log.details}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-mono">
                      {log.ipAddress}
                    </code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 w-fit ${getStatusColor(
                        log.status
                      )}`}
                    >
                      {log.status === "success" ? (
                        <FiCheck className="w-4 h-4" />
                      ) : (
                        <FiX className="w-4 h-4" />
                      )}
                      {log.status === "success" ? "Exitoso" : "Error"}
                    </span>
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
