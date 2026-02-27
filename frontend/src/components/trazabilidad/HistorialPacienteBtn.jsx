// ============================================================================
// HistorialPacienteBtn.jsx — v1.75.2
// Botón "📋 Ver historial" reutilizable para cualquier módulo.
// Busca la solicitud más reciente del paciente por DNI y abre el modal
// de trazabilidad con la pestaña Historial activa.
// ============================================================================

import React, { useState } from 'react';
import trazabilidadBolsaService from '../../services/trazabilidadBolsaService';
import HistorialBolsaTab from './HistorialBolsaTab';

/**
 * Botón discreto que, al hacer clic, obtiene el historial de bolsa por DNI
 * y muestra un modal con el timeline de la solicitud.
 *
 * Props:
 *   dni           {string}  — DNI del paciente (requerido)
 *   nombrePaciente {string} — Nombre para el header del modal (opcional)
 */
export default function HistorialPacienteBtn({ dni, nombrePaciente }) {
    const [estado, setEstado] = useState('idle'); // idle | loading | open | sinHistorial
    const [idSolicitud, setIdSolicitud] = useState(null);

    if (!dni) return null;

    const handleClick = async (e) => {
        e.stopPropagation();
        if (estado === 'loading') return;

        setEstado('loading');
        try {
            const data = await trazabilidadBolsaService.obtenerTrazabilidadPorDni(dni);
            if (data && data.idSolicitud) {
                setIdSolicitud(data.idSolicitud);
                setEstado('open');
            } else {
                setEstado('sinHistorial');
                setTimeout(() => setEstado('idle'), 3000);
            }
        } catch (err) {
            // apiClient lanza Error("HTTP 404 - ...") sin propiedad .status
            const msg = err?.message || '';
            const is404 = msg.includes('404') || msg.includes('Not Found');
            if (is404) {
                setEstado('sinHistorial');
                setTimeout(() => setEstado('idle'), 3000);
            } else {
                // Error inesperado: mostrar mensaje de error por 3 segundos
                console.error('[HistorialPacienteBtn] Error:', err);
                setEstado('error');
                setTimeout(() => setEstado('idle'), 3000);
            }
        }
    };

    const handleClose = () => setEstado('idle');

    return (
        <>
            {/* Botón inline */}
            {estado === 'loading' ? (
                <span style={{ fontSize: '11px', color: '#64748b', cursor: 'default' }}>
                    Cargando…
                </span>
            ) : estado === 'sinHistorial' ? (
                <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>
                    Sin historial de bolsa
                </span>
            ) : estado === 'error' ? (
                <span style={{ fontSize: '11px', color: '#ef4444', fontStyle: 'italic' }}>
                    Error al cargar historial
                </span>
            ) : (
                <button
                    onClick={handleClick}
                    title="Ver historial de solicitud en bolsa"
                    style={{
                        background: 'none',
                        border: 'none',
                        padding: '0',
                        cursor: 'pointer',
                        fontSize: '11px',
                        color: '#2563eb',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        lineHeight: 1.4,
                    }}
                >
                    📋 Ver historial
                </button>
            )}

            {/* Modal */}
            {estado === 'open' && idSolicitud && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        padding: '16px',
                    }}
                    onClick={handleClose}
                >
                    <div
                        style={{
                            background: '#fff',
                            borderRadius: '12px',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                            width: '100%',
                            maxWidth: '680px',
                            maxHeight: '85vh',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div style={{
                            background: 'linear-gradient(135deg, #0A5BA9 0%, #084a8a 100%)',
                            color: '#fff',
                            padding: '16px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexShrink: 0,
                        }}>
                            <div>
                                <div style={{ fontSize: '16px', fontWeight: '700' }}>
                                    📋 Historia Clínica
                                </div>
                                {nombrePaciente && (
                                    <div style={{ fontSize: '12px', opacity: 0.85, marginTop: '2px' }}>
                                        {nombrePaciente}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={handleClose}
                                style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    padding: '6px 10px',
                                    fontSize: '14px',
                                    fontWeight: '700',
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Contenido: timeline */}
                        <div style={{ overflowY: 'auto', flex: 1, padding: '16px' }}>
                            <HistorialBolsaTab idSolicitud={idSolicitud} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
