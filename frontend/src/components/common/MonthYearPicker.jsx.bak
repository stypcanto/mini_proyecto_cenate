// ========================================================================
// 📅 MonthYearPicker.jsx - Selector de Mes y Año (Wheel Style)
// ------------------------------------------------------------------------
// Componente tipo rueda compacto, guarda en formato YYYYMM
// DISEÑO OPTIMIZADO - Sin espacios innecesarios
// ========================================================================

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, X, Check } from 'lucide-react';

const MonthYearPicker = ({ value, onChange, label = "Periodo de Ingreso", variant = "blue" }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  
  const monthScrollRef = useRef(null);
  const yearScrollRef = useRef(null);

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Generar años (desde 1990 hasta año actual + 1)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1989 }, (_, i) => currentYear + 1 - i);

  // Esquemas de color según variante
  const colorSchemes = {
    blue: {
      border: 'border-blue-500',
      borderHover: 'hover:border-blue-600',
      bg: 'bg-[#0a5ba9]',
      bgHover: 'hover:bg-blue-700',
      bgLight: 'bg-blue-100',
      bgSelected: 'bg-[#0a5ba9]',
      textSelected: 'text-white',
      text: 'text-blue-700',
      textDark: 'text-blue-900',
      borderColor: 'border-blue-400',
      ring: 'focus:ring-blue-500',
    },
    emerald: {
      border: 'border-emerald-500',
      borderHover: 'hover:border-emerald-600',
      bg: 'bg-emerald-600',
      bgHover: 'hover:bg-emerald-700',
      bgLight: 'bg-emerald-100',
      bgSelected: 'bg-emerald-600',
      textSelected: 'text-white',
      text: 'text-emerald-700',
      textDark: 'text-emerald-900',
      borderColor: 'border-emerald-400',
      ring: 'focus:ring-emerald-500',
    }
  };

  const colors = colorSchemes[variant] || colorSchemes.blue;

  // Parsear el valor inicial (formato YYYYMM)
  useEffect(() => {
    if (value && value.length === 6) {
      const year = parseInt(value.substring(0, 4));
      const month = parseInt(value.substring(4, 6)) - 1;
      setSelectedYear(year);
      setSelectedMonth(month);
    }
  }, [value]);

  // Scroll automático al elemento seleccionado cuando se abre el modal
  useEffect(() => {
    if (showPicker && selectedMonth !== null && monthScrollRef.current) {
      const element = monthScrollRef.current.children[selectedMonth + 1]; // +1 por el spacer
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    if (showPicker && selectedYear !== null && yearScrollRef.current) {
      const yearIndex = years.indexOf(selectedYear);
      if (yearIndex !== -1) {
        const element = yearScrollRef.current.children[yearIndex + 1]; // +1 por el spacer
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [showPicker, selectedMonth, selectedYear, years]);

  const handleMonthClick = (e, monthIndex) => {
    e.stopPropagation(); // Evitar propagación del evento
    e.preventDefault(); // Prevenir comportamiento por defecto
    console.log('🟢 Mes seleccionado:', meses[monthIndex]);
    setSelectedMonth(monthIndex);
  };

  const handleYearClick = (e, year) => {
    e.stopPropagation(); // Evitar propagación del evento
    e.preventDefault(); // Prevenir comportamiento por defecto
    console.log('🟢 Año seleccionado:', year);
    setSelectedYear(year);
  };

  const handleConfirmar = () => {
    console.log('✅ Confirmando selección:', { mes: selectedMonth, año: selectedYear });
    if (selectedMonth !== null && selectedYear !== null) {
      const formattedValue = `${selectedYear}${String(selectedMonth + 1).padStart(2, '0')}`;
      console.log('📤 Valor formateado:', formattedValue);
      onChange(formattedValue);
      setShowPicker(false);
    }
  };

  const handleCancelar = () => {
    console.log('❌ Cancelando selección');
    // Restaurar valores originales si había un valor previo
    if (value && value.length === 6) {
      const year = parseInt(value.substring(0, 4));
      const month = parseInt(value.substring(4, 6)) - 1;
      setSelectedYear(year);
      setSelectedMonth(month);
    }
    setShowPicker(false);
  };

  const getDisplayValue = () => {
    if (selectedMonth !== null && selectedYear !== null) {
      return `${meses[selectedMonth]} ${selectedYear}`;
    }
    return 'Seleccionar periodo';
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      {/* Input Display */}
      <div
        onClick={() => {
          console.log('📌 Abriendo modal de selección de fecha');
          setShowPicker(true);
        }}
        className={`w-full px-4 py-3 border-2 border-gray-300 rounded-xl cursor-pointer ${colors.borderHover} transition-all flex items-center justify-between ${colors.ring} hover:shadow-md`}
      >
        <span className={selectedMonth !== null && selectedYear !== null ? `${colors.textDark} font-bold` : "text-gray-400"}>
          {getDisplayValue()}
        </span>
        <Calendar className="w-5 h-5 text-gray-400" />
      </div>

      {/* Modal Picker - Wheel Style OPTIMIZADO */}
      {showPicker && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 animate-fadeIn" 
          onClick={(e) => {
            console.log('🔴 Click en backdrop detectado');
            handleCancelar();
          }}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform animate-scaleIn" 
            onClick={(e) => {
              console.log('🟪 Click en modal interno - evitando propagación');
              e.stopPropagation();
            }}
          >
            
            {/* Header Mejorado */}
            <div className={`px-6 py-4 ${colors.bgSelected} flex items-center justify-between`} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">Selecciona periodo</h3>
              </div>
              <button
                onClick={handleCancelar}
                className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Wheel Pickers OPTIMIZADOS - SIN ESPACIOS INNECESARIOS */}
            <div className="p-6" onClick={(e) => e.stopPropagation()}>
              <div className="grid grid-cols-2 gap-4">
                
                {/* Columna de Meses */}
                <div>
                  <div className={`text-xs font-bold uppercase tracking-wider ${colors.text} mb-2 text-center`}>
                    MES
                  </div>
                  <div className="relative">
                    {/* Indicador central SUPER VISIBLE */}
                    <div className={`absolute left-0 right-0 top-1/2 -translate-y-1/2 h-12 ${colors.bgLight} border-y-2 ${colors.borderColor} pointer-events-none z-10 rounded-lg shadow-md`}></div>
                    
                    {/* Lista scrolleable */}
                    <div 
                      ref={monthScrollRef}
                      onClick={(e) => e.stopPropagation()}
                      className="h-[200px] overflow-y-auto snap-y snap-mandatory scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400"
                      style={{ scrollPaddingTop: '76px', scrollPaddingBottom: '76px' }}
                    >
                      {/* Spacer inicial reducido */}
                      <div className="h-[20px]"></div>
                      
                      {meses.map((mes, index) => {
                        const isInCenter = selectedMonth === index;
                        return (
                          <button
                            key={index}
                            onClick={(e) => handleMonthClick(e, index)}
                            className={`
                              w-full h-12 snap-center flex items-center justify-center 
                              text-sm font-bold transition-all rounded-lg relative z-20
                              ${isInCenter
                                ? `${colors.textDark} scale-110 font-extrabold`
                                : 'text-gray-500 hover:text-gray-800 hover:scale-105'
                              }
                            `}
                          >
                            {mes}
                          </button>
                        );
                      })}
                      
                      {/* Spacer final para scroll */}
                      <div className="h-[76px]"></div>
                    </div>
                  </div>
                </div>

                {/* Columna de Años */}
                <div>
                  <div className={`text-xs font-bold uppercase tracking-wider ${colors.text} mb-2 text-center`}>
                    AÑO
                  </div>
                  <div className="relative">
                    {/* Indicador central SUPER VISIBLE */}
                    <div className={`absolute left-0 right-0 top-1/2 -translate-y-1/2 h-12 ${colors.bgLight} border-y-2 ${colors.borderColor} pointer-events-none z-10 rounded-lg shadow-md`}></div>
                    
                    {/* Lista scrolleable */}
                    <div 
                      ref={yearScrollRef}
                      onClick={(e) => e.stopPropagation()}
                      className="h-[200px] overflow-y-auto snap-y snap-mandatory scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400"
                      style={{ scrollPaddingTop: '76px', scrollPaddingBottom: '76px' }}
                    >
                      {/* Spacer inicial reducido */}
                      <div className="h-[20px]"></div>
                      
                      {years.map((year) => {
                        const isInCenter = selectedYear === year;
                        return (
                          <button
                            key={year}
                            onClick={(e) => handleYearClick(e, year)}
                            className={`
                              w-full h-12 snap-center flex items-center justify-center 
                              text-sm font-bold transition-all rounded-lg relative z-20
                              ${isInCenter
                                ? `${colors.textDark} scale-110 font-extrabold`
                                : 'text-gray-500 hover:text-gray-800 hover:scale-105'
                              }
                            `}
                          >
                            {year}
                          </button>
                        );
                      })}
                      
                      {/* Spacer final para scroll */}
                      <div className="h-[76px]"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected Display MEJORADO */}
              <div className={`mt-6 p-4 ${colors.bg} rounded-xl shadow-lg`}>
                <div className="flex items-center justify-center gap-3">
                  <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-white font-bold" />
                  </div>
                  <p className="text-lg font-bold text-white">
                    {selectedMonth !== null && selectedYear !== null
                      ? `${meses[selectedMonth]} ${selectedYear}`
                      : 'Selecciona mes y año'}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer MEJORADO */}
            <div className="px-6 py-4 bg-gray-50 border-t-2 border-gray-100 flex justify-between items-center" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={handleCancelar}
                className="px-5 py-2.5 text-sm bg-white hover:bg-gray-100 text-gray-700 border-2 border-gray-300 rounded-xl font-medium transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmar}
                disabled={selectedMonth === null || selectedYear === null}
                className={`px-6 py-2.5 text-sm ${colors.bg} ${colors.bgHover} text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl disabled:shadow-none`}
              >
                <Check className="w-4 h-4" />
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        /* Scrollbar personalizado */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        
        /* Animaciones */
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
        
        .scale-102 {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default MonthYearPicker;
