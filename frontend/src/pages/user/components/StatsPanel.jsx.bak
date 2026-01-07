// src/pages/admin/users/components/StatsPanel.jsx
import React from 'react';
import { Users, Building, MapPin, Shield, CheckCircle, XCircle } from 'lucide-react';
import StatCard from './modals/StatCard';

const StatsPanel = ({ stats }) => (
  <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
    {/* Primera fila: Total, Internos, Externos, Con Acceso Admin */}
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 sm:gap-4 mb-3">
      <StatCard 
        title="Total Personal" 
        value={stats.total} 
        icon={<Users />} 
        color="blue" 
      />
      <StatCard 
        title="Internos CENATE" 
        value={stats.internos} 
        icon={<Building />} 
        color="teal" 
      />
      <StatCard 
        title="Externos" 
        value={stats.externos} 
        icon={<MapPin />} 
        color="orange" 
      />
      <StatCard 
        title="Con Acceso Admin" 
        value={stats.conAccesoAdmin} 
        icon={<Shield />} 
        color="purple" 
      />
    </div>
    
    {/* Segunda fila: Activos e Inactivos */}
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 sm:gap-4">
      <StatCard 
        title="Usuarios Activos" 
        value={stats.activos} 
        icon={<CheckCircle />} 
        color="green" 
      />
      <StatCard 
        title="Usuarios Inactivos" 
        value={stats.inactivos} 
        icon={<XCircle />} 
        color="red" 
      />
    </div>
  </div>
);

export default StatsPanel;