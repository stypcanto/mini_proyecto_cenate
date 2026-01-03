// src/pages/admin/users/components/TabsNavigation.jsx
import React from 'react';
import { Users, Building, Briefcase, GraduationCap, Stethoscope, Shield, UserCog } from 'lucide-react';
import TabButton from './modals/TabButton';
import { useAuth } from '../../../context/AuthContext';

const TabsNavigation = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();

  // Verificar si es SUPERADMIN (único que puede ver todas las pestañas de configuración)
  const esSuperAdmin = user?.roles?.includes('SUPERADMIN');

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-wrap gap-2 overflow-x-auto">
          {/* Usuarios - visible para SUPERADMIN y ADMIN */}
          <TabButton
            active={activeTab === 'usuarios'}
            onClick={() => setActiveTab('usuarios')}
            icon={<Users className="w-4 h-4" />}
            label="Usuarios"
          />

          {/* Las siguientes pestañas solo son visibles para SUPERADMIN */}
          {esSuperAdmin && (
            <>
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
              <TabButton
                active={activeTab === 'roles'}
                onClick={() => setActiveTab('roles')}
                icon={<Shield className="w-4 h-4" />}
                label="Roles"
              />
              <TabButton
                active={activeTab === 'tipoprofesional'}
                onClick={() => setActiveTab('tipoprofesional')}
                icon={<UserCog className="w-4 h-4" />}
                label="Tipo de Profesional"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TabsNavigation;