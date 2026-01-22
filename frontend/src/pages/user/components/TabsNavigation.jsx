// src/pages/admin/users/components/TabsNavigation.jsx
import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Users, Building, Briefcase, GraduationCap, Stethoscope, Shield, UserCog, Target, Video, FileText, ChevronDown, MoreHorizontal, Package } from 'lucide-react';
import TabButton from './modals/TabButton';
import { useAuth } from '../../../context/AuthContext';

const TabsNavigation = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [visibleTabsCount, setVisibleTabsCount] = useState(6);
  const moreMenuRef = useRef(null);
  const buttonRef = useRef(null);
  const containerRef = useRef(null);
  const tabsRefs = useRef({});

  // Verificar si es SUPERADMIN (único que puede ver todas las pestañas de configuración)
  const esSuperAdmin = user?.roles?.includes('SUPERADMIN');

  // Todas las pestañas en orden de prioridad
  const allTabs = useMemo(() => [
    { id: 'usuarios', icon: Users, label: 'Usuarios', visible: true },
    { id: 'areas', icon: Building, label: 'Áreas', visible: esSuperAdmin },
    { id: 'regimenes', icon: Briefcase, label: 'Regímenes', visible: esSuperAdmin },
    { id: 'profesion', icon: GraduationCap, label: 'Profesión', visible: esSuperAdmin },
    { id: 'especialidad', icon: Stethoscope, label: 'Especialidad', visible: esSuperAdmin },
    { id: 'roles', icon: Shield, label: 'Roles', visible: esSuperAdmin },
    { id: 'tipoprofesional', icon: UserCog, label: 'Tipo de Profesional', visible: esSuperAdmin },
    { id: 'estrategias', icon: Target, label: 'Estrategias Institucionales', visible: esSuperAdmin },
    { id: 'tiposatencion', icon: Video, label: 'Tipos de Atención', visible: esSuperAdmin },
    { id: 'procedimientos', icon: FileText, label: 'Procedimientos', visible: esSuperAdmin },
    { id: 'cie10', icon: FileText, label: 'CIE10', visible: esSuperAdmin },
    { id: 'medicamentos', icon: FileText, label: 'Medicamentos', visible: esSuperAdmin },
    { id: 'tiposbolsas', icon: Package, label: 'Tipos de Bolsas', visible: esSuperAdmin },
  ], [esSuperAdmin]);

  // Filtrar pestañas visibles
  const visibleTabs = useMemo(() => allTabs.filter(tab => tab.visible), [allTabs]);

  // Calcular cuántas pestañas caben
  const calculateVisibleTabs = useCallback(() => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;
    const moreButtonWidth = 120; // Ancho aproximado del botón "Más"
    const gap = 8; // gap-2 = 8px
    let availableWidth = containerWidth - moreButtonWidth - gap;
    let count = 0;
    let totalWidth = 0;

    // Calcular ancho de cada pestaña visible
    for (let i = 0; i < visibleTabs.length; i++) {
      const tabId = visibleTabs[i].id;
      const tabElement = tabsRefs.current[tabId];
      
      if (tabElement) {
        const tabWidth = tabElement.offsetWidth;
        if (totalWidth + tabWidth + gap <= availableWidth) {
          totalWidth += tabWidth + gap;
          count++;
        } else {
          break;
        }
      } else {
        // Si el elemento aún no existe, estimar ancho basado en el label
        const estimatedWidth = visibleTabs[i].label.length * 8 + 80; // Estimación aproximada
        if (totalWidth + estimatedWidth + gap <= availableWidth) {
          totalWidth += estimatedWidth + gap;
          count++;
        } else {
          break;
        }
      }
    }

    // Asegurar que al menos se muestre "Usuarios" si está visible
    if (count === 0 && visibleTabs.length > 0) {
      count = 1;
    }

    setVisibleTabsCount(count);
  }, [visibleTabs]);

  // Recalcular cuando cambie el tamaño de la ventana o las pestañas visibles
  useEffect(() => {
    calculateVisibleTabs();
    
    const handleResize = () => {
      calculateVisibleTabs();
    };

    window.addEventListener('resize', handleResize);
    
    // Recalcular después de un pequeño delay para asegurar que los elementos estén renderizados
    const timeoutId = setTimeout(() => {
      calculateVisibleTabs();
    }, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [visibleTabs, activeTab, calculateVisibleTabs]);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowMoreMenu(false);
      }
    };

    if (showMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showMoreMenu]);

  // Dividir pestañas en visibles y ocultas
  const tabsToShow = visibleTabs.slice(0, visibleTabsCount);
  const tabsInMoreMenu = visibleTabs.slice(visibleTabsCount);

  return (
    <div className="relative bg-gradient-to-b from-white to-gray-50/30 border-b border-gray-200 shadow-sm">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div ref={containerRef} className="flex items-center gap-2 flex-nowrap">
          {/* Pestañas visibles según espacio disponible */}
          {tabsToShow.map((tab) => {
            const Icon = tab.icon;
            return (
              <div
                key={tab.id}
                ref={(el) => {
                  if (el) tabsRefs.current[tab.id] = el;
                }}
              >
                <TabButton
                  active={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  icon={<Icon className="w-4 h-4" />}
                  label={tab.label}
                />
              </div>
            );
          })}

          {/* Botón "Más" con menú dropdown - solo si hay pestañas ocultas */}
          {tabsInMoreMenu.length > 0 && (
            <div className="relative flex-shrink-0">
              <button
                ref={buttonRef}
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className={`group relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  tabsInMoreMenu.some(tab => activeTab === tab.id)
                    ? 'bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] text-white shadow-md hover:shadow-lg hover:from-[#084682] hover:to-[#1e4ed8] transform hover:scale-[1.02]'
                    : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm hover:text-gray-900'
                }`}
              >
                <MoreHorizontal className={`w-4 h-4 transition-transform duration-200 ${
                  tabsInMoreMenu.some(tab => activeTab === tab.id) ? 'text-white' : 'text-gray-600 group-hover:text-gray-900'
                }`} />
                <span>Más</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  showMoreMenu ? 'rotate-180' : ''
                } ${tabsInMoreMenu.some(tab => activeTab === tab.id) ? 'text-white' : 'text-gray-600 group-hover:text-gray-900'}`} />
              </button>

              {/* Menú dropdown */}
              {showMoreMenu && (
                <div
                  ref={moreMenuRef}
                  className="absolute left-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  <div className="p-2">
                    {tabsInMoreMenu.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setActiveTab(tab.id);
                            setShowMoreMenu(false);
                          }}
                          className={`group/item w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                            isActive
                              ? 'bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] text-white shadow-sm'
                              : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md border border-transparent hover:border-blue-200'
                          }`}
                        >
                          <Icon className={`w-4 h-4 transition-colors duration-200 ${
                            isActive 
                              ? 'text-white' 
                              : 'text-gray-600 group-hover/item:text-blue-600'
                          }`} />
                          <span className="flex-1 text-left font-semibold">{tab.label}</span>
                          {isActive && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TabsNavigation;