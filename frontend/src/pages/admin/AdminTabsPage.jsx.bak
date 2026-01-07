// ========================================================================
// 📋 AdminTabsPage.jsx – Gestión por Pestañas (CENATE 2025)
// ------------------------------------------------------------------------
// Componente principal que maneja las pestañas de administración
// ========================================================================

import React, { useState } from 'react';
import {
  Users,
  Building,
  Briefcase,
  GraduationCap,
  UserPlus
} from 'lucide-react';
import ProfesionCRUD from './components/ProfesionCRUD';
import AreasCRUD from './components/AreasCRUD';

export default function AdminTabsPage() {
  const [activeTab, setActiveTab] = useState('areas');

  const tabs = [
    { id: 'usuarios', label: 'Usuarios', icon: Users },
    { id: 'areas', label: 'Áreas', icon: Building },
    { id: 'regimenes', label: 'Regímenes', icon: Briefcase },
    { id: 'profesion', label: 'Profesión', icon: GraduationCap },
    { id: 'especialidad', label: 'Especialidad', icon: UserPlus }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-6 py-5">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">
              Administración del Sistema
            </h1>
            <p className="text-sm text-gray-500">
              Gestión de usuarios, roles, áreas y regímenes laborales
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200 -mb-[1px]">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {activeTab === 'areas' && <AreasCRUD />}
        {activeTab === 'profesion' && <ProfesionCRUD />}
        
        {/* Placeholder para otras tabs */}
        {(activeTab === 'usuarios' || activeTab === 'regimenes' || activeTab === 'especialidad') && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              {activeTab === 'usuarios' && <Users className="w-8 h-8 text-gray-400" />}
              {activeTab === 'regimenes' && <Briefcase className="w-8 h-8 text-gray-400" />}
              {activeTab === 'especialidad' && <UserPlus className="w-8 h-8 text-gray-400" />}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Gestión de {tabs.find(t => t.id === activeTab)?.label}
            </h3>
            <p className="text-gray-500 mb-4">
              Aquí podrás administrar todas las {tabs.find(t => t.id === activeTab)?.label.toLowerCase()} de la organización
            </p>
            <p className="text-sm text-gray-400">Módulo en desarrollo</p>
          </div>
        )}
      </div>
    </div>
  );
}
