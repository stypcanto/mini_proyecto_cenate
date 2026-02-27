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
        <div className="w-full space-y-4">
            {/* Header / Navegación */ }
            { !verificandoElegibilidad && (
                esElegible ? (
                    /* Dos pestañas: pill tabs */
                    <div className="flex gap-2 bg-slate-100 rounded-xl p-1">
                        <button
                            onClick={ () => setTabActiva('historial') }
                            className={ `flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                tabActiva === 'historial'
                                    ? 'bg-white text-[#084a8a] shadow-sm border border-slate-200'
                                    : 'text-slate-500 hover:text-slate-700'
                            }` }
                        >
                            <FileText className="w-4 h-4" />
                            Historial de Atenciones
                        </button>
                        <button
                            onClick={ () => setTabActiva('evolucion') }
                            className={ `flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                tabActiva === 'evolucion'
                                    ? 'bg-white text-[#084a8a] shadow-sm border border-slate-200'
                                    : 'text-slate-500 hover:text-slate-700'
                            }` }
                        >
                            <Activity className="w-4 h-4" />
                            Evolución Crónica
                            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-green-100 text-green-700">
                                CENACRON
                            </span>
                        </button>
                    </div>
                ) : (
                    /* Una sola sección: header decorativo */
                    <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-emerald-50 to-slate-50 border border-emerald-100 rounded-xl">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <FileText className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-700">Historial de Atenciones</p>
                            <p className="text-xs text-slate-400">Registro de atenciones clínicas CENATE</p>
                        </div>
                    </div>
                )
            ) }

            {/* Contenido */ }
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
