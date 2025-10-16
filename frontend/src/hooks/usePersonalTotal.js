// ========================================================================
// 👥 usePersonalTotal.js - Hook para gestión de personal CENATE/Externo
// ========================================================================

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  getPersonalTotal,
  getDetallePersonal,
  getCumpleanerosMes,
  getAreas,
  getPersonalCntByArea
} from "@/api/personal";

export const usePersonalTotal = () => {
  const [personal, setPersonal] = useState([]);
  const [personalFiltrado, setPersonalFiltrado] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [areas, setAreas] = useState([]);

  // ======================================================
  // 📋 Cargar todo el personal
  // ======================================================
  const cargarPersonal = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getPersonalTotal();
      setPersonal(data);
      setPersonalFiltrado(data);
      return data;
    } catch (err) {
      const message = "Error al cargar el personal";
      setError(message);
      toast.error(message);
      console.error("❌", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // ======================================================
  // 🔍 Obtener detalle de un usuario
  // ======================================================
  const obtenerDetalle = useCallback(async (idUser) => {
    try {
      return await getDetallePersonal(idUser);
    } catch (err) {
      toast.error("Error al obtener detalle del usuario");
      console.error("❌", err);
      throw err;
    }
  }, []);

  // ======================================================
  // 🎂 Obtener cumpleañeros por mes
  // ======================================================
  const obtenerCumpleanerosMes = useCallback(async (mes) => {
    try {
      return await getCumpleanerosMes(mes);
    } catch (err) {
      console.error("❌ Error al obtener cumpleañeros:", err);
      return [];
    }
  }, []);

  // ======================================================
  // 📊 Cargar áreas para filtros
  // ======================================================
  const cargarAreas = useCallback(async () => {
    try {
      const data = await getAreas();
      setAreas(data);
      return data;
    } catch (err) {
      console.error("❌ Error al cargar áreas:", err);
      return [];
    }
  }, []);

  // ======================================================
  // 🔎 Filtrar personal
  // ======================================================
  const filtrarPersonal = useCallback((filtros) => {
    let resultado = [...personal];

    // Filtro por búsqueda general (nombre, documento, username)
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      resultado = resultado.filter(p =>
        p.nombre_completo?.toLowerCase().includes(busqueda) ||
        p.username?.toLowerCase().includes(busqueda) ||
        p.numero_documento?.toLowerCase().includes(busqueda)
      );
    }

    // Filtro por tipo de personal
    if (filtros.tipoPersonal && filtros.tipoPersonal !== "TODOS") {
      resultado = resultado.filter(p => p.tipo_personal === filtros.tipoPersonal);
    }

    // Filtro por rol
    if (filtros.rol && filtros.rol !== "TODOS") {
      resultado = resultado.filter(p =>
        p.roles?.includes(filtros.rol)
      );
    }

    // Filtro por estado
    if (filtros.estado && filtros.estado !== "TODOS") {
      resultado = resultado.filter(p => p.estado_usuario === filtros.estado);
    }

    // Filtro por IPRESS
    if (filtros.ipress) {
      const ipress = filtros.ipress.toLowerCase();
      resultado = resultado.filter(p =>
        p.ipress_asignada?.toLowerCase().includes(ipress)
      );
    }

    setPersonalFiltrado(resultado);
    return resultado;
  }, [personal]);

  // ======================================================
  // 🚀 Cargar datos al montar
  // ======================================================
  useEffect(() => {
    cargarPersonal();
    cargarAreas();
  }, [cargarPersonal, cargarAreas]);

  return {
    personal,
    personalFiltrado,
    loading,
    error,
    areas,
    cargarPersonal,
    obtenerDetalle,
    obtenerCumpleanerosMes,
    filtrarPersonal,
  };
};
