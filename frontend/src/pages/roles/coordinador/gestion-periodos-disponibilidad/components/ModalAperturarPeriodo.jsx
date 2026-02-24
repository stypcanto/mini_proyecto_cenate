// src/pages/coordinador/gestion-periodos-disponibilidad/components/ModalAperturarPeriodo.jsx
import React, { useEffect, useMemo, useState } from "react";
import { XCircle } from "lucide-react";
import { useAuth } from "../../../../../context/AuthContext";
import {
  monthNames,
  yyyymmFromYearMonth,
  firstDayOfMonth,
  lastDayOfMonth,
} from "../utils/ui";

export default function ModalAperturarPeriodo({ onClose, onCrear, aniosDisponibles = [] }) {
  const { user } = useAuth();
  
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth()); // 0-11
  const [anio, setAnio] = useState(now.getFullYear());

  const [fechaInicio, setFechaInicio] = useState(firstDayOfMonth(anio, mes));
  const [fechaFin, setFechaFin] = useState(lastDayOfMonth(anio, mes));
  const [idArea, setIdArea] = useState("");

  useEffect(() => {
    setFechaInicio(firstDayOfMonth(anio, mes));
    setFechaFin(lastDayOfMonth(anio, mes));
  }, [anio, mes]);

  // 🆕 Extraer áreas de los roles SOLO para coordinadores (IDs: 33, 35, 15)
  // Si es SUPERADMIN o ADMIN, mostrar todas las 3 áreas
  const COORDINATOR_ROLE_IDS = [33, 35, 15]; // IDs de roles coordinadores permitidos
  
  const areasDisponibles = useMemo(() => {
    console.log("🔍 DEBUG areasDisponibles - user:", user);
    console.log("🔍 DEBUG areasDisponibles - user?.roles:", user?.roles);
    console.log("🔍 DEBUG areasDisponibles - user?.mappingRoles:", user?.mappingRoles);
    
    // 🆕 Si es SUPERADMIN o ADMIN, mostrar todas las 3 áreas
    const isSuperAdmin = user?.roles?.includes("SUPERADMIN") || user?.roles?.includes("ADMIN");
    console.log("🔍 ¿Es SUPERADMIN/ADMIN?:", isSuperAdmin);
    
    if (isSuperAdmin) {
      console.log("✅ Usuario es SUPERADMIN/ADMIN, mostrando todas las áreas");
      return [
        { id: 2, descripcion: "SGDT - SERVICIO DE MEDICINA GENERAL - TELEURGENCIAS Y TELETRIAJE" },
        { id: 3, descripcion: "SGDT - SERVICIO DE TELE APOYO AL DIAGNOSTICO" },
        { id: 13, descripcion: "SGDT - SERVICIO DE MEDICINA ESPECIALIZADA" }
      ];
    }
    
    // Si no es SUPERADMIN, obtener áreas de los roles coordinadores
    if (!user?.mappingRoles || !Array.isArray(user.mappingRoles)) {
      console.log("⚠️ mappingRoles no disponible o no es array");
      return [];
    }
    
    console.log("✅ mappingRoles encontrado:", user.mappingRoles);
    
    // Filtrar solo roles coordinadores y obtener áreas únicas
    const areasSet = new Set();
    user.mappingRoles.forEach((rol) => {
      console.log("📌 Procesando rol:", rol);
      if (COORDINATOR_ROLE_IDS.includes(rol.codigo) && rol.idArea) {
        console.log("✅ Rol válido, agregando área:", { id: rol.idArea, descripcion: rol.descripcionArea });
        areasSet.add(JSON.stringify({
          id: rol.idArea,
          descripcion: rol.descripcionArea || `Área ${rol.idArea}`,
        }));
      } else {
        console.log("❌ Rol no válido o sin idArea");
      }
    });
    
    const resultado = Array.from(areasSet).map((areaJson) => JSON.parse(areaJson));
    console.log("🎯 Áreas disponibles finales:", resultado);
    return resultado;
  }, [user?.roles, user?.mappingRoles]);

  // Pre-seleccionar el área si hay solo una
  useEffect(() => {
    if (areasDisponibles.length === 1 && !idArea) {
      setIdArea(String(areasDisponibles[0].id));
    }
  }, [areasDisponibles, idArea]);

  // 🔄 Mostrar solo año actual + 1 año siguiente
  const years = useMemo(() => {
    const base = now.getFullYear();
    return [base, base + 1];
  }, [now]);

  const periodoCodigo = yyyymmFromYearMonth(anio, mes);
  const descripcion = `${monthNames[mes]} ${anio}`;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fechaInicio || !fechaFin || !idArea) return;

    if (new Date(fechaInicio) > new Date(fechaFin)) {
      window.alert("La fecha de inicio no puede ser mayor a la fecha fin.");
      return;
    }

    onCrear({
      periodo: periodoCodigo,
      descripcion,
      fechaInicio,
      fechaFin,
      idArea: parseInt(idArea), // 🆕 Pasar el idArea seleccionado
      instrucciones: null,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Aperturar Nuevo Periodo de Disponibilidad</h3>
          <button onClick={onClose} className="text-white hover:text-blue-100">
            <XCircle className="w-7 h-7" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
            <div className="font-semibold mb-1">Importante:</div>
            <div>
              Al aperturar un nuevo período de disponibilidad médica, se habilitará la captura de disponibilidad para el mes seleccionado.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Selecciona el mes</label>
              <select
                value={mes}
                onChange={(e) => setMes(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {monthNames.map((m, idx) => (
                  <option key={m} value={idx}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Selecciona el año</label>
              <select
                value={anio}
                onChange={(e) => setAnio(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 🆕 Combo para seleccionar área */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecciona el Área
              {areasDisponibles.length > 1 ? " *" : ""}
            </label>
            {areasDisponibles.length > 0 ? (
              <select
                value={idArea}
                onChange={(e) => setIdArea(e.target.value)}
                required={areasDisponibles.length > 0}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">-- Selecciona un área --</option>
                {areasDisponibles.map((area) => (
                  <option key={area.id} value={area.id}>
                    SGDT - {area.descripcion}
                  </option>
                ))}
              </select>
            ) : (
              <div className="w-full px-3 py-2 border border-red-300 rounded-lg bg-red-50 text-red-800 text-sm">
                ❌ No tienes áreas asignadas
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Inicio</label>
              <input
                type="date"
                required
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Fin</label>
              <input
                type="date"
                required
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
            <div className="text-sm text-green-800 font-semibold">Periodo a aperturar:</div>
            <div className="text-2xl font-extrabold text-green-900 mt-1">{descripcion}</div>
            <div className="text-xs text-green-700 mt-1">Código: {periodoCodigo}</div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Confirmar Apertura
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
