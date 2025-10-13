// src/api/permisosApi.js
import { API_BASE } from "./config";

export const getPermisosByRol = async (idRol) => {
    const res = await fetch(`${API_BASE}/admin/permisos/${idRol}`);
    if (!res.ok) throw new Error("Error al obtener permisos");
    return res.json();
};

export const updatePermiso = async (id, permiso) => {
    const res = await fetch(`${API_BASE}/admin/permisos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(permiso),
    });
    if (!res.ok) throw new Error("Error al actualizar permiso");
    return res.json();
};