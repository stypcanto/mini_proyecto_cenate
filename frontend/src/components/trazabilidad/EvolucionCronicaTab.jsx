import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, TrendingUp, Activity } from 'lucide-react';
import { evolucionCronicaService } from '../../services/evolucionCronicaService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

/**
 * Dashboard de Evolución para Pacientes Crónicos CENACRON
 * Muestra gráficos, métricas y alertas de evolución de tratamiento
 */
export default function EvolucionCronicaTab({ pkAsegurado }) {
    const [datos, setDatos] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mesesVista, setMesesVista] = useState(6);

    useEffect(() => {
        cargarEvolucion();
    }, [pkAsegurado, mesesVista]);

    const cargarEvolucion = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await evolucionCronicaService.obtenerEvolucion(pkAsegurado, mesesVista);
            setDatos(response);
        } catch (err) {
            console.error('Error al cargar evolución:', err);
            setError('No se pudo cargar la evolución del paciente');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">Cargando dashboard...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-96">
                <AlertCircle className="w-8 h-8 text-red-500" />
                <span className="ml-2 text-red-600">{ error }</span>
            </div>
        );
    }

    if (!datos || datos.totalAtenciones === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <Activity className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-600 text-lg">No hay datos de atenciones en el período seleccionado</p>
                <p className="text-gray-500 text-sm mt-2">Selecciona un período diferente</p>
            </div>
        );
    }

    const getEstadoColor = () => {
        switch (datos.estadoGeneral) {
            case 'CONTROL_OPTIMO': return 'bg-green-100 text-green-800 border-green-300';
            case 'CONTROL_REGULAR': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'DESCONTROL': return 'bg-red-100 text-red-800 border-red-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getEstadoLabel = () => {
        switch (datos.estadoGeneral) {
            case 'CONTROL_OPTIMO': return '🟢 Control Óptimo';
            case 'CONTROL_REGULAR': return '🟡 Control Regular';
            case 'DESCONTROL': return '🔴 Descontrol';
            default: return '⚪ Sin Datos';
        }
    };

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            {/* Header con filtros */ }
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Activity className="w-7 h-7 text-blue-600" />
                        Dashboard Paciente Crónico - CENACRON
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">{ datos.nombrePaciente }</p>
                </div>
                <select
                    value={ mesesVista }
                    onChange={ (e) => setMesesVista(Number(e.target.value)) }
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value={ 3 }>Últimos 3 meses</option>
                    <option value={ 6 }>Últimos 6 meses</option>
                    <option value={ 12 }>Último año</option>
                </select>
            </div>

            {/* Resumen Ejecutivo */ }
            <div className={ `p-6 rounded-xl border-2 ${getEstadoColor()}` }>
                <h3 className="text-lg font-bold mb-3">📊 Resumen Ejecutivo</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-sm font-medium">Estado General</p>
                        <p className="text-xl font-bold">{ getEstadoLabel() }</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium">Última Consulta</p>
                        <p className="text-xl font-bold">Hace { datos.diasDesdeUltimaAtencion }d</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium">PA Actual</p>
                        <p className="text-xl font-bold">{ datos.metricas?.presionActual || 'N/A' }</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium">IMC Actual</p>
                        <p className="text-xl font-bold">{ datos.metricas?.imcActual?.toFixed(1) || 'N/A' }</p>
                    </div>
                </div>
            </div>

            {/* Gráficos */ }
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico de Presión Arterial */ }
                <div className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-red-600" />
                        Presión Arterial
                    </h3>
                    { datos.seriePresionArterial && datos.seriePresionArterial.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={ 250 }>
                                <LineChart data={ datos.seriePresionArterial.slice().reverse() }>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="fecha"
                                        tickFormatter={ (fecha) => new Date(fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }) }
                                        angle={ -45 }
                                        textAnchor="end"
                                        height={ 60 }
                                    />
                                    <YAxis domain={ [60, 200] } />
                                    <Tooltip
                                        labelFormatter={ (fecha) => new Date(fecha).toLocaleDateString('es-PE') }
                                        formatter={ (value, name) => [value + ' mmHg', name === 'sistolica' ? 'Sistólica' : 'Diastólica'] }
                                    />
                                    <Legend />
                                    <ReferenceLine y={ 130 } stroke="#22c55e" strokeDasharray="3 3" label={ { value: 'Objetivo: 130', position: 'right' } } />
                                    <ReferenceLine y={ 80 } stroke="#3b82f6" strokeDasharray="3 3" label={ { value: 'Objetivo: 80', position: 'right' } } />
                                    <Line type="monotone" dataKey="sistolica" stroke="#ef4444" strokeWidth={ 2 } dot={ { r: 4 } } name="Sistólica" />
                                    <Line type="monotone" dataKey="diastolica" stroke="#3b82f6" strokeWidth={ 2 } dot={ { r: 4 } } name="Diastólica" />
                                </LineChart>
                            </ResponsiveContainer>
                            <div className="mt-4 text-sm text-gray-600">
                                <p><strong>Objetivo:</strong> { '<' }130/80 mmHg</p>
                                <p><strong>Actual:</strong> { datos.metricas?.presionActual }</p>
                            </div>
                        </>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No hay datos de presión arterial</p>
                    ) }
                </div>

                {/* Gráfico de Peso e IMC */ }
                <div className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                        Peso e IMC
                    </h3>
                    { datos.seriePesoIMC && datos.seriePesoIMC.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={ 250 }>
                                <LineChart data={ datos.seriePesoIMC.slice().reverse() }>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="fecha"
                                        tickFormatter={ (fecha) => new Date(fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }) }
                                        angle={ -45 }
                                        textAnchor="end"
                                        height={ 60 }
                                    />
                                    <YAxis yAxisId="left" domain={ [15, 45] } label={ { value: 'IMC', angle: -90, position: 'insideLeft' } } />
                                    <YAxis yAxisId="right" orientation="right" label={ { value: 'Peso (kg)', angle: 90, position: 'insideRight' } } />
                                    <Tooltip
                                        labelFormatter={ (fecha) => new Date(fecha).toLocaleDateString('es-PE') }
                                    />
                                    <Legend />
                                    <ReferenceLine yAxisId="left" y={ 30 } stroke="#f59e0b" strokeDasharray="3 3" label="IMC 30" />
                                    <Line yAxisId="left" type="monotone" dataKey="imc" stroke="#8b5cf6" strokeWidth={ 2 } dot={ { r: 4 } } name="IMC" />
                                    <Line yAxisId="right" type="monotone" dataKey="peso" stroke="#10b981" strokeWidth={ 2 } dot={ { r: 4 } } name="Peso (kg)" />
                                </LineChart>
                            </ResponsiveContainer>
                            <div className="mt-4 text-sm text-gray-600">
                                <p><strong>Objetivo IMC:</strong> { '<' }30</p>
                                <p><strong>IMC Actual:</strong> { datos.metricas?.imcActual?.toFixed(1) }</p>
                            </div>
                        </>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No hay datos de peso e IMC</p>
                    ) }
                </div>
            </div>

            {/* Métricas de Control */ }
            <div className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold mb-4">📈 Métricas de Control</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MetricCard
                        label="PA en Control"
                        valor={ datos.metricas?.porcentajePAEnObjetivo }
                        objetivo={ 70 }
                        icon="🩺"
                    />
                    <MetricCard
                        label="Peso Estable"
                        valor={ datos.metricas?.porcentajePesoEstable }
                        objetivo={ 80 }
                        icon="⚖️"
                    />
                    <MetricCard
                        label="Adherencia"
                        valor={ datos.metricas?.porcentajeAdherencia }
                        objetivo={ 80 }
                        icon="💊"
                    />
                    <MetricCard
                        label="Asistencia"
                        valor={ datos.metricas?.porcentajeAsistencia }
                        objetivo={ 80 }
                        icon="📅"
                    />
                </div>
            </div>

            {/* Alertas y Recomendaciones */ }
            { datos.alertas && datos.alertas.length > 0 && (
                <div className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold mb-4">⚠️ Alertas y Recomendaciones</h3>
                    <div className="space-y-3">
                        { datos.alertas.map((alerta, index) => (
                            <div
                                key={ index }
                                className={ `p-4 rounded-lg border-l-4 ${alerta.nivel === 'ALTA' ? 'bg-red-50 border-red-500' :
                                        alerta.nivel === 'MEDIA' ? 'bg-yellow-50 border-yellow-500' :
                                            'bg-green-50 border-green-500'
                                    }` }
                            >
                                <p className="font-semibold">
                                    { alerta.icono } { alerta.mensaje }
                                </p>
                            </div>
                        )) }
                    </div>
                </div>
            ) }
        </div>
    );
}

// Componente auxiliar para tarjetas de métricas
function MetricCard({ label, valor, objetivo, icon }) {
    const porcentaje = valor || 0;
    const cumpleObjetivo = porcentaje >= objetivo;

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border-2 border-blue-200">
            <div className="text-3xl mb-2">{ icon }</div>
            <div className="text-sm text-gray-600 font-medium">{ label }</div>
            <div className="text-3xl font-bold text-gray-900 my-1">
                { porcentaje.toFixed(0) }%
            </div>
            <div className={ `text-xs font-semibold ${cumpleObjetivo ? 'text-green-600' : 'text-yellow-600'}` }>
                { cumpleObjetivo ? '✓' : '⚠️' } Objetivo: { objetivo }%
            </div>
        </div>
    );
}
