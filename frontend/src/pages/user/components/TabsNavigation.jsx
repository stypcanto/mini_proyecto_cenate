// src/pages/admin/users/components/TabsNavigation.jsx
import React from 'react';
import { Users, Building, Briefcase, GraduationCap, Stethoscope } from 'lucide-react';
import TabButton from './modals/TabButton';

const TabsNavigation = ({ activeTab, setActiveTab }) => {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-wrap gap-2 overflow-x-auto">
          <TabButton
            active={activeTab === 'usuarios'}
            onClick={() => setActiveTab('usuarios')}
            icon={<Users className="w-4 h-4" />}
            label="Usuarios"
          />
          <TabButton
            active={activeTab === 'areas'}
            onClick={() => setActiveTab('areas')}
            icon={<Building className="w-4 h-4" />}
            label="Áreas"
          />
          <TabButton
            active={activeTab === 'regimenes'}
            onClick={() => setActiveTab('regimenes')}
            icon={<Briefcase className="w-4 h-4" />}
            label="Regímenes"
          />
          <TabButton
            active={activeTab === 'profesion'}
            onClick={() => setActiveTab('profesion')}
            icon={<GraduationCap className="w-4 h-4" />}
            label="Profesión"
          />
          <TabButton
            active={activeTab === 'especialidad'}
            onClick={() => setActiveTab('especialidad')}
            icon={<Stethoscope className="w-4 h-4" />}
            label="Especialidad"
          />
        </div>
      </div>
    </div>
  );
};

export default TabsNavigation;