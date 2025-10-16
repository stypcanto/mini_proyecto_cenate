// src/hooks/useDashboardData.js
import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "@/config/api";

const useDashboardData = () => {
  const [stats, setStats] = useState({
    usuarios: 0,
    activos: 0,
    externos: 0,
    cenate: 0,
    roles: 0,
    logs: 0,
    actividadSemanal: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [usuariosRes, rolesRes, logsRes] = await Promise.all([
          axios.get(`${API_URL}/personal/total`, { headers }),
          axios.get(`${API_URL}/roles/total`, { headers }),
          axios.get(`${API_URL}/audit/logs/count`, { headers }),
        ]);

        const usuarios = usuariosRes.data;
        const activos = usuarios.filter((u) => u.estado_usuario === "ACTIVO");
        const externos = usuarios.filter((u) => u.tipo_personal === "EXTERNO");
        const cenate = usuarios.filter((u) => u.tipo_personal === "CENATE");

        setStats({
          usuarios: usuarios.length,
          activos: activos.length,
          externos: externos.length,
          cenate: cenate.length,
          roles: rolesRes.data.total || 0,
          logs: logsRes.data.total || 0,
          actividadSemanal: logsRes.data.lastWeek || 0,
        });
      } catch (err) {
        console.error("❌ Error cargando dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { stats, loading };
};

export default useDashboardData; // 👈 Agregado para corregir el build