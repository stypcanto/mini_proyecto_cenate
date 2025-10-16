import React, { useEffect, useState } from "react";
import { Users, ShieldCheck, Activity, FileText, Clock } from "lucide-react";
import useDashboardData from "@/api/useDashboardData";

export default function AdminDashboard() {
  const { stats, loading } = useDashboardData();

  if (loading) return <p className="text-center text-gray-500">Cargando estadísticas...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">📊 Panel de Administración</h1>
      <p className="text-gray-500">Monitorea y gestiona el ecosistema digital del CENATE</p>

      {/* Tarjetas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={<Users />} label="Usuarios" value={stats.usuarios} />
        <StatCard icon={<ShieldCheck />} label="Roles" value={stats.roles} />
        <StatCard icon={<FileText />} label="Logs del sistema" value={stats.logs} />
        <StatCard icon={<Activity />} label="Actividad semanal" value={stats.actividadSemanal} />
      </div>

      {/* Distribución por tipo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard color="bg-green-100 text-green-700" label="Activos" value={stats.activos} />
        <StatCard color="bg-blue-100 text-blue-700" label="CENATE" value={stats.cenate} />
        <StatCard color="bg-yellow-100 text-yellow-700" label="Externos" value={stats.externos} />
      </div>

      {/* Próximos cumpleaños */}
      <section className="bg-white shadow p-5 rounded-xl">
        <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-600" />
          Cumpleaños del mes
        </h2>
        <CumpleanerosList />
      </section>
    </div>
  );
}

function StatCard({ icon, label, value, color = "bg-white" }) {
  return (
    <div className={`flex items-center gap-3 shadow-sm rounded-xl p-4 ${color}`}>
      <div className="text-indigo-600">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-xl font-semibold">{value}</p>
      </div>
    </div>
  );
}

function CumpleanerosList() {
  const [cumples, setCumples] = React.useState([]);

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${import.meta.env.VITE_API_URL}/personal/cumpleaneros/mes/${new Date().getMonth() + 1}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(setCumples)
      .catch(console.error);
  }, []);

  return cumples.length > 0 ? (
    <ul className="divide-y divide-gray-100">
      {cumples.map((c, i) => (
        <li key={i} className="py-2 flex justify-between text-sm text-gray-700">
          <span>{c.nombre_completo}</span>
          <span className="text-gray-400">{c.fecha_nacimiento}</span>
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-gray-500 text-sm">🎉 No hay cumpleaños este mes.</p>
  );
}