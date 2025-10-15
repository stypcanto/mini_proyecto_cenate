// src/pages/admin/tables/OrdenesCompraTable.jsx
import React, { useEffect, useState } from "react";
import { FileSpreadsheet, Pencil, Trash2, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getOrdenesCompra, createOrdenCompra, updateOrdenCompra, deleteOrdenCompra } from "@/api/ordenesCompraApi";

export default function OrdenesCompraTable() {
    const [ordenes, setOrdenes] = useState([]);
    const [nueva, setNueva] = useState({ num_oc: "", desc_oc: "", estado: "A" });
    const [editando, setEditando] = useState(null);
    const [mensaje, setMensaje] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrdenes();
    }, []);

    const fetchOrdenes = async () => {
        setLoading(true);
        try {
            const data = await getOrdenesCompra();
            setOrdenes(data || []);
        } catch {
            setMensaje("❌ Error al cargar las órdenes de compra.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!nueva.num_oc.trim()) return setMensaje("⚠️ Ingresa un número válido.");
        try {
            await createOrdenCompra(nueva);
            setNueva({ num_oc: "", desc_oc: "", estado: "A" });
            setMensaje("✅ Orden creada correctamente.");
            fetchOrdenes();
        } catch {
            setMensaje("❌ No se pudo crear la orden.");
        }
    };

    const handleUpdate = async (id) => {
        try {
            await updateOrdenCompra(id, editando);
            setMensaje("✅ Orden actualizada correctamente.");
            setEditando(null);
            fetchOrdenes();
        } catch {
            setMensaje("❌ No se pudo actualizar la orden.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Eliminar orden de compra?")) return;
        try {
            await deleteOrdenCompra(id);
            setMensaje("🗑️ Orden eliminada correctamente.");
            fetchOrdenes();
        } catch {
            setMensaje("❌ No se pudo eliminar la orden.");
        }
    };

    return (
        <Card className="p-6 rounded-2xl border border-gray-200 shadow-lg">
            <CardContent>
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FileSpreadsheet className="w-6 h-6 text-green-600" /> Órdenes de Compra
                    </h2>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="N° OC..."
                            value={nueva.num_oc}
                            onChange={(e) => setNueva({ ...nueva, num_oc: e.target.value })}
                            className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm"
                        />
                        <Button onClick={handleCreate} className="bg-green-600 hover:bg-green-700">
                            <Plus className="w-4 h-4 mr-1" /> Agregar
                        </Button>
                        <Button variant="outline" onClick={fetchOrdenes}>
                            <RefreshCw className="w-4 h-4 mr-1" /> Actualizar
                        </Button>
                    </div>
                </div>

                {mensaje && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                        {mensaje}
                    </div>
                )}

                {loading ? (
                    <p className="text-center text-gray-500 py-8">Cargando...</p>
                ) : (
                    <table className="w-full text-sm border border-gray-200 rounded-xl">
                        <thead className="bg-gray-50">
                        <tr>
                            <Th>ID</Th>
                            <Th>N° OC</Th>
                            <Th>Descripción</Th>
                            <Th>Fecha</Th>
                            <Th>Estado</Th>
                            <Th>Acciones</Th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {ordenes.map((o) => (
                            <tr key={o.id_oc}>
                                <Td>#{o.id_oc}</Td>
                                <Td>{o.num_oc}</Td>
                                <Td>{o.desc_oc || "—"}</Td>
                                <Td>{o.fecha_oc || "—"}</Td>
                                <Td>{o.estado === "A" ? "Activo" : "Inactivo"}</Td>
                                <Td className="flex gap-2 justify-center">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setEditando(o)}
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleDelete(o.id_oc)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </Td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </CardContent>
        </Card>
    );
}

const Th = ({ children }) => (
    <th className="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase">
        {children}
    </th>
);
const Td = ({ children }) => (
    <td className="px-4 py-2 text-sm text-gray-700">{children}</td>
);
