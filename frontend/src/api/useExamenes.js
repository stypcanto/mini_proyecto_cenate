// ========================================================================
// 🧪 Hook: useExamenes.js
// Descripción: Control centralizado para gestionar exámenes médicos
// ========================================================================

import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "@/lib/apiClient";
import toast from "react-hot-toast";

export const useExamenes = () => {
  const [examenes, setExamenes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ======================================================
  // 📡 Obtener todos los exámenes
  // ======================================================
  const fetchExamenes = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_URL}/examenes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExamenes(data || []);
    } catch (err) {
      console.error("❌ Error al obtener exámenes:", err);
      setError("No se pudieron cargar los exámenes");
      toast.error("Error al cargar los exámenes");
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // ➕ Crear nuevo examen
  // ======================================================
  const createExamen = async (nuevoExamen) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(`${API_URL}/examenes`, nuevoExamen, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Examen creado exitosamente");
      fetchExamenes(); // refrescar lista
      return data;
    } catch (err) {
      console.error("❌ Error al crear examen:", err);
      toast.error("No se pudo crear el examen");
      throw err;
    }
  };

  // ======================================================
  // ✏️ Actualizar examen existente
  // ======================================================
  const updateExamen = async (id, examenActualizado) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/examenes/${id}`, examenActualizado, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Examen actualizado correctamente");
      fetchExamenes();
    } catch (err) {
      console.error("❌ Error al actualizar examen:", err);
      toast.error("No se pudo actualizar el examen");
    }
  };

  // ======================================================
  // 🗑️ Eliminar examen
  // ======================================================
  const deleteExamen = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este examen?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/examenes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Examen eliminado correctamente");
      fetchExamenes();
    } catch (err) {
      console.error("❌ Error al eliminar examen:", err);
      toast.error("No se pudo eliminar el examen");
    }
  };

  // ======================================================
  // 🔄 Auto carga al montar
  // ======================================================
  useEffect(() => {
    fetchExamenes();
  }, []);

  return {
    examenes,
    loading,
    error,
    fetchExamenes,
    createExamen,
    updateExamen,
    deleteExamen,
  };
};

export default useExamenes;