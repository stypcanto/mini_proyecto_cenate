// ========================================================================
// 📊 SeguimientoLecturasExterno.jsx – Power BI Dashboard
// ========================================================================
// Dashboard de Seguimiento de Lecturas Pendientes (Power BI)
// Panel para visualizar seguimiento de lecturas en pantalla completa
// ========================================================================

import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Maximize2, Minimize2, X } from "lucide-react";

export default function SeguimientoLecturasExterno() {
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  const handleFullscreen = async () => {
    if (!isFullscreen) {
      try {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if (containerRef.current.webkitRequestFullscreen) {
          await containerRef.current.webkitRequestFullscreen();
        } else if (containerRef.current.msRequestFullscreen) {
          await containerRef.current.msRequestFullscreen();
        }
        setIsFullscreen(true);
      } catch (err) {
        console.error("Error entering fullscreen:", err);
      }
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors font-medium text-sm"
            title="Volver atrás"
          >
            <ArrowLeft className="w-4 h-4" />
            Atrás
          </button>
          <div>
            <h1 className="text-xl font-bold">
              Seguimiento de Lecturas Pendientes de Teleapoyo al Diagnóstico
            </h1>
            <p className="text-blue-100 text-xs mt-0.5">
              Dashboard dinámico actualizado diariamente
            </p>
          </div>
        </div>
        <button
          onClick={handleFullscreen}
          className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium text-sm"
          title={isFullscreen ? "Salir de pantalla completa" : "Expandir a pantalla completa"}
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-4 h-4" />
              <span>Salir</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-4 h-4" />
              <span>Pantalla completa</span>
            </>
          )}
        </button>
      </div>

      {/* Información */}
      <div className="bg-blue-50 border-b border-blue-200 px-6 py-4">
        <h2 className="font-semibold text-slate-900 text-sm mb-2">ℹ️ ¿Qué encontrarás aquí?</h2>
        <p className="text-sm text-slate-700 leading-relaxed">
          En este tablero podrás <strong>identificar el número de lecturas pendientes</strong> que tiene CENATE en cada IPRESS participante.
          Utiliza los <strong>filtros disponibles</strong> en el dashboard para revisar el detalle específico de cada institución
          y hacer un seguimiento dinámico de este indicador crítico de control. <strong>Los datos se actualizan automáticamente cada día.</strong>
        </p>
      </div>

      {/* Power BI Dashboard - Toma todo el espacio disponible */}
      <div
        ref={containerRef}
        id="powerbi-container"
        className="flex-1 overflow-hidden relative"
        style={{
          backgroundColor: "#f5f5f5",
        }}
      >
        <iframe
          title="BI_DIF_NACIONAL - Seguimiento de Lecturas Pendientes"
          width="100%"
          height="100%"
          src="https://app.powerbi.com/view?r=eyJrIjoiMDZhMDI0ODEtMDJiMi00ZDE1LWJjMmMtOTExM2FjMzEwYjNjIiwidCI6IjM0ZjMyNDE5LTFjMDUtNDc1Ni04OTZlLTQ1ZDYzMzcyNjU5YiIsImMiOjR9"
          frameBorder="0"
          allowFullScreen={true}
          style={{
            border: "none",
            display: "block",
            margin: 0,
            padding: 0,
            width: "100%",
            height: "100%",
          }}
        ></iframe>

        {/* Botón flotante de cerrar - Solo visible en fullscreen */}
        {isFullscreen && (
          <button
            onClick={() => {
              if (document.fullscreenElement) {
                document.exitFullscreen();
              }
              setIsFullscreen(false);
            }}
            className="absolute top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium text-sm shadow-lg"
            title="Cerrar pantalla completa"
          >
            <X className="w-4 h-4" />
            <span>Cerrar</span>
          </button>
        )}
      </div>
    </div>
  );
}
