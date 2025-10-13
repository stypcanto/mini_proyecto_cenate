// src/hooks/useAccountRequests.js
import { useState } from "react";
import {
    getPendingRequests,
    approveRequest,
    rejectRequest,
} from "../api/accountRequestsApi";

/**
 * 🧠 Hook personalizado para manejar las solicitudes de creación de cuentas.
 * Incluye lógica de carga, error y acciones administrativas.
 */
export const useAccountRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    /**
     * 🔄 Cargar solicitudes pendientes desde el backend
     */
    const fetchPending = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getPendingRequests();
            if (Array.isArray(data)) {
                setRequests(data);
            } else {
                console.warn("⚠️ Formato de datos inesperado:", data);
                setRequests([]);
            }
        } catch (err) {
            console.error("❌ Error al cargar solicitudes:", err);
            setError("Error al obtener las solicitudes pendientes.");
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    /**
     * ✅ Aprobar solicitud (con roles opcionales)
     */
    const handleApprove = async (id, payload = { roles: [], comentario: "" }) => {
        try {
            setLoading(true);
            await approveRequest(id, payload);
            await fetchPending();
            return { success: true };
        } catch (err) {
            console.error("❌ Error al aprobar solicitud:", err);
            setError("Error al aprobar la solicitud.");
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    /**
     * ❌ Rechazar solicitud
     */
    const handleReject = async (id, payload = { comentario: "" }) => {
        try {
            setLoading(true);
            await rejectRequest(id, payload);
            await fetchPending();
            return { success: true };
        } catch (err) {
            console.error("❌ Error al rechazar solicitud:", err);
            setError("Error al rechazar la solicitud.");
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    return {
        requests,
        loading,
        error,
        fetchPending,
        handleApprove,
        handleReject,
    };
};