// ========================================================================
// 📊 EstadisticasProgramacion.jsx  →  Producción Diaria (Power BI)
// Ruta: /estadisticas/programacion
// v1.71.0: Reemplazado por embed Power BI — BI_PENDIENTES_DIARIO
// ========================================================================

import React, { useState, useRef, useCallback } from 'react';
import { Maximize2, Minimize2, RefreshCw, ExternalLink } from 'lucide-react';

const BI_URL =
  'https://app.powerbi.com/view?r=eyJrIjoiOGQ5ZmZjZjMtMGMxNC00NmIwLWFmMmMtNTYxMWUwNDU2NTVkIiwidCI6IjM0ZjMyNDE5LTFjMDUtNDc1Ni04OTZlLTQ1ZDYzMzcyNjU5YiIsImMiOjR9';

export default function EstadisticasProgramacion() {
  const iframeRef = useRef(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [key, setKey] = useState(0); // fuerza recarga del iframe

  const recargar = useCallback(() => setKey(k => k + 1), []);

  const toggleFullscreen = useCallback(() => {
    const el = document.getElementById('bi-container');
    if (!fullscreen) {
      if (el?.requestFullscreen) el.requestFullscreen();
      else if (el?.webkitRequestFullscreen) el.webkitRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
    setFullscreen(f => !f);
  }, [fullscreen]);

  const zoomIn  = () => setZoom(z => Math.min(z + 10, 200));
  const zoomOut = () => setZoom(z => Math.max(z - 10, 50));
  const resetZoom = () => setZoom(100);

  return (
    <div className="flex flex-col h-screen bg-gray-100">

      {/* ── Barra de herramientas ────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#0A5BA9]" />
          <span className="text-sm font-bold text-gray-800">Producción Diaria</span>
          <span className="text-xs text-gray-400 ml-1">— Panel de Pendientes BI</span>
        </div>

        <div className="flex items-center gap-1">
          {/* Zoom */}
          <button
            onClick={zoomOut}
            className="px-2 py-1 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title="Reducir zoom"
          >
            −
          </button>
          <button
            onClick={resetZoom}
            className="px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded transition-colors min-w-[48px] text-center"
            title="Restablecer zoom"
          >
            {zoom}%
          </button>
          <button
            onClick={zoomIn}
            className="px-2 py-1 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title="Aumentar zoom"
          >
            +
          </button>

          <div className="w-px h-5 bg-gray-200 mx-1" />

          {/* Recargar */}
          <button
            onClick={recargar}
            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors"
            title="Recargar reporte"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Abrir en nueva pestaña */}
          <a
            href={BI_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors"
            title="Abrir en Power BI"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          {/* Pantalla completa */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors"
            title={fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          >
            {fullscreen
              ? <Minimize2 className="w-4 h-4" />
              : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── Contenedor del iframe ────────────────────────────────────── */}
      <div
        id="bi-container"
        className="flex-1 overflow-auto bg-gray-50"
        style={{ minHeight: 0 }}
      >
        <div
          style={{
            width:  `${zoom}%`,
            height: zoom === 100 ? '100%' : `${zoom}%`,
            minHeight: '100%',
            transformOrigin: 'top left',
            transition: 'width 0.2s, height 0.2s',
          }}
        >
          <iframe
            key={key}
            ref={iframeRef}
            title="BI_PENDIENTES_DIARIO"
            src={BI_URL}
            frameBorder="0"
            allowFullScreen
            style={{
              width:  '100%',
              height: '100%',
              minHeight: 'calc(100vh - 48px)',
              border: 'none',
              display: 'block',
            }}
          />
        </div>
      </div>
    </div>
  );
}
