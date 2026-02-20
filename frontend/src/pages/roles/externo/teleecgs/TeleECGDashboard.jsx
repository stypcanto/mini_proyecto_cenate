// ========================================================================
// TeleECGDashboard.jsx – Dashboard TeleECG (Power BI)
// ========================================================================

import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Maximize2, Minimize2, X } from "lucide-react";

const POWERBI_URL =
  "https://app.powerbi.com/view?r=eyJrIjoiZjFkNWNhYjQtY2JiOS00YzRhLTlmZDEtNTYyOWVkN2E0MjRjIiwidCI6IjM0ZjMyNDE5LTFjMDUtNDc1Ni04OTZlLTQ1ZDYzMzcyNjU5YiIsImMiOjR9";

export default function TeleEKGDashboard() {
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

  React.useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement) setIsFullscreen(false);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  return (
    <div className="w-full h-screen flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-3 flex items-center justify-between shadow-lg flex-shrink-0">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors font-medium text-sm flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Atrás
          </button>
          <div className="min-w-0">
            <h1 className="text-lg font-bold truncate">
              Dashboard TeleECG
            </h1>
            <p className="text-red-100 text-xs mt-0.5">
              Dashboard dinámico actualizado diariamente
            </p>
          </div>
        </div>

        <button
          onClick={handleFullscreen}
          className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium text-sm flex-shrink-0 ml-4"
          title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-4 h-4" />
              <span className="hidden sm:inline">Pantalla completa</span>
            </>
          )}
        </button>
      </div>

      {/* Info */}
      <div className="bg-red-50 border-b border-red-200 px-6 py-3 flex-shrink-0">
        <p className="text-sm text-slate-700 leading-relaxed">
          Visualiza los <strong>indicadores de TeleECG</strong> de CENATE.
          Utiliza los <strong>filtros del dashboard</strong> para revisar el detalle por período, IPRESS o estado.{" "}
          <strong>Los datos se actualizan automáticamente cada día.</strong>
        </p>
      </div>

      {/* Power BI iframe */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden relative"
        style={{ backgroundColor: "#f5f5f5" }}
      >
        <iframe
          title="Dashboard TeleECG"
          src={POWERBI_URL}
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen
          style={{ border: "none", display: "block", width: "100%", height: "100%" }}
        />

        {/* Botón flotante para salir de fullscreen */}
        {isFullscreen && (
          <button
            onClick={() => {
              if (document.fullscreenElement) document.exitFullscreen();
              setIsFullscreen(false);
            }}
            className="absolute top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium text-sm shadow-lg"
          >
            <X className="w-4 h-4" />
            Cerrar
          </button>
        )}
      </div>
    </div>
  );
}
