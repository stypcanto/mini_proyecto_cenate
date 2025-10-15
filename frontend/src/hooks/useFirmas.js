// src/hooks/useFirmas.js
import { useState, useCallback } from "react";
import * as FirmasAPI from "@/api/firmasApi";
import toast from "react-hot-toast";

export const useFirmas = () => {
    const [firmas, setFirmas] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchFirmas = useCallback(async () => {
        setLoading(true);
        try {
            const data = await FirmasAPI.getFirmas();
            setFirmas(data);
        } catch {
            toast.error("Error al cargar firmas digitales");
        } finally {
            setLoading(false);
        }
    }, []);

    const createFirma = async (firma) => {
        try {
            await FirmasAPI.createFirma(firma);
            toast.success("Firma agregada correctamente");
            fetchFirmas();
        } catch {
            toast.error("Error al crear firma");
        }
    };

    const deleteFirma = async (id) => {
        if (!window.confirm("¿Eliminar firma digital?")) return;
        try {
            await FirmasAPI.deleteFirma(id);
            toast.success("Firma eliminada correctamente");
            fetchFirmas();
        } catch {
            toast.error("Error al eliminar firma");
        }
    };

    return { firmas, loading, fetchFirmas, createFirma, deleteFirma };
};