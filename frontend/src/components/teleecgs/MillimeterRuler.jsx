import React from 'react';

/**
 * MillimeterRuler - Regla milimétrica profesional (estilo regla de medición médica)
 * v9.2.1 - Con detalle profesional tipo regla de medición
 *
 * Características:
 * - Escala principal: 1mm
 * - Escala secundaria: cada 5mm y 10mm
 * - Números cada 10mm
 * - Líneas graduadas (como regla real)
 * - Alto contraste y legibilidad
 */
export default function MillimeterRuler({ zoomLevel = 100 }) {
  // Tamaño de 1mm en píxeles (basado en zoom)
  // A 100% zoom: 1mm = 25px (estándar ECG)
  const mmToPx = (zoomLevel / 100) * 25;

  // Dimensiones de las reglas
  const rulerWidth = 80;  // ancho de regla vertical
  const rulerHeight = 50; // alto de regla horizontal

  // Función para renderizar marcas verticales (izquierda)
  const renderVerticalMarks = () => {
    const marks = [];
    for (let i = 0; i < 500; i++) {
      const y = i * mmToPx;
      if (y > window.innerHeight + 100) break;

      const isMajor = i % 10 === 0;      // 10mm - marca más grande
      const isMid = i % 5 === 0;         // 5mm - marca media
      const isMin = true;                // 1mm - marca pequeña

      // Marca de 1mm (línea pequeña)
      if (isMin && !isMid) {
        marks.push(
          <line
            key={`v-small-${i}`}
            x1={rulerWidth - 6}
            y1={y}
            x2={rulerWidth - 2}
            y2={y}
            stroke="#999"
            strokeWidth="0.8"
            opacity="0.5"
          />
        );
      }

      // Marca de 5mm (línea media + número)
      if (isMid && !isMajor) {
        marks.push(
          <line
            key={`v-mid-${i}`}
            x1={rulerWidth - 14}
            y1={y}
            x2={rulerWidth - 2}
            y2={y}
            stroke="#555"
            strokeWidth="1.2"
          />
        );

        // Número cada 5mm
        marks.push(
          <text
            key={`v-mid-text-${i}`}
            x={rulerWidth / 2}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fontWeight="600"
            fontFamily="Arial, sans-serif"
            fill="#666"
          >
            {i}
          </text>
        );
      }

      // Marca de 10mm (línea grande + número)
      if (isMajor) {
        // Línea principal
        marks.push(
          <line
            key={`v-major-${i}`}
            x1={rulerWidth - 20}
            y1={y}
            x2={rulerWidth - 2}
            y2={y}
            stroke="#000"
            strokeWidth="1.5"
          />
        );

        // Número cada 10mm con fondo
        marks.push(
          <rect
            key={`v-text-bg-${i}`}
            x={5}
            y={y - 9}
            width={rulerWidth - 10}
            height={18}
            fill="white"
            stroke="#333"
            strokeWidth="1"
            rx="2"
          />
        );

        marks.push(
          <text
            key={`v-text-${i}`}
            x={rulerWidth / 2}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="13"
            fontWeight="bold"
            fontFamily="Arial, sans-serif"
            fill="#000"
          >
            {i}mm
          </text>
        );
      }
    }
    return marks;
  };

  // Función para renderizar marcas horizontales (superior)
  const renderHorizontalMarks = () => {
    const marks = [];
    for (let i = 0; i < 2000; i++) {
      const x = i * mmToPx;
      if (x > window.innerWidth + 100) break;

      const isMajor = i % 10 === 0;      // 10mm - marca más grande
      const isMid = i % 5 === 0;         // 5mm - marca media
      const isMin = true;                // 1mm - marca pequeña

      // Marca de 1mm (línea pequeña)
      if (isMin && !isMid) {
        marks.push(
          <line
            key={`h-small-${i}`}
            x1={x}
            y1={rulerHeight - 6}
            x2={x}
            y2={rulerHeight - 2}
            stroke="#999"
            strokeWidth="0.8"
            opacity="0.5"
          />
        );
      }

      // Marca de 5mm (línea media + número)
      if (isMid && !isMajor) {
        marks.push(
          <line
            key={`h-mid-${i}`}
            x1={x}
            y1={rulerHeight - 14}
            x2={x}
            y2={rulerHeight - 2}
            stroke="#555"
            strokeWidth="1.2"
          />
        );

        // Número cada 5mm
        marks.push(
          <text
            key={`h-mid-text-${i}`}
            x={x}
            y={rulerHeight / 2 + 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fontWeight="600"
            fontFamily="Arial, sans-serif"
            fill="#666"
          >
            {i}
          </text>
        );
      }

      // Marca de 10mm (línea grande + número)
      if (isMajor) {
        // Línea principal
        marks.push(
          <line
            key={`h-major-${i}`}
            x1={x}
            y1={rulerHeight - 20}
            x2={x}
            y2={rulerHeight - 2}
            stroke="#000"
            strokeWidth="1.5"
          />
        );

        // Número cada 10mm con fondo
        marks.push(
          <rect
            key={`h-text-bg-${i}`}
            x={x - 16}
            y={8}
            width={32}
            height={18}
            fill="white"
            stroke="#333"
            strokeWidth="1"
            rx="2"
          />
        );

        marks.push(
          <text
            key={`h-text-${i}`}
            x={x}
            y={rulerHeight / 2 + 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="13"
            fontWeight="bold"
            fontFamily="Arial, sans-serif"
            fill="#000"
          >
            {i}mm
          </text>
        );
      }
    }
    return marks;
  };

  return (
    <>
      {/* 📏 REGLA VERTICAL (IZQUIERDA) - Estilo profesional */}
      <div
        className="absolute left-0 top-0 bottom-0 z-10"
        style={{
          width: rulerWidth,
          background: 'linear-gradient(to bottom, #f5f5f5, #ffffff)',
          borderRight: '2px solid #333',
          boxShadow: '2px 0 4px rgba(0,0,0,0.1)',
        }}
      >
        <svg
          width={rulerWidth}
          height="100%"
          className="w-full h-full"
          preserveAspectRatio="none"
          style={{ display: 'block' }}
        >
          {/* Línea base */}
          <line
            x1={rulerWidth - 1}
            y1="0"
            x2={rulerWidth - 1}
            y2="100%"
            stroke="#333"
            strokeWidth="2"
          />

          {/* Marcas */}
          {renderVerticalMarks()}
        </svg>
      </div>

      {/* 📏 REGLA HORIZONTAL (SUPERIOR) - Estilo profesional */}
      <div
        className="absolute top-0 left-0 right-0 z-10"
        style={{
          height: rulerHeight,
          marginLeft: rulerWidth,
          background: 'linear-gradient(to right, #f5f5f5, #ffffff)',
          borderBottom: '2px solid #333',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <svg
          width="100%"
          height={rulerHeight}
          className="w-full h-full"
          preserveAspectRatio="none"
          style={{ display: 'block' }}
        >
          {/* Línea base */}
          <line
            x1="0"
            y1={rulerHeight - 1}
            x2="100%"
            y2={rulerHeight - 1}
            stroke="#333"
            strokeWidth="2"
          />

          {/* Marcas */}
          {renderHorizontalMarks()}
        </svg>
      </div>

      {/* ESQUINA (Intersección) */}
      <div
        className="absolute left-0 top-0 z-10 flex items-center justify-center"
        style={{
          width: rulerWidth,
          height: rulerHeight,
          background: 'linear-gradient(135deg, #f5f5f5 50%, #ffffff 50%)',
          borderRight: '2px solid #333',
          borderBottom: '2px solid #333',
          fontSize: '8px',
          fontWeight: 'bold',
          color: '#666',
        }}
      >
        📐
      </div>
    </>
  );
}
