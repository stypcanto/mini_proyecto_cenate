// ========================================================================
// 🎴 MedicoDashboardCard.jsx – Componente de Card para Dashboard Médico
// ------------------------------------------------------------------------
// Componente reutilizable que renderiza una card individual del Dashboard Médico.
// Similar al DashboardCard de UserDashboard.jsx pero adaptado para cards dinámicas.
// ========================================================================

import React, { useState, useEffect } from "react";

/**
 * Componente de Card para el Dashboard Médico
 * @param {Object} props
 * @param {string} props.titulo - Título de la card
 * @param {string} props.descripcion - Descripción de la card
 * @param {string} props.link - URL o ruta de destino
 * @param {string} props.icono - Nombre del archivo de imagen (ej: "ACCESO.png")
 * @param {string} props.color - Color hexadecimal para el fondo (opcional)
 * @param {boolean} props.targetBlank - Si es true, abre en nueva pestaña (por defecto true)
 */
export default function MedicoDashboardCard({
  titulo,
  descripcion,
  link,
  icono,
  color = "#0A5BA9",
  targetBlank = true, // Por defecto siempre abrir en nueva ventana
}) {
  const [imageError, setImageError] = useState(false);

  // Resetear error cuando cambia el icono
  useEffect(() => {
    setImageError(false);
  }, [icono]);

  const handleClick = () => {
    // Siempre abrir en nueva ventana
    if (link.startsWith("http://") || link.startsWith("https://")) {
      window.open(link, "_blank", "noopener,noreferrer");
    } else {
      // Ruta interna en nueva pestaña
      const fullUrl = window.location.origin + link;
      window.open(fullUrl, "_blank", "noopener,noreferrer");
    }
  };

  // Construir la ruta de la imagen
  const imagenPath = `/images/iconos/${icono}`;

  // Dividir el título en líneas de forma inteligente (optimizado para cards rectangulares)
  const dividirTitulo = (texto) => {
    if (!texto) return [''];
    
    // Si el título es corto, devolverlo como está
    if (texto.length <= 30) {
      return [texto];
    }
    
    const palabras = texto.split(' ');
    
    // Si tiene pocas palabras, dividir por la mitad
    if (palabras.length <= 3) {
      const mitad = Math.ceil(palabras.length / 2);
      return [
        palabras.slice(0, mitad).join(' '),
        palabras.slice(mitad).join(' ')
      ];
    }
    
    // Para títulos más largos, dividir de forma más inteligente
    const lineas = [];
    let lineaActual = '';
    const maxCaracteres = 32; // Optimizado para cards rectangulares (más anchas)
    
    palabras.forEach((palabra, index) => {
      const nuevaLinea = lineaActual ? `${lineaActual} ${palabra}` : palabra;
      
      if (nuevaLinea.length <= maxCaracteres && index < palabras.length - 1) {
        lineaActual = nuevaLinea;
      } else {
        if (lineaActual) {
          lineas.push(lineaActual);
        }
        lineaActual = palabra;
      }
    });
    
    if (lineaActual) {
      lineas.push(lineaActual);
    }
    
    return lineas.length > 0 ? lineas : [texto];
  };

  const tituloLineas = dividirTitulo(titulo);

  return (
    <button
      onClick={handleClick}
      className="relative text-center rounded-xl p-4 border border-gray-200 dark:border-slate-700 
                 shadow-sm hover:shadow-md transition-all duration-200
                 bg-white dark:bg-slate-800 w-full hover:scale-[1.01] hover:border-blue-300 dark:hover:border-blue-600
                 group cursor-pointer flex flex-col items-center justify-start"
      style={{ outline: "none" }}
      title={descripcion || titulo}
    >
      {/* Icono centrado - más grande */}
      <div className="flex justify-center mb-3">
        <div
          className="w-20 h-20 rounded-xl flex items-center justify-center 
                     transition-all duration-200 group-hover:scale-105"
          style={{ 
            backgroundColor: `${color}08`,
          }}
        >
          {imageError ? (
            <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-2xl text-gray-400">?</span>
            </div>
          ) : (
            <img
              src={imagenPath}
              alt={titulo}
              className="w-16 h-16 object-contain transition-transform duration-200 group-hover:scale-110"
              onError={() => {
                setImageError(true);
              }}
              onLoad={() => {
                setImageError(false);
              }}
            />
          )}
        </div>
      </div>

      {/* Título centrado - diseño profesional */}
      <div className="space-y-0.5 mb-1.5 w-full">
        {tituloLineas.map((linea, index) => {
          const esUltimaLinea = index === tituloLineas.length - 1;
          return (
            <h3
              key={index}
              className={`text-gray-900 dark:text-white leading-tight ${
                esUltimaLinea 
                  ? 'text-base font-semibold' 
                  : 'text-sm font-medium text-gray-600 dark:text-gray-400'
              }`}
            >
              {linea}
            </h3>
          );
        })}
      </div>

      {/* Descripción centrada - diseño profesional */}
      {descripcion && (
        <p className="text-gray-500 dark:text-gray-400 text-xs leading-tight w-full">
          {descripcion}
        </p>
      )}
    </button>
  );
}

