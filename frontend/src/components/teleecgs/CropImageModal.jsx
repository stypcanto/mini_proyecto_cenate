import React, { useState, useCallback } from "react";
import { X, Check, RotateCw } from "lucide-react";

/**
 * ✂️ CropImageModal - Modal para Recortar Imágenes EKG
 *
 * Componente modal que permite:
 * - Seleccionar área a recortar (crop)
 * - Ajustar zoom
 * - Rotar la imagen
 * - Confirmar y exportar en base64
 *
 * Usa un canvas simple para interactividad sin dependencias externas.
 *
 * @param {Object} props
 * @param {string} props.imageSrc - Data URL base64 de la imagen
 * @param {Function} props.onClose - Callback al cerrar modal
 * @param {Function} props.onCropComplete - Callback con imagen recortada base64
 */
export default function CropImageModal({
  imageSrc,
  onClose,
  onCropComplete,
}) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cropSelection, setCropSelection] = useState({
    x: 50,
    y: 50,
    width: 300,
    height: 200,
  });

  const canvasRef = React.useRef(null);
  const previewCanvasRef = React.useRef(null);

  // Manejar inicio de drag
  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Manejar movimiento de pan
  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    setPanX(panX + (currentX - dragStart.x));
    setPanY(panY + (currentY - dragStart.y));

    setDragStart({
      x: currentX,
      y: currentY,
    });
  };

  // Manejar fin de drag
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Aplicar recorte
  const handleCropApply = useCallback(async () => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Configurar tamaño del canvas recortado
      canvas.width = cropSelection.width;
      canvas.height = cropSelection.height;

      // Dibujar área recortada
      ctx.drawImage(
        img,
        cropSelection.x,
        cropSelection.y,
        cropSelection.width,
        cropSelection.height,
        0,
        0,
        cropSelection.width,
        cropSelection.height
      );

      // Convertir a base64 (PNG lossless)
      const croppedBase64 = canvas.toDataURL("image/png", 1.0);
      onCropComplete(croppedBase64);
    };

    img.src = imageSrc;
  }, [imageSrc, cropSelection, onCropComplete]);

  // Preview en tiempo real
  React.useEffect(() => {
    if (!previewCanvasRef.current || !imageSrc) return;

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Dibujar imagen completa
      ctx.drawImage(img, 0, 0);

      // Dibujar rectángulo de selección
      ctx.strokeStyle = "rgba(255, 107, 107, 0.8)";
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(cropSelection.x, cropSelection.y, cropSelection.width, cropSelection.height);

      // Dibujar handles en las esquinas
      const handleSize = 8;
      ctx.fillStyle = "rgb(255, 107, 107)";

      // Esquinas
      const corners = [
        { x: cropSelection.x, y: cropSelection.y },
        { x: cropSelection.x + cropSelection.width, y: cropSelection.y },
        { x: cropSelection.x, y: cropSelection.y + cropSelection.height },
        { x: cropSelection.x + cropSelection.width, y: cropSelection.y + cropSelection.height },
      ];

      corners.forEach((corner) => {
        ctx.fillRect(corner.x - handleSize / 2, corner.y - handleSize / 2, handleSize, handleSize);
      });
    };

    img.src = imageSrc;
  }, [imageSrc, cropSelection]);

  return (
    <div className="fixed inset-0 bg-black/75 z-[100] flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between border-b border-gray-700">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <span>✂️</span> Recortar Imagen EKG
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          title="Cerrar"
        >
          <X size={24} />
        </button>
      </div>

      {/* Content - Split View */}
      <div className="flex-1 overflow-hidden grid grid-cols-2 gap-4 bg-gray-800 p-4">
        {/* Canvas de previsualización con selección */}
        <div className="flex flex-col gap-2 bg-gray-900 rounded-lg p-4">
          <h3 className="text-sm font-bold text-white">Vista Previa</h3>
          <div className="flex-1 flex items-center justify-center overflow-auto border border-gray-700 rounded bg-black">
            <canvas
              ref={previewCanvasRef}
              className="max-w-full max-h-full cursor-crosshair"
              style={{
                border: "2px solid rgba(255, 107, 107, 0.3)",
              }}
              onClick={(e) => {
                // Permitir click para expandir área
                const rect = previewCanvasRef.current.getBoundingClientRect();
                const x = (e.clientX - rect.left) * (previewCanvasRef.current.width / rect.width);
                const y = (e.clientY - rect.top) * (previewCanvasRef.current.height / rect.height);

                // Ajustar selección (simplificado: mover esquina inferior derecha)
                setCropSelection((prev) => ({
                  ...prev,
                  width: Math.max(50, x - prev.x),
                  height: Math.max(50, y - prev.y),
                }));
              }}
            />
          </div>
        </div>

        {/* Controles */}
        <div className="flex flex-col gap-3 bg-gray-900 rounded-lg p-4">
          <h3 className="text-sm font-bold text-white">Controles</h3>

          {/* Zoom */}
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-2">
              🔍 Zoom: {zoom.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer accent-red-500"
            />
          </div>

          {/* Rotación */}
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-2">
              🔄 Rotación: {rotation}°
            </label>
            <input
              type="range"
              min="0"
              max="360"
              step="15"
              value={rotation}
              onChange={(e) => setRotation(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer accent-red-500"
            />
          </div>

          {/* Dimensiones */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Ancho (px)</label>
              <input
                type="number"
                min="50"
                value={cropSelection.width}
                onChange={(e) =>
                  setCropSelection((prev) => ({
                    ...prev,
                    width: parseInt(e.target.value) || 50,
                  }))
                }
                className="w-full px-2 py-1.5 bg-gray-700 text-white rounded text-xs border border-gray-600 focus:border-red-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Alto (px)</label>
              <input
                type="number"
                min="50"
                value={cropSelection.height}
                onChange={(e) =>
                  setCropSelection((prev) => ({
                    ...prev,
                    height: parseInt(e.target.value) || 50,
                  }))
                }
                className="w-full px-2 py-1.5 bg-gray-700 text-white rounded text-xs border border-gray-600 focus:border-red-500 outline-none"
              />
            </div>
          </div>

          {/* Posición */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">X (px)</label>
              <input
                type="number"
                min="0"
                value={cropSelection.x}
                onChange={(e) =>
                  setCropSelection((prev) => ({
                    ...prev,
                    x: Math.max(0, parseInt(e.target.value) || 0),
                  }))
                }
                className="w-full px-2 py-1.5 bg-gray-700 text-white rounded text-xs border border-gray-600 focus:border-red-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Y (px)</label>
              <input
                type="number"
                min="0"
                value={cropSelection.y}
                onChange={(e) =>
                  setCropSelection((prev) => ({
                    ...prev,
                    y: Math.max(0, parseInt(e.target.value) || 0),
                  }))
                }
                className="w-full px-2 py-1.5 bg-gray-700 text-white rounded text-xs border border-gray-600 focus:border-red-500 outline-none"
              />
            </div>
          </div>

          {/* Info */}
          <div className="bg-yellow-900 border border-yellow-700 rounded px-3 py-2 text-xs text-yellow-100">
            <strong>⚠️ Advertencia:</strong> El recorte es <strong>PERMANENTE</strong> y
            modificará la imagen original en la base de datos. No se puede deshacer.
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Botones */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <X size={18} />
              Cancelar
            </button>
            <button
              onClick={handleCropApply}
              className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Check size={18} />
              Aplicar Recorte
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-gray-300 text-xs px-6 py-3 border-t border-gray-700">
        💡 Drag en la vista previa para mover. Usa los controles para ajustar dimensiones y posición.
      </div>
    </div>
  );
}
