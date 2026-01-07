import React, { useState } from "react";
import {
  Calendar,
  UserCog,
  ClipboardCheck,
  Trash2,
  Save,
  Filter,
} from "lucide-react";

/**
 * 🩺 AsignarGestorMedico.jsx
 * Módulo del Coordinador Médico para asignar gestores a los turnos.
 * Inspirado en tu interfaz HTML original.
 */
export default function AsignarGestorMedico() {
  const [turno, setTurno] = useState("Mañana (08:00)");
  const [fechaDesde, setFechaDesde] = useState("2025-10-25");
  const [fechaHasta, setFechaHasta] = useState("2025-10-27");
  const [modoEdicion, setModoEdicion] = useState(false);

  // Datos simulados (podrán provenir del backend luego)
  const [horarios, setHorarios] = useState([
    { fecha: "2025-10-25", medico: "Dr. Juan Pérez", horario: "08:00 - 14:00", gestor: "", estado: "Disponible" },
    { fecha: "2025-10-25", medico: "Dra. Ana López", horario: "08:00 - 14:00", gestor: "", estado: "Disponible" },
    { fecha: "2025-10-25", medico: "Dr. Carlos Díaz", horario: "08:00 - 14:00", gestor: "", estado: "Disponible" },
    { fecha: "2025-10-26", medico: "Dr. Juan Pérez", horario: "08:00 - 14:00", gestor: "", estado: "Disponible" },
    { fecha: "2025-10-26", medico: "Dra. Ana López", horario: "08:00 - 14:00", gestor: "", estado: "Disponible" },
    { fecha: "2025-10-27", medico: "Dr. Carlos Díaz", horario: "08:00 - 14:00", gestor: "", estado: "Disponible" },
  ]);

  const gestores = ["-- Ninguno --", "Gestora A", "Gestora B", "Gestor C"];

  const handleAsignarGestor = (index, gestor) => {
    const nuevos = [...horarios];
    nuevos[index].gestor = gestor;
    nuevos[index].estado = gestor !== "" && gestor !== "-- Ninguno --" ? "Asignado" : "Disponible";
    setHorarios(nuevos);
  };

  const total = horarios.length;
  const asignados = horarios.filter((h) => h.estado === "Asignado").length;
  const pendientes = total - asignados;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-cenate-blue text-center mb-1">
        Asignar Gestor – Turnos Médicos (CENATE)
      </h1>
      <p className="text-gray-600 text-center mb-6">
        Flujo: selecciona <strong>Turno → Fecha</strong>, luego puedes editar.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de filtros */}
        <div className="bg-white rounded-xl shadow-sm border p-4 col-span-2">
          <h2 className="font-semibold text-gray-700 mb-3">Filtros y selección</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-sm text-gray-600">Turno</label>
              <select
                value={turno}
                onChange={(e) => setTurno(e.target.value)}
                className="w-full border rounded-lg px-2 py-1 text-gray-700"
              >
                <option>Mañana (08:00)</option>
                <option>Tarde (14:00)</option>
                <option>Noche (20:00)</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600">Fecha desde</label>
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                className="w-full border rounded-lg px-2 py-1"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Fecha hasta</label>
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                className="w-full border rounded-lg px-2 py-1"
              />
            </div>

            <div className="flex items-end space-x-2">
              <button className="bg-cenate-blue text-white px-3 py-1.5 rounded-lg text-sm">
                Cargar tabla
              </button>
              <button
                onClick={() => setModoEdicion(!modoEdicion)}
                className="bg-gray-200 px-3 py-1.5 rounded-lg text-sm"
              >
                {modoEdicion ? "Modo vista" : "Editar"}
              </button>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <h3 className="font-semibold text-gray-700 mb-2">KPIs</h3>
          <p className="text-sm text-gray-600">
            Total filas (médico × día): <strong>{total}</strong>
          </p>
          <p className="text-sm text-green-600">Asignados: {asignados}</p>
          <p className="text-sm text-red-600 mb-2">Pendientes: {pendientes}</p>
          <hr className="my-2" />
          <p className="text-sm text-gray-500">
            Falta asignar a: Gestora A, Gestora B
          </p>
        </div>
      </div>

      {/* Tabla de horarios */}
      <div className="mt-6 bg-white rounded-xl shadow border">
        <div className="px-4 py-2 border-b bg-gray-100 rounded-t-xl">
          <h3 className="font-semibold text-gray-700">Tabla de horarios</h3>
        </div>
        <table className="w-full text-sm text-gray-700">
          <thead className="bg-cenate-blue text-white text-left">
            <tr>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Médico</th>
              <th className="px-4 py-2">Horario</th>
              <th className="px-4 py-2">Gestor</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {horarios.map((h, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{h.fecha}</td>
                <td className="px-4 py-2">{h.medico}</td>
                <td className="px-4 py-2">{h.horario}</td>
                <td className="px-4 py-2">
                  <select
                    disabled={!modoEdicion}
                    value={h.gestor}
                    onChange={(e) => handleAsignarGestor(i, e.target.value)}
                    className="border rounded-md px-2 py-1 text-sm"
                  >
                    {gestores.map((g, j) => (
                      <option key={j}>{g}</option>
                    ))}
                  </select>
                </td>
                <td
                  className={`px-4 py-2 font-semibold ${
                    h.estado === "Asignado" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {h.estado}
                </td>
                <td className="px-4 py-2">
                  <button
                    disabled={!modoEdicion}
                    className={`${
                      modoEdicion
                        ? "bg-cenate-blue text-white"
                        : "bg-gray-200 text-gray-400"
                    } px-3 py-1 rounded-lg text-sm`}
                  >
                    Guardar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Leyenda */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border p-4 w-full md:w-1/2">
        <h4 className="font-semibold text-gray-700 mb-2">Leyenda</h4>
        <ul className="space-y-1 text-sm">
          <li>
            <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            Asignado
          </li>
          <li>
            <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
            Disponible
          </li>
        </ul>
      </div>
    </div>
  );
}