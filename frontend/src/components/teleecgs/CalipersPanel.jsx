import React, { useState, useRef, useEffect } from "react";
import { Ruler, RotateCcw, Info } from "lucide-react";
import toast from "react-hot-toast";

/**
 * 🔬 CalipersPanel - Herramienta de Medición de Intervalos Cardíacos (v9.2.0)
 *
 * Permite medir intervalos PR, QRS, QT en la imagen del ECG.
 * - Conversión automática: 1mm = 0.04s (ECG estándar 25mm/s)
 * - Referencia visual: 5mm = 200ms
 * - Historial de mediciones
 *
 * @author Styp Canto Rondón
 * @version 9.2.0 (2026-01-21)
 */
export default function CalipersPanel({ imagenRef, onMeasurement = () => {} }) {
  const [mediciones, setMediciones] = useState([]);
  const [midiendo, setMidiendo] = useState(false);
  const [puntoInicio, setPuntoInicio] = useState(null);
  const [puntoFin, setPuntoFin] = useState(null);
  const [pixelesDistancia, setPixelesDistancia] = useState(0);
  const canvasRef = useRef(null);

  // ✅ v9.2.0: Estándar ECG - 1mm = 0.04 segundos (25mm/s)
  const ECG_MM_PER_SECOND = 25; // Velocidad estándar del papel
  const ECG_PIXEL_TO_MM_RATIO = 1; // Se calcula basado en zoom

  // ✅ v9.2.0: Convertir píxeles a milisegundos
  const pixelesAMilisegundos = (pixeles) => {
    // Asumir resolución estándar: ~25 píxeles = 1mm en zoom 100%
    const mm = pixeles / 25; // píxeles a mm
    const segundos = (mm / ECG_MM_PER_SECOND); // mm a segundos
    const milisegundos = Math.round(segundos * 1000);
    return milisegundos;
  };

  // ✅ v9.2.0: Manejar click en imagen para iniciar medición
  const handleMouseDown = (e) => {
    if (!imagenRef?.current) return;

    const rect = imagenRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (!midiendo) {
      // Iniciar medición
      setPuntoInicio({ x, y });
      setMidiendo(true);
      toast.success("📏 Medición iniciada - Arrastra al punto final", { duration: 2000 });
    }
  };

  // ✅ v9.2.0: Manejar movimiento del mouse
  const handleMouseMove = (e) => {
    if (!midiendo || !puntoInicio || !imagenRef?.current) return;

    const rect = imagenRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calcular distancia euclidiana
    const dx = x - puntoInicio.x;
    const dy = y - puntoInicio.y;
    const distancia = Math.sqrt(dx * dx + dy * dy);

    setPixelesDistancia(distancia);
    setPuntoFin({ x, y });

    // Dibujar línea de medición en tiempo real
    dibujarLineaMedicion(puntoInicio, { x, y });
  };

  // ✅ v9.2.0: Finalizar medición
  const handleMouseUp = () => {
    if (midiendo && puntoInicio && puntoFin) {
      const ms = pixelesAMilisegundos(pixelesDistancia);

      const nuevaMedicion = {
        id: Date.now(),
        puntoInicio,
        puntoFin,
        pixeles: Math.round(pixelesDistancia),
        milisegundos: ms,
        timestamp: new Date().toLocaleTimeString("es-PE"),
      };

      setMediciones([...mediciones, nuevaMedicion]);
      onMeasurement(nuevaMedicion);

      toast.success(`✅ Medición: ${ms}ms (${(ms/1000).toFixed(2)}s)`, { duration: 3000 });

      // Reset
      setMidiendo(false);
      setPuntoInicio(null);
      setPuntoFin(null);
      setPixelesDistancia(0);
    }
  };

  // ✅ v9.2.0: Dibujar línea de medición
  const dibujarLineaMedicion = (inicio, fin) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Limpiar
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Línea de medición
    ctx.strokeStyle = "#FF6B6B";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(inicio.x, inicio.y);
    ctx.lineTo(fin.x, fin.y);
    ctx.stroke();

    // Puntos
    ctx.fillStyle = "#FF6B6B";
    ctx.beginPath();
    ctx.arc(inicio.x, inicio.y, 5, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = "#4CAF50";
    ctx.beginPath();
    ctx.arc(fin.x, fin.y, 5, 0, 2 * Math.PI);
    ctx.fill();
  };

  // ✅ v9.2.0: Limpiar todas las mediciones
  const limpiarMediciones = () => {
    setMediciones([]);
    setMidiendo(false);
    setPuntoInicio(null);
    setPuntoFin(null);
    setPixelesDistancia(0);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    toast.success("🗑️ Mediciones borradas", { duration: 2000 });
  };

  // ✅ v9.2.0: Obtener clasificación de intervalo
  const obtenerClasificacionIntervalo = (ms) => {
    if (ms < 120) return { nombre: "PR muy corto", rango: "<120ms" };
    if (ms <= 200) return { nombre: "PR normal", rango: "120-200ms", emoji: "✅" };
    if (ms <= 220) return { nombre: "PR prolongado", rango: ">200ms", emoji: "⚠️" };

    if (ms < 80) return { nombre: "QRS muy corto", rango: "<80ms" };
    if (ms <= 120) return { nombre: "QRS normal", rango: "80-120ms", emoji: "✅" };
    if (ms <= 150) return { nombre: "QRS prolongado", rango: ">120ms", emoji: "⚠️" };

    if (ms <= 440) return { nombre: "QT normal", rango: "<440ms", emoji: "✅" };
    if (ms <= 460) return { nombre: "QT límite", rango: "440-460ms", emoji: "⚠️" };
    return { nombre: "QT PROLONGADO", rango: ">460ms", emoji: "🚨" };
  };

  return (
    <div className="bg-gradient-to-b from-indigo-50 to-purple-50 border-l-4 border-indigo-400 p-3 rounded-lg space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Ruler className="w-4 h-4 text-indigo-600" />
          <span className="font-bold text-sm text-indigo-900">🔬 Calipers</span>
        </div>
        <button
          onClick={limpiarMediciones}
          className="p-1 hover:bg-red-200 rounded text-red-600 transition-colors"
          title="Limpiar todas las mediciones"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {/* Instrucciones */}
      <div className="bg-blue-100 border border-blue-300 rounded p-2 text-xs text-blue-900">
        <div className="flex gap-1">
          <Info size={14} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">📏 Cómo medir:</p>
            <p>Haz click en el punto inicial de la medición y arrastra al punto final</p>
          </div>
        </div>
      </div>

      {/* Estado actual de medición */}
      {midiendo && (
        <div className="bg-yellow-100 border border-yellow-400 rounded p-2 text-xs text-yellow-900 animate-pulse">
          <p className="font-bold">⏱️ Midiendo...</p>
          <p>Distancia: {pixelesDistancia.toFixed(0)} px = <span className="font-bold text-lg">{pixelesAMilisegundos(pixelesDistancia)}ms</span></p>
        </div>
      )}

      {/* Historial de mediciones */}
      {mediciones.length > 0 && (
        <div className="border-t-2 border-indigo-300 pt-2">
          <p className="font-semibold text-xs text-indigo-900 mb-2">📊 Historial ({mediciones.length})</p>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {mediciones.map((med) => {
              const clasificacion = obtenerClasificacionIntervalo(med.milisegundos);
              return (
                <div
                  key={med.id}
                  className={`p-2 rounded border text-xs ${
                    med.milisegundos > 450
                      ? "bg-red-100 border-red-300 text-red-900"
                      : med.milisegundos > 200
                      ? "bg-yellow-100 border-yellow-300 text-yellow-900"
                      : "bg-green-100 border-green-300 text-green-900"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold">{med.milisegundos}ms</p>
                      <p className="text-xs opacity-75">{clasificacion.nombre}</p>
                    </div>
                    <span className="text-lg">{clasificacion.emoji}</span>
                  </div>
                  <p className="text-xs opacity-60 mt-1">{med.timestamp}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Referencias ECG */}
      <div className="bg-purple-100 border border-purple-300 rounded p-2 text-xs text-purple-900">
        <p className="font-semibold mb-1">📐 Referencias ECG (25mm/s):</p>
        <div className="space-y-0.5 text-xs">
          <p>• 1mm = 0.04s (40ms)</p>
          <p>• 5mm = 0.2s (200ms) ← Cuadros grandes</p>
          <p>• PR normal: 120-200ms</p>
          <p>• QRS normal: 80-120ms</p>
          <p>• QT normal: &lt;440ms</p>
        </div>
      </div>

      {/* Canvas para dibujar líneas */}
      <canvas
        ref={canvasRef}
        width={200}
        height={100}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full border-2 border-dashed border-indigo-300 rounded bg-white cursor-crosshair hidden"
      />
    </div>
  );
}
