// ========================================================================
// 👤 GestionAsegurado.jsx – Gestión de Citas y Asegurados
// ========================================================================
// Rediseño v1.41.0: Tabla de Pacientes Asignados como foco principal
// Integración real con /api/bolsas/solicitudes/mi-bandeja
// ========================================================================

import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { getToken } from "../../../constants/auth";
import {
  Users,
  CheckCircle2,
  Calendar,
  AlertCircle,
  UserPlus,
  RefreshCw,
  Lock,
  ArrowRight,
  Edit2,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";

export default function GestionAsegurado() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pacientesAsignados, setPacientesAsignados] = useState([]);
  const [metrics, setMetrics] = useState({
    totalPacientes: 0,
    pacientesAtendidos: 0,
    pacientesPendientes: 0,
    solicitudesPendientes: 0,
  });
  const [error, setError] = useState(null);
  const [modalTelefono, setModalTelefono] = useState({
    visible: false,
    paciente: null,
    telefonoPrincipal: "",
    telefonoAlterno: "",
    saving: false,
  });

  const [estadoEditando, setEstadoEditando] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState("");
  const [estadosDisponibles] = useState([
    { codigo: "PENDIENTE_CITA", descripcion: "Paciente nuevo que ingresó a la bolsa" },
    { codigo: "CITADO", descripcion: "Citado - Paciente agendado para atención" },
    { codigo: "ATENDIDO_IPRESS", descripcion: "Atendido por IPRESS - Paciente recibió atención en institución" },
    { codigo: "NO_CONTESTA", descripcion: "No contesta - Paciente no responde a las llamadas" },
    { codigo: "NO_DESEA", descripcion: "No desea - Paciente rechaza la atención" },
    { codigo: "APAGADO", descripcion: "Apagado - Teléfono del paciente apagado" },
    { codigo: "TEL_SIN_SERVICIO", descripcion: "Teléfono sin servicio - Línea telefónica sin servicio" },
    { codigo: "NUM_NO_EXISTE", descripcion: "Número no existe - Teléfono registrado no existe" },
    { codigo: "SIN_VIGENCIA", descripcion: "Sin vigencia de Seguro - Seguro del paciente no vigente" },
    { codigo: "HC_BLOQUEADA", descripcion: "Historia clínica bloqueada - HC del paciente bloqueada en sistema" },
    { codigo: "REPROG_FALLIDA", descripcion: "Reprogramación Fallida - No se pudo reprogramar la cita" },
  ]);

  const API_BASE = "http://localhost:8080/api";

  // Fetch assigned patients from backend
  const fetchPacientesAsignados = async () => {
    try {
      const token = getToken();
      console.log("📥 Fetching assigned patients from /api/bolsas/solicitudes/mi-bandeja");
      console.log("🔐 Token disponible:", token ? "✅ Sí" : "❌ No");
      console.log("🔐 Token value:", token ? `${token.substring(0, 20)}...` : "null");

      if (!token) {
        console.error("❌ No hay token disponible en localStorage");
        setError("No hay sesión activa. Por favor, inicia sesión nuevamente.");
        return;
      }

      const response = await fetch(
        `${API_BASE}/bolsas/solicitudes/mi-bandeja`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
      console.log("📋 Response Headers:", {
        "content-type": response.headers.get("content-type"),
        "content-length": response.headers.get("content-length"),
      });

      if (!response.ok) {
        console.warn(`❌ Error fetching mi-bandeja: Status ${response.status}`);
        const responseText = await response.text();
        console.error("Response text:", responseText);
        try {
          const errorData = JSON.parse(responseText);
          console.error("Error details (JSON):", errorData);
        } catch (e) {
          console.error("Could not parse error as JSON");
        }
        setPacientesAsignados([]);
        setError(`Error al obtener pacientes: ${response.status} ${response.statusText}`);
        return;
      }

      const data = await response.json();
      console.log("📦 Response structure:", data);
      console.log("📦 Response keys:", Object.keys(data));

      // The endpoint returns { total, solicitudes, mensaje }
      const solicitudes = data?.solicitudes || data?.data?.content || data?.content || [];

      console.log(`✅ Found ${solicitudes.length} assigned patient(s)`);
      if (solicitudes.length > 0) {
        console.log("📋 Sample solicitud:", solicitudes[0]);
        console.log("📋 Campos disponibles en solicitud[0]:", Object.keys(solicitudes[0]));
        console.log("📋 paciente_edad:", solicitudes[0].paciente_edad);
        console.log("📋 pacienteEdad:", solicitudes[0].pacienteEdad);
      }

      // Transform SolicitudBolsaDTO to table structure
      const pacientes = solicitudes.map((solicitud, idx) => ({
        id: solicitud.id_solicitud || solicitud.idSolicitud || idx,
        numeroSolicitud: solicitud.numero_solicitud || solicitud.numeroSolicitud || "-",
        pacienteDni: solicitud.paciente_dni || solicitud.pacienteDni || "-",
        pacienteNombre: solicitud.paciente_nombre || solicitud.pacienteNombre || "-",
        pacienteEdad: solicitud.paciente_edad || solicitud.pacienteEdad || "-",
        pacienteSexo: solicitud.paciente_sexo || solicitud.pacienteSexo || "-",
        pacienteTelefono: solicitud.paciente_telefono || solicitud.pacienteTelefono || "-",
        pacienteTelefonoAlterno: solicitud.paciente_telefono_alterno || solicitud.pacienteTelefonoAlterno || "-",
        especialidad: solicitud.especialidad || "-",
        tipoCita: solicitud.tipo_cita || solicitud.tipoCita || "-",
        descIpress: solicitud.desc_ipress || solicitud.descIpress || "-",
        descEstadoCita: solicitud.desc_estado_cita || solicitud.descEstadoCita || "PENDIENTE",
        fechaSolicitud: solicitud.fecha_solicitud || solicitud.fechaSolicitud || new Date().toISOString(),
        fechaAsignacion: solicitud.fecha_asignacion || solicitud.fechaAsignacion || "-",
      }));

      setPacientesAsignados(pacientes);

      // Calculate metrics
      const atendidos = pacientes.filter(p => p.descEstadoCita === "ATENDIDA").length;
      const pendientes = pacientes.filter(p => p.descEstadoCita === "PENDIENTE").length;

      setMetrics({
        totalPacientes: pacientes.length,
        pacientesAtendidos: atendidos,
        pacientesPendientes: pendientes,
        solicitudesPendientes: pendientes,
      });
    } catch (err) {
      console.error("Error fetching assigned patients:", err);
      setPacientesAsignados([]);
    }
  };

  // Abrir modal para actualizar teléfono
  const abrirModalTelefono = (paciente) => {
    setModalTelefono({
      visible: true,
      paciente,
      telefonoPrincipal: paciente.pacienteTelefono || "",
      telefonoAlterno: paciente.pacienteTelefonoAlterno || "",
      saving: false,
    });
  };

  // Cerrar modal
  const cerrarModalTelefono = () => {
    setModalTelefono({
      visible: false,
      paciente: null,
      telefonoPrincipal: "",
      telefonoAlterno: "",
      saving: false,
    });
  };

  // Actualizar estado de cita
  const actualizarEstado = async (pacienteId, nuevoEstadoCodigo) => {
    try {
      const token = getToken();
      const response = await fetch(
        `${API_BASE}/bolsas/solicitudes/${pacienteId}/estado?nuevoEstadoCodigo=${encodeURIComponent(nuevoEstadoCodigo)}`,
        {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        toast.success("Estado actualizado correctamente");
        setEstadoEditando(null);
        await fetchPacientesAsignados();
      } else {
        const errorData = await response.json();
        console.error("Error details:", errorData);
        toast.error(errorData.error || "Error al actualizar el estado");
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("Error al actualizar el estado");
    }
  };

  // Guardar teléfono actualizado
  const guardarTelefono = async () => {
    if (!modalTelefono.telefonoPrincipal && !modalTelefono.telefonoAlterno) {
      toast.error("Al menos uno de los teléfonos es requerido");
      return;
    }

    setModalTelefono({ ...modalTelefono, saving: true });

    try {
      const token = getToken();
      const response = await fetch(
        `${API_BASE}/bolsas/solicitudes/${modalTelefono.paciente.id}/actualizar-telefonos`,
        {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pacienteTelefono: modalTelefono.telefonoPrincipal,
            pacienteTelefonoAlterno: modalTelefono.telefonoAlterno,
          }),
        }
      );

      if (response.ok) {
        toast.success("Teléfono actualizado correctamente");
        cerrarModalTelefono();
        await fetchPacientesAsignados();
      } else {
        toast.error("Error al actualizar el teléfono");
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("Error al actualizar el teléfono");
    } finally {
      setModalTelefono({ ...modalTelefono, saving: false });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
        await fetchPacientesAsignados();
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Error al cargar los datos. Por favor, intente de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Cargando pacientes asignados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-slate-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl shadow-lg p-8 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                {user?.nombreCompleto?.charAt(0) || "U"}
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  Bienvenid(a), {user?.nombreCompleto?.split(" ")[0] || "Usuario"}
                </h1>
                <p className="text-blue-100 text-sm mt-1">
                  Gestor de Citas - Gestión de Pacientes Asignados
                </p>
                <div className="flex gap-3 mt-3">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
                    Rol: GESTOR DE CITAS
                  </span>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
                    📅 {new Date().toLocaleDateString("es-ES", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-gray-600 text-sm">Total de Pacientes</p>
                <p className="text-3xl font-bold text-slate-900">{metrics.totalPacientes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <div>
                <p className="text-gray-600 text-sm">Pacientes Atendidos</p>
                <p className="text-3xl font-bold text-slate-900">{metrics.pacientesAtendidos}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-yellow-600" />
              <div>
                <p className="text-gray-600 text-sm">Pacientes Pendientes</p>
                <p className="text-3xl font-bold text-slate-900">{metrics.pacientesPendientes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div>
                <p className="text-gray-600 text-sm">Solicitudes Pendientes</p>
                <p className="text-3xl font-bold text-slate-900">{metrics.solicitudesPendientes}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sección Principal: Pacientes Asignados */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Mi Bandeja de Pacientes</h2>
                <p className="text-blue-100 text-sm mt-1">
                  Pacientes asignados desde el módulo de Bolsas de Pacientes
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    window.location.href = "/bolsas/solicitudes";
                  }}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Asignar Pacientes
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    console.log("🔄 Recargando pacientes asignados...");
                    setLoading(true);
                    fetchPacientesAsignados().finally(() => setLoading(false));
                  }}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Actualizar
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {pacientesAsignados.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No tienes pacientes asignados aún</p>
                <button
                  onClick={() => {
                    window.location.href = "/bolsas/solicitudes";
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 inline-flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Ir a Asignar Pacientes
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-3 text-left font-semibold text-gray-700">
                        DNI Paciente
                      </th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700">
                        Nombre Paciente
                      </th>
                      <th className="px-6 py-3 text-center font-semibold text-gray-700">
                        Edad
                      </th>
                      <th className="px-6 py-3 text-center font-semibold text-gray-700">
                        Género
                      </th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700">
                        Especialidad
                      </th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700">
                        IPRESS
                      </th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700">
                        Tipo de Cita
                      </th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700">
                        Teléfono
                      </th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700">
                        Whatsapp
                      </th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700">
                        Fecha Asignación
                      </th>
                      <th className="px-6 py-3 text-center font-semibold text-gray-700">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pacientesAsignados.map((paciente, idx) => (
                      <tr
                        key={paciente.id}
                        className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                          idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {paciente.pacienteDni}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {paciente.pacienteNombre}
                        </td>
                        <td className="px-6 py-4 text-center text-slate-600">
                          {paciente.pacienteEdad}
                        </td>
                        <td className="px-6 py-4 text-center text-slate-600">
                          {paciente.pacienteSexo}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {paciente.especialidad}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            {paciente.descIpress}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {paciente.tipoCita}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {paciente.pacienteTelefono}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {paciente.pacienteTelefonoAlterno}
                        </td>
                        <td className="px-6 py-4">
                          {estadoEditando === paciente.id ? (
                            <select
                              value={nuevoEstado}
                              onChange={(e) => {
                                setNuevoEstado(e.target.value);
                                if (e.target.value) {
                                  actualizarEstado(paciente.id, e.target.value);
                                }
                              }}
                              className="px-3 py-1 border border-blue-300 rounded-lg text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              autoFocus
                            >
                              <option value="">Seleccionar estado...</option>
                              {estadosDisponibles.map((est) => (
                                <option key={est.codigo} value={est.codigo} title={est.descripcion}>
                                  {est.codigo}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  paciente.descEstadoCita === "ATENDIDA"
                                    ? "bg-green-100 text-green-800"
                                    : paciente.descEstadoCita === "PENDIENTE"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {paciente.descEstadoCita || "Sin estado"}
                              </span>
                              <button
                                onClick={() => {
                                  setEstadoEditando(paciente.id);
                                  setNuevoEstado(paciente.estado || "");
                                }}
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                title="Cambiar estado"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-xs">
                          {paciente.fechaAsignacion === "-"
                            ? "-"
                            : new Date(paciente.fechaAsignacion).toLocaleDateString("es-ES")}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => abrirModalTelefono(paciente)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors"
                            title="Actualizar teléfonos"
                          >
                            📱 Teléfono
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Actualizar Teléfono */}
      {modalTelefono.visible && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-6 text-white rounded-t-2xl">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <span>📱</span>
                <span>Actualizar Teléfonos</span>
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Paciente:</p>
                <p className="text-gray-900 font-medium">
                  {modalTelefono.paciente?.pacienteNombre}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Teléfono Principal
                </label>
                <input
                  type="tel"
                  value={modalTelefono.telefonoPrincipal}
                  onChange={(e) =>
                    setModalTelefono({
                      ...modalTelefono,
                      telefonoPrincipal: e.target.value,
                    })
                  }
                  placeholder="Ej: 987654321"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Teléfono Alterno
                </label>
                <input
                  type="tel"
                  value={modalTelefono.telefonoAlterno}
                  onChange={(e) =>
                    setModalTelefono({
                      ...modalTelefono,
                      telefonoAlterno: e.target.value,
                    })
                  }
                  placeholder="Ej: 912345678"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <p className="text-xs text-gray-500">
                * Al menos uno de los teléfonos es requerido
              </p>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={cerrarModalTelefono}
                  disabled={modalTelefono.saving}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarTelefono}
                  disabled={modalTelefono.saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {modalTelefono.saving ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Guardando...
                    </>
                  ) : (
                    "Guardar"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
