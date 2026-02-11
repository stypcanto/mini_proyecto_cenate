import React, { useState, useEffect } from "react";
import { Activity } from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";
import teleeckgService from "../../../../services/teleecgService";
import ClinicalMetricsCard from "../../../../components/teleecgs/ClinicalMetricsCard";

/**
 * 🏥 TeleEKGDashboard - Dashboard Clínico de Electrocardiogramas
 * Monitor de pacientes por nivel de riesgo clínico
 * v1.71.0 - CENATE 2026
 */
export default function TeleEKGDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [ecgs, setEcgs] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    enviadas: 0,
    atendidas: 0,
    rechazadas: 0,
  });

  // Cargar EKGs al montarse el componente
  useEffect(() => {
    cargarEKGs();
    cargarEstadisticas();
  }, []);

  const cargarEKGs = async () => {
    try {
      setLoading(true);
      const response = await teleeckgService.listarImagenes();
      // El servicio retorna directamente los datos (puede ser Page o array)
      const ecgData = response?.content || response?.data || response || [];
      setEcgs(Array.isArray(ecgData) ? ecgData : []);
      console.log("✅ EKGs cargados:", ecgData);
    } catch (error) {
      console.error("❌ Error al cargar EKGs:", error);
      setEcgs([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const response = await teleeckgService.obtenerEstadisticas();
      // El servicio retorna directamente los datos
      const statsData = response || {};
      // v3.0.0: Para usuarios externos (IPRESS/PADOMI), contar estados transformados
      // API debería retornar: totalEnviadas, totalAtendidas, totalRechazadas
      // Fallback: contar localmente si API no retorna los datos
      setStats({
        total: statsData.totalImagenesCargadas || statsData.total || 0,
        enviadas: statsData.totalEnviadas || statsData.totalImagenesPendientes || 0,
        atendidas: statsData.totalAtendidas || statsData.totalImagenesProcesadas || 0,
        rechazadas: statsData.totalRechazadas || statsData.totalImagenesRechazadas || 0,
      });
      console.log("✅ Estadísticas cargadas (v3.0.0):", statsData);
    } catch (error) {
      console.error("❌ Error al cargar estadísticas:", error);
    }
  };


  // Agrupar imágenes por paciente (numDocPaciente)
  const agruparImagenesPorPaciente = (imagenesLista) => {
    const agrupadas = {};

    imagenesLista.forEach(imagen => {
      const key = imagen.numDocPaciente;
      if (!agrupadas[key]) {
        agrupadas[key] = {
          numDocPaciente: imagen.numDocPaciente,
          nombresPaciente: imagen.nombresPaciente,
          apellidosPaciente: imagen.apellidosPaciente,
          telefonoPrincipalPaciente: imagen.telefonoPrincipalPaciente,
          edadPaciente: imagen.edadPaciente,
          generoPaciente: imagen.generoPaciente,
          tiempoTranscurrido: imagen.tiempoTranscurrido,
          imagenes: [],
          estado: imagen.estadoTransformado || imagen.estado,
          esUrgente: imagen.esUrgente,
          fechaPrimera: imagen.fechaEnvio,
        };
      }
      agrupadas[key].imagenes.push(imagen);
    });

    return Object.values(agrupadas);
  };

  // Obtener pacientes agrupados
  const pacientesAgrupados = agruparImagenesPorPaciente(ecgs);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* 🏥 Dashboard Médico - Solo Resumen Clínico */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              📊 Monitor de Electrocardiogramas
            </h1>
          </div>
          <p className="text-gray-600 ml-11">
            Dashboard clínico de priorización y riesgo de pacientes
          </p>
        </div>

        {/* 🏥 Resumen Clínico Médico */}
        <ClinicalMetricsCard estadisticas={stats} ecgs={pacientesAgrupados} />
      </div>

    </div>
  );
}
