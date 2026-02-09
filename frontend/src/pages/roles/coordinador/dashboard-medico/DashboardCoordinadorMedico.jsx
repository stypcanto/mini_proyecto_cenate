import React, { useState, useEffect, useMemo } from 'react';
import {
    Users, Activity, Clock, XCircle, Heart,
    FileText, ArrowRightLeft, Download, Calendar
} from 'lucide-react';
import StatCard from '../../../../components/ui/StatCard';
import TablaMedicos from './components/TablaMedicos';
import GraficoEvolucion from './components/GraficoEvolucion';
import ModalDetalleMedico from './components/ModalDetalleMedico';
import FiltrosPeriodo from './components/FiltrosPeriodo';
import coordinadorMedicoService from '../../../../services/coordinadorMedicoService';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';

/**
 * Dashboard de Supervisión para Coordinador Médico
 * v1.63.0 - Módulo completo de supervisión de médicos
 */
export default function DashboardCoordinadorMedico() {
    const [kpis, setKpis] = useState(null);
    const [estadisticasMedicos, setEstadisticasMedicos] = useState([]);
    const [evolucionTemporal, setEvolucionTemporal] = useState([]);
    const [loading, setLoading] = useState(true);
    const [periodo, setPeriodo] = useState('mes'); // 'semana', 'mes', 'año'
    const [medicoSeleccionado, setMedicoSeleccionado] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);

    // Calcular fechas según período
    const { fechaDesde, fechaHasta } = useMemo(() => {
        const hoy = new Date();
        const fechaHastaIso = new Date(hoy.getTime() - hoy.getTimezoneOffset() * 60000).toISOString();

        let fechaDesdeIso;
        const hoyCopia = new Date(hoy);

        switch(periodo) {
            case 'semana':
                hoyCopia.setDate(hoyCopia.getDate() - 7);
                fechaDesdeIso = new Date(hoyCopia.getTime() - hoyCopia.getTimezoneOffset() * 60000).toISOString();
                break;
            case 'mes':
                hoyCopia.setMonth(hoyCopia.getMonth() - 1);
                fechaDesdeIso = new Date(hoyCopia.getTime() - hoyCopia.getTimezoneOffset() * 60000).toISOString();
                break;
            case 'año':
                hoyCopia.setFullYear(hoyCopia.getFullYear() - 1);
                fechaDesdeIso = new Date(hoyCopia.getTime() - hoyCopia.getTimezoneOffset() * 60000).toISOString();
                break;
            default:
                fechaDesdeIso = null;
        }

        return {
            fechaDesde: fechaDesdeIso,
            fechaHasta: fechaHastaIso
        };
    }, [periodo]);

    // Cargar datos
    useEffect(() => {
        cargarDatos();
    }, [fechaDesde, fechaHasta]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [kpisData, medicosData, evolucionData] = await Promise.all([
                coordinadorMedicoService.obtenerKpis(fechaDesde, fechaHasta),
                coordinadorMedicoService.obtenerEstadisticasMedicos(fechaDesde, fechaHasta),
                coordinadorMedicoService.obtenerEvolucionTemporal(fechaDesde, fechaHasta)
            ]);

            setKpis(kpisData);
            setEstadisticasMedicos(medicosData);
            setEvolucionTemporal(evolucionData);
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerDetalleMedico = (medico) => {
        setMedicoSeleccionado(medico);
        setMostrarModal(true);
    };

    const handleExportar = () => {
        coordinadorMedicoService.exportarExcel(estadisticasMedicos);
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Dashboard de Supervisión Médica
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Área: Teleurgencias y Teletriaje
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleExportar}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                        <Download size={20} />
                        Exportar Excel
                    </button>
                </div>
            </div>

            {/* Filtros de Período */}
            <FiltrosPeriodo periodo={periodo} onChange={setPeriodo} />

            {/* KPIs Consolidados */}
            <div className="grid grid-cols-4 gap-4">
                <StatCard
                    icon={Users}
                    label="Total Pacientes"
                    value={kpis?.totalPacientes || 0}
                    color="blue"
                />
                <StatCard
                    icon={Activity}
                    label="Atendidos"
                    value={kpis?.totalAtendidos || 0}
                    trend={`${kpis?.tasaCompletacion?.toFixed(1) || 0}%`}
                    color="green"
                />
                <StatCard
                    icon={Clock}
                    label="Pendientes"
                    value={kpis?.totalPendientes || 0}
                    color="orange"
                />
                <StatCard
                    icon={XCircle}
                    label="Deserciones"
                    value={kpis?.totalDeserciones || 0}
                    trend={`${kpis?.tasaDesercion?.toFixed(1) || 0}%`}
                    color="red"
                />
            </div>

            {/* KPIs Adicionales */}
            <div className="grid grid-cols-4 gap-4">
                <StatCard
                    icon={Heart}
                    label="Pacientes Crónicos"
                    value={kpis?.totalCronicos || 0}
                    color="purple"
                />
                <StatCard
                    icon={FileText}
                    label="Recitas Generadas"
                    value={kpis?.totalRecitas || 0}
                    color="teal"
                />
                <StatCard
                    icon={ArrowRightLeft}
                    label="Interconsultas"
                    value={kpis?.totalInterconsultas || 0}
                    color="indigo"
                />
                <StatCard
                    icon={Clock}
                    label="Tiempo Promedio"
                    value={`${kpis?.horasPromedio?.toFixed(1) || 0}h`}
                    color="gray"
                />
            </div>

            {/* Gráfico de Evolución Temporal */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-bold mb-4">Evolución de Atenciones</h3>
                <GraficoEvolucion data={evolucionTemporal} />
            </div>

            {/* Tabla de Médicos */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-bold mb-4">
                    Rendimiento por Médico ({estadisticasMedicos.length} médicos activos)
                </h3>
                <TablaMedicos
                    medicos={estadisticasMedicos}
                    onVerDetalle={handleVerDetalleMedico}
                />
            </div>

            {/* Modal de Detalle */}
            {mostrarModal && medicoSeleccionado && (
                <ModalDetalleMedico
                    medico={medicoSeleccionado}
                    onClose={() => {
                        setMostrarModal(false);
                        setMedicoSeleccionado(null);
                    }}
                    fechaDesde={fechaDesde}
                    fechaHasta={fechaHasta}
                />
            )}
        </div>
    );
}
