// ========================================================================
// 📊 EstadisticasProgramacion.jsx  →  Producción Diaria (Power BI)
// Ruta: /estadisticas/programacion
// v1.71.1: UX mejorada — modo expandido cubre sidebar + header
// ========================================================================

import React, { useState, useRef, useCallback } from 'react';
import { Maximize2, X, RefreshCw, ExternalLink } from 'lucide-react';

const BI_URL =
  'https://app.powerbi.com/view?r=eyJrIjoiOGQ5ZmZjZjMtMGMxNC00NmIwLWFmMmMtNTYxMWUwNDU2NTVkIiwidCI6IjM0ZjMyNDE5LTFjMDUtNDc1Ni04OTZlLTQ1ZDYzMzcyNjU5YiIsImMiOjR9';

export default function EstadisticasProgramacion() {
  const [expandido, setExpandido] = useState(false);
  const [key, setKey] = useState(0);

  const recargar = useCallback(() => setKey(k => k + 1), []);

  return (
    <>
      {/* ── Vista normal (embedded en la app) ─────────────────────── */}
      <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>

        {/* Barra mínima */}
        <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#0A5BA9]" />
            <span className="text-sm font-bold text-gray-800">Producción Diaria</span>
            <span className="text-xs text-gray-400">— Panel de Pendientes BI</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={recargar}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
              title="Recargar reporte"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Recargar
            </button>

            <a
              href={BI_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
              title="Abrir en Power BI"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Abrir en BI
            </a>

            <button
              onClick={() => setExpandido(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#0A5BA9] hover:bg-[#084A8E] rounded-lg transition-colors shadow-sm"
              title="Ver en pantalla completa"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              Expandir
            </button>
          </div>
        </div>

        {/* iframe normal */}
        <div className="flex-1 overflow-hidden">
          <iframe
            key={key}
            title="BI_PENDIENTES_DIARIO"
            src={BI_URL}
            frameBorder="0"
            allowFullScreen
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          />
        </div>
      </div>

      {/* ── Modo expandido: cubre TODA la ventana (sidebar + header) ── */}
      {expandido && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: '#fff',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Barra superior en modo expandido */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 16px',
              background: '#0A5BA9',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#7DD3FC' }} />
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>
                Producción Diaria
              </span>
              <span style={{ color: '#93C5FD', fontSize: 12 }}>— Panel de Pendientes BI</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={recargar}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 8,
                  background: 'rgba(255,255,255,0.15)', color: '#fff',
                  border: '1px solid rgba(255,255,255,0.3)',
                  cursor: 'pointer', fontSize: 12, fontWeight: 500,
                }}
                title="Recargar"
              >
                <RefreshCw style={{ width: 14, height: 14 }} />
                Recargar
              </button>

              <a
                href={BI_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 8,
                  background: 'rgba(255,255,255,0.15)', color: '#fff',
                  border: '1px solid rgba(255,255,255,0.3)',
                  fontSize: 12, fontWeight: 500, textDecoration: 'none',
                }}
                title="Abrir en Power BI"
              >
                <ExternalLink style={{ width: 14, height: 14 }} />
                Abrir en BI
              </a>

              <button
                onClick={() => setExpandido(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 16px', borderRadius: 8,
                  background: '#fff', color: '#0A5BA9',
                  border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 700,
                }}
                title="Cerrar pantalla completa"
              >
                <X style={{ width: 14, height: 14 }} />
                Cerrar
              </button>
            </div>
          </div>

          {/* iframe en pantalla completa */}
          <iframe
            key={`exp-${key}`}
            title="BI_PENDIENTES_DIARIO_FULL"
            src={BI_URL}
            frameBorder="0"
            allowFullScreen
            style={{ flex: 1, border: 'none', display: 'block', width: '100%' }}
          />
        </div>
      )}
    </>
  );
}
