// =====================================================================
// 💼 API ÓRDENES DE COMPRA - Vinculadas al personal CNT
// =====================================================================
import { API_URL } from "@/lib/apiClient";

export const getOrdenesCompra = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/ordenes-compra`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    if (!res.ok) throw new Error("Error al obtener órdenes de compra");
    return res.json();
};

export const createOrdenCompra = async (data) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/ordenes-compra`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al crear orden de compra");
    return res.json();
};

export const updateOrdenCompra = async (id, data) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/ordenes-compra/${id}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al actualizar orden de compra");
    return res.json();
};

export const deleteOrdenCompra = async (id) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/ordenes-compra/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Error al eliminar orden de compra");
    return true;
};