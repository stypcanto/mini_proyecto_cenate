import React, { useEffect, useRef } from "react";

/**
 * 🖼️ ImageCanvas - Renderizado de Alta Calidad para ECGs
 *
 * Componente que renderiza imágenes ECG en canvas HTML5 con:
 * - Rotación sin pérdida de calidad (imageSmoothingQuality = 'high')
 * - Filtros CSS nativos: invert, contrast, brightness
 * - Optimización para imágenes médicas
 *
 * @param {Object} props
 * @param {string} props.imageSrc - Data URL base64 de la imagen
 * @param {number} props.rotation - Rotación en grados (0, 90, 180, 270)
 * @param {Object} props.filters - Objeto con filtros { invert, contrast, brightness }
 * @param {Function} props.onImageLoad - Callback cuando la imagen carga
 */
export default function ImageCanvas({ imageSrc, rotation = 0, filters = {}, onImageLoad = () => {} }) {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  const {
    invert = false,
    contrast = 100,
    brightness = 100,
  } = filters;

  // Dibujar imagen en canvas cuando carga o cambian los parámetros
  useEffect(() => {
    if (!imageSrc || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      console.error("❌ No se pudo obtener contexto 2D del canvas");
      return;
    }

    // Crear y cargar imagen
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        drawImageOnCanvas(canvas, ctx, img);
        onImageLoad();
      } catch (error) {
        console.error("❌ Error dibujando en canvas:", error);
      }
    };

    img.onerror = () => {
      console.error("❌ Error cargando imagen en canvas");
    };

    img.src = imageSrc;
    imageRef.current = img;
  }, [imageSrc, onImageLoad]);

  // Redibujar cuando cambian filtros o rotación
  useEffect(() => {
    if (!imageRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (ctx && imageRef.current.complete) {
      drawImageOnCanvas(canvas, ctx, imageRef.current);
    }
  }, [rotation, invert, contrast, brightness]);

  const drawImageOnCanvas = (canvas, ctx, img) => {
    // Calcular dimensiones considerando rotación
    const isVertical = rotation === 90 || rotation === 270;
    const width = isVertical ? img.height : img.width;
    const height = isVertical ? img.width : img.height;

    // Redimensionar canvas
    canvas.width = width;
    canvas.height = height;

    // Habilitar high-quality image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Guardar estado del canvas
    ctx.save();

    // Aplicar rotación
    if (rotation !== 0) {
      ctx.translate(width / 2, height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-img.width / 2, -img.height / 2);
    }

    // Aplicar filtros CSS como string
    const filterString = buildFilterString(invert, contrast, brightness);
    ctx.filter = filterString;

    // Dibujar imagen
    ctx.drawImage(img, 0, 0);

    // Restaurar estado
    ctx.restore();
  };

  const buildFilterString = (invert, contrast, brightness) => {
    const filters = [];

    if (invert) {
      filters.push("invert(1)");
    }

    if (contrast !== 100) {
      filters.push(`contrast(${contrast}%)`);
    }

    if (brightness !== 100) {
      filters.push(`brightness(${brightness}%)`);
    }

    return filters.length > 0 ? filters.join(" ") : "none";
  };

  return (
    <canvas
      ref={canvasRef}
      className="max-h-full max-w-full object-contain"
      style={{
        imageRendering: "high-quality",
        display: "block",
      }}
      aria-label="ECG Image Canvas"
    />
  );
}
