// ========================================================================
// 👩‍⚕️ MisPacientesEnfermeria.jsx – Módulo de Mis Pacientes para Enfermería
// ✅ Versión 1.0.0 (2026-01-03)
// ========================================================================

import React, { useState, useEffect } from "react";
import {
  Users, Search, Calendar, Activity, Heart, AlertCircle,
  FileText, ArrowLeft, ChevronRight, Loader, User, Phone
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { getApiBaseUrl } from "../../utils/apiUrlHelper";

const API_URL = getApiBaseUrl();

export default function MisPacientesEnfermeria() {
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [paginaActual, setPaginaActual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    cargarPacientes();
  }, [paginaActual]);

  const cargarPacientes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth.token");

      const response = await axios.get(
        `${API_URL}/enfermeria/mis-pacientes`,
        {
          params: {
            page: paginaActual,
            size: pageSize
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data && response.data.status === 200) {
        const pageData = response.data.data;
        setPacientes(pageData.content || []);
        setTotalPaginas(pageData.totalPages || 0);
        setTotalElementos(pageData.totalElements || 0);
      }
    } catch (error) {
      console.error("Error al cargar pacientes:", error);
      toast.error("Error al cargar la lista de pacientes");
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalle = (pkAsegurado) => {
    navigate(`/enfermeria/paciente/${pkAsegurado}`);
  };

  const pacientesFiltrados = pacientes.filter((p) =>
    p.apellidosNombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.numDoc?.includes(searchTerm)
  );

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    const date = new Date(fecha);
    return date.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Volver al Dashboard</span>
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Mis Pacientes</h1>
                <p className="text-gray-600 mt-1">
                  {totalElementos} {totalElementos === 1 ? "paciente atendido" : "pacientes atendidos"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buscador */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre o DNI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Lista de Pacientes */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader className="w-8 h-8 text-green-600 animate-spin" />
            <span className="ml-3 text-gray-600">Cargando pacientes...</span>
          </div>
        ) : pacientesFiltrados.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No se encontraron pacientes
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? "Intenta con otro término de búsqueda"
                : "Aún no has atendido a ningún paciente"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pacientesFiltrados.map((paciente) => (
              <div
                key={paciente.pkAsegurado}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    {/* Información del Paciente */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {paciente.apellidosNombres}
                          </h3>
                          <p className="text-sm text-gray-600">
                            DNI: {paciente.numDoc} • {paciente.edad} años • {paciente.sexo === "M" ? "Masculino" : "Femenino"}
                          </p>
                        </div>
                      </div>

                      {/* Detalles de la Última Atención */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Última atención</p>
                            <p className="font-medium text-gray-900">
                              {formatearFecha(paciente.ultimaFechaAtencion)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Activity className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Tipo de atención</p>
                            <p className="font-medium text-gray-900">
                              {paciente.ultimaTipoAtencion}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Diagnóstico</p>
                            <p className="font-medium text-gray-900 truncate">
                              {paciente.ultimaDiagnosticoPrincipal}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Información Adicional */}
                      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Heart className="w-4 h-4" />
                          <span>{paciente.totalAtenciones} {paciente.totalAtenciones === 1 ? "atención" : "atenciones"}</span>
                        </div>

                        {paciente.telefono && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            <span>{paciente.telefono}</span>
                          </div>
                        )}

                        {paciente.requiereTelemonitoreo && (
                          <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                            Requiere Telemonitoreo
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Botón de Acción */}
                    <div className="ml-6">
                      <button
                        onClick={() => handleVerDetalle(paciente.pkAsegurado)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg hover:from-green-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg"
                      >
                        <span className="font-medium">Ver Historial</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginación */}
        {!loading && totalPaginas > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => setPaginaActual((prev) => Math.max(0, prev - 1))}
              disabled={paginaActual === 0}
              className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Anterior
            </button>

            <span className="text-gray-700 font-medium">
              Página {paginaActual + 1} de {totalPaginas}
            </span>

            <button
              onClick={() => setPaginaActual((prev) => Math.min(totalPaginas - 1, prev + 1))}
              disabled={paginaActual >= totalPaginas - 1}
              className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
