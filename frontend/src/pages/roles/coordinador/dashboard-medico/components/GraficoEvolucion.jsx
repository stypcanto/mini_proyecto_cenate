import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer
} from 'recharts';

/**
 * Gráfico de evolución temporal de atenciones
 * Muestra tendencia de atendidos, pendientes y deserciones por día
 */
export default function GraficoEvolucion({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No hay datos de evolución para mostrar
            </div>
        );
    }

    // Transformar los datos para compatibilidad con Recharts
    const chartData = data.map(item => ({
        ...item,
        fecha: item.fecha ? new Date(item.fecha).toLocaleDateString('es-PE') : 'N/A'
    }));

    return (
        <ResponsiveContainer width="100%" height={400}>
            <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="fecha"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                    }}
                    formatter={(value) => value ? value.toFixed(0) : '0'}
                />
                <Legend />
                <Line
                    type="monotone"
                    dataKey="atendidos"
                    stroke="#22c55e"
                    strokeWidth={2}
                    name="Atendidos"
                    dot={{ fill: '#22c55e' }}
                />
                <Line
                    type="monotone"
                    dataKey="pendientes"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="Pendientes"
                    dot={{ fill: '#f59e0b' }}
                />
                <Line
                    type="monotone"
                    dataKey="deserciones"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="Deserciones"
                    dot={{ fill: '#ef4444' }}
                />
                <Line
                    type="monotone"
                    dataKey="totalAtenciones"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Total"
                    dot={{ fill: '#3b82f6' }}
                    strokeDasharray="5 5"
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
