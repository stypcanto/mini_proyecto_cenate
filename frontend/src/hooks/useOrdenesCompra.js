// src/hooks/useOrdenesCompra.js
import { useState, useCallback } from "react";
import * as OCAPI from "@/api/ordenesCompraApi";
import toast from "react-hot-toast";

export const useOrdenesCompra = () => {
    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchOrdenes = useCallback(async () => {
        setLoading(true);
        try {
            const data = await OCAPI.getOrdenesCompra();
            setOrdenes(data);
        } catch {
            toast.error("Error al cargar órdenes de compra");
        } finally {
            setLoading(false);
        }
    }, []);

    const createOrden = async (orden) => {
        try {
            await OCAPI.createOrdenCompra(orden);
            toast.success("Orden registrada correctamente");
            fetchOrdenes();
        } catch {
            toast.error("Error al registrar orden");
        }
    };

    const deleteOrden = async (id) => {
        if (!window.confirm("¿Eliminar esta orden de compra?")) return;
        try {
            await OCAPI.deleteOrdenCompra(id);
            toast.success("Orden eliminada correctamente");
            fetchOrdenes();
        } catch {
            toast.error("Error al eliminar orden");
        }
    };

    return { ordenes, loading, fetchOrdenes, createOrden, deleteOrden };
};