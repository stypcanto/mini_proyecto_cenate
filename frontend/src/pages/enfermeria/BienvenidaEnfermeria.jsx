// ========================================================================
// 👋 BienvenidaEnfermeria.jsx – Pantalla de Bienvenida Módulo Enfermería
// ------------------------------------------------------------------------
// Muestra información del profesional de enfermería y accesos rápidos
// Versión: v1.16.2
// ========================================================================

import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Shield,
  Heart,
  Activity,
  Users,
  Calendar,
  CheckCircle2,
  Sparkles,
  FileText,
  Stethoscope,
  ClipboardList,
  ArrowRight
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { getApiBaseUrl } from "../../utils/apiUrlHelper";

const API_URL = getApiBaseUrl();

export default function BienvenidaEnfermeria() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState(null);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth.token");

      // Cargar estadísticas básicas del usuario
      const response = await axios.get(
        `${API_URL}/enfermeria/mis-pacientes`,
        {
          params: { page: 0, size: 1 },
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data && response.data.status === 200) {
        setEstadisticas({
          totalPacientes: response.data.data.totalElements || 0
        });
      }
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fechaString) => {
    if (!fechaString) return "—";
    try {
      const fecha = new Date(fechaString);
      return fecha.toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return "—";
    }
  };

  // 🎯 Determinar saludo según género
  const obtenerSaludo = () => {
    const genero = user?.genero?.toUpperCase() || '';
    if (genero === 'F' || genero === 'FEMENINO') return '¡Bienvenida al Módulo de Enfermería!';
    if (genero === 'M' || genero === 'MASCULINO') return '¡Bienvenido al Módulo de Enfermería!';
    return '¡Bienvenido(a) al Módulo de Enfermería!';
  };

  // Accesos rápidos para enfermería
  const accesoRapido = [
    {
      titulo: "Mis Pacientes",
      descripcion: "Ver lista completa de pacientes atendidos",
      icono: Users,
      color: "from-green-500 to-teal-600",
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
      ruta: "/enfermeria/mis-pacientes"
    },
    {
      titulo: "Dashboard Enfermería",
      descripcion: "Estadísticas y métricas del módulo",
      icono: Activity,
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
      ruta: "/enfermeria/dashboard",
      soloSuperadmin: true
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 p-8">
      <div className="w-full">
        {/* Header de Bienvenida */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-green-600" />
            <h1 className="text-4xl font-bold text-gray-800">
              {obtenerSaludo()}
            </h1>
          </div>
          <p className="text-gray-600 text-lg ml-11">
            {formatearFecha(new Date())}
          </p>
        </div>

        {/* Card Principal - Información del Usuario */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-green-500 to-teal-600 p-6">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg">
                <Heart className="w-12 h-12 text-green-600" />
              </div>

              {/* Información Principal */}
              <div className="flex-1 text-white">
                <h2 className="text-3xl font-bold mb-2">
                  {user?.nombreCompleto || "Usuario"}
                </h2>
                <div className="flex items-center gap-2 text-green-100">
                  <Mail className="w-4 h-4" />
                  <span>DNI: {user?.username || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-green-100 mt-1">
                  <Stethoscope className="w-4 h-4" />
                  <span>Profesional de Enfermería</span>
                </div>
              </div>

              {/* Badge de Estado */}
              <div className="bg-white bg-opacity-20 px-6 py-3 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">Cuenta Activa</span>
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas Rápidas */}
          {estadisticas && (
            <div className="p-8 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-green-600" />
                Resumen de Actividad
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Pacientes Atendidos</p>
                      <p className="text-3xl font-bold text-green-600 mt-1">
                        {estadisticas.totalPacientes}
                      </p>
                    </div>
                    <Users className="w-10 h-10 text-green-600 opacity-50" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Estado del Sistema</p>
                      <p className="text-lg font-bold text-blue-600 mt-1">Operativo</p>
                    </div>
                    <Activity className="w-10 h-10 text-blue-600 opacity-50" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Última Actualización</p>
                      <p className="text-sm font-semibold text-purple-600 mt-1">
                        {new Date().toLocaleDateString('es-PE')}
                      </p>
                    </div>
                    <Calendar className="w-10 h-10 text-purple-600 opacity-50" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Detalles de la Cuenta */}
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* DNI */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">DNI</p>
                <p className="text-lg font-semibold text-gray-800">
                  {user?.username || "—"}
                </p>
              </div>
            </div>

            {/* Rol */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">Rol Principal</p>
                <p className="text-lg font-semibold text-gray-800">
                  Enfermería
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Accesos Rápidos */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Heart className="w-7 h-7 text-green-600" />
            <h3 className="text-2xl font-bold text-gray-800">
              Accesos Rápidos
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {accesoRapido.map((acceso, index) => {
              // Filtrar Dashboard solo para SUPERADMIN
              if (acceso.soloSuperadmin && !user?.roles?.includes('SUPERADMIN')) {
                return null;
              }

              const IconComponent = acceso.icono;

              return (
                <button
                  key={index}
                  onClick={() => navigate(acceso.ruta)}
                  className="group relative bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border-2 border-gray-200 hover:border-green-400 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 ${acceso.bgColor} rounded-lg group-hover:scale-110 transition-transform`}>
                      <IconComponent className={`w-6 h-6 ${acceso.iconColor}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-green-600 transition-colors">
                        {acceso.titulo}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {acceso.descripcion}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer con información adicional */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Módulo de Enfermería – Sistema CENATE EsSalud 2026
          </p>
          <p className="text-xs text-gray-400 mt-1">
            v1.16.2 | Para soporte técnico: cenate.analista@essalud.gob.pe
          </p>
        </div>
      </div>
    </div>
  );
}
