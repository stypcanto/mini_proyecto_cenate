import React, { useState, useEffect } from 'react';
import { Activity, FileText } from 'lucide-react';
import HistorialAtencionesTab from './HistorialAtencionesTab';
import EvolucionCronicaTab from './EvolucionCronicaTab';
import { evolucionCronicaService } from '../../services/evolucionCronicaService';

/**
 * Componente wrapper que gestiona las pestañas de trazabilidad clínica
 * Muestra tab de "Evolución Crónica" solo para pacientes CENACRON con HTA/DM
 */
export default function TrazabilidadClinicaTabs({ pkAsegurado }) {
    const [tabActiva, setTabActiva] = useState('historial');
    const [esElegible, setEsElegible] = useState(false);
    const [verificandoElegibilidad, setVerificandoElegibilidad] = useState(true);

    useEffect(() => {
        verificarElegibilidad();
    }, [pkAsegurado]);

    const verificarElegibilidad = async () => {
        setVerificandoElegibilidad(true);
        try {
            const response = await evolucionCronicaService.verificarElegibilidad(pkAsegurado);
            // ✅ FIX: Acceder a response.data.elegible en lugar de response.elegible
            setEsElegible(response?.data?.elegible || false);
        } catch (error) {
            console.error('Error al verificar elegibilidad:', error);
            setEsElegible(false);
        } finally {
            setVerificandoElegibilidad(false);
        }
    };

    return (
        <div className="w-full">
            {/* Navegación de pestañas */ }
            { !verificandoElegibilidad && (
                <div className="rounded-xl mb-6 border border-blue-200 bg-blue-50/60 backdrop-blur-sm shadow-sm p-1.5">
                    <div className={ `grid grid-cols-1 ${esElegible ? 'md:grid-cols-2' : ''} gap-2` }>
                        {/* Pestaña Historial (Siempre visible) */ }
                        <button
                            onClick={ () => setTabActiva('historial') }
                            className={ `group relative flex items-center justify-center gap-2.5 px-5 py-3.5 text-sm font-semibold rounded-lg transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${tabActiva === 'historial'
                                    ? 'bg-blue-500 text-white shadow-md'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                                }` }
                        >
                            <div className={ `p-1.5 rounded-md transition-colors duration-200 ${tabActiva === 'historial' ? 'bg-white/20' : 'bg-blue-100/70 group-hover:bg-blue-100'}` }>
                                <FileText className={ `w-4 h-4 transition-colors duration-200 ${tabActiva === 'historial' ? 'text-white' : 'text-slate-600 group-hover:text-slate-700'}` } />
                            </div>
                            <span>Historial de Atenciones</span>
                            { tabActiva === 'historial' && (
                                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 h-1 bg-blue-500 rounded-full shadow-sm" />
                            ) }
                        </button>

                        {/* Pestaña Evolución Crónica (Solo para CENACRON con HTA/DM) */ }
                        { esElegible && (
                            <button
                                onClick={ () => setTabActiva('evolucion') }
                                className={ `group relative flex items-center justify-center gap-2.5 px-5 py-3.5 text-sm font-semibold rounded-lg transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${tabActiva === 'evolucion'
                                        ? 'bg-blue-500 text-white shadow-md'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                                    }` }
                            >
                                <div className={ `p-1.5 rounded-md transition-colors duration-200 ${tabActiva === 'evolucion' ? 'bg-white/20' : 'bg-blue-100/70 group-hover:bg-blue-100'}` }>
                                    <Activity className={ `w-4 h-4 transition-colors duration-200 ${tabActiva === 'evolucion' ? 'text-white' : 'text-slate-600 group-hover:text-slate-700'}` } />
                                </div>
                                <span>Evolución Crónica</span>
                                <span className={ `px-2 py-0.5 text-xs rounded-full font-bold ring-1 ring-green-200 transition-all duration-200 ${tabActiva === 'evolucion'
                                    ? 'bg-green-500 text-white ring-green-300'
                                    : 'bg-green-100 text-green-700 group-hover:bg-green-200/70'}` }>
                                    CENACRON
                                </span>
                                { tabActiva === 'evolucion' && (
                                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 h-1 bg-blue-500 rounded-full shadow-sm" />
                                ) }
                            </button>
                        ) }
                    </div>
                </div>
            ) }

            {/* Contenido de las pestañas */ }
            <div>
                { tabActiva === 'historial' && (
                    <HistorialAtencionesTab pkAsegurado={ pkAsegurado } />
                ) }
                { tabActiva === 'evolucion' && esElegible && (
                    <EvolucionCronicaTab pkAsegurado={ pkAsegurado } />
                ) }
            </div>
        </div>
    );
}
