// =====================================================================
// 🧠 API PROFESIONES - Gestión de profesiones del personal (CENATE)
// =====================================================================
import { API_URL } from "@/config/api";

export const getProfesiones = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/profesiones`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    if (!res.ok) throw new Error("Error al obtener profesiones");
    return res.json();
};

export const createProfesion = async (data) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/profesiones`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al crear profesión");
    return res.json();
};

export const updateProfesion = async (id, data) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/profesiones/${id}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al actualizar profesión");
    return res.json();
};

export const deleteProfesion = async (id) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/profesiones/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Error al eliminar profesión");
    return true;
};