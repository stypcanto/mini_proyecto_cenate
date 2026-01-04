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
                <div className="border-b border-gray-200 bg-gray-50 -mx-6 -mt-6 mb-6">
                    <div className="px-6">
                        <div className={ `grid ${esElegible ? 'grid-cols-2' : 'grid-cols-1'} gap-0` }>
                            {/* Pestaña Historial (Siempre visible) */ }
                            <button
                                onClick={ () => setTabActiva('historial') }
                                className={ `flex items-center justify-center gap-2 px-4 py-4 text-sm font-semibold transition-all border-b-2 ${tabActiva === 'historial'
                                        ? 'border-blue-600 text-blue-600 bg-white'
                                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    }` }
                            >
                                <FileText className="w-4 h-4" />
                                Historial de Atenciones
                            </button>

                            {/* Pestaña Evolución Crónica (Solo para CENACRON con HTA/DM) */ }
                            { esElegible && (
                                <button
                                    onClick={ () => setTabActiva('evolucion') }
                                    className={ `flex items-center justify-center gap-2 px-4 py-4 text-sm font-semibold transition-all border-b-2 ${tabActiva === 'evolucion'
                                            ? 'border-blue-600 text-blue-600 bg-white'
                                            : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                        }` }
                                >
                                    <Activity className="w-4 h-4" />
                                    📊 Evolución Crónica
                                    <span className="ml-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-bold">
                                        CENACRON
                                    </span>
                                </button>
                            ) }
                        </div>
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
