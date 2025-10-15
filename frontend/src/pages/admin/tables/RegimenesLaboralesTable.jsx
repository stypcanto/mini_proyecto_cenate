import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, RefreshCw, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    getRegimenes,
    createRegimen,
    updateRegimen,
    deleteRegimen,
} from "@/api/regimenesApi";

export default function RegimenesLaboralesTable() {
    const [data, setData] = useState([]);
    const [nuevo, setNuevo] = useState("");
    const [editando, setEditando] = useState(null);
    const [mensaje, setMensaje] = useState("");

    const fetchData = async () => {
        try {
            const res = await getRegimenes();
            setData(res || []);
        } catch {
            setMensaje("❌ Error al cargar regímenes.");
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const saveNew = async () => {
        try {
            await createRegimen({ nombre: nuevo });
            setNuevo("");
            setMensaje("✅ Régimen creado.");
            fetchData();
        } catch {
            setMensaje("❌ No se pudo crear régimen.");
        }
    };

    const updateOne = async (id) => {
        try {
            await updateRegimen(id, { nombre: editando.nombre });
            setEditando(null);
            setMensaje("✅ Actualizado correctamente.");
            fetchData();
        } catch {
            setMensaje("❌ No se pudo actualizar.");
        }
    };

    const deleteOne = async (id) => {
        if (!window.confirm("¿Eliminar régimen?")) return;
        try {
            await deleteRegimen(id);
            setMensaje("🗑️ Eliminado correctamente.");
            fetchData();
        } catch {
            setMensaje("❌ Error al eliminar.");
        }
    };

    return (
        <Card className="p-6 shadow-lg border border-gray-100 rounded-2xl">
            <CardContent>
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-2xl font-bold text-gray-800">Regímenes Laborales</h2>
                    <Button onClick={fetchData} variant="outline">
                        <RefreshCw className="w-4 h-4 mr-1" /> Actualizar
                    </Button>
                </div>

                <div className="flex space-x-2 mb-4">
                    <input
                        placeholder="Nuevo régimen..."
                        value={nuevo}
                        onChange={(e) => setNuevo(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm flex-1"
                    />
                    <Button onClick={saveNew} className="bg-green-600 hover:bg-green-700">
                        <Plus className="w-4 h-4 mr-1" /> Agregar
                    </Button>
                </div>

                {mensaje && <p className="text-green-600 text-sm mb-3">{mensaje}</p>}

                <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <Th>ID</Th>
                            <Th>Nombre</Th>
                            <Th>Acciones</Th>
                        </tr>
                        </thead>
                        <tbody>
                        {data.map((r) => (
                            <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <Td>#{r.id}</Td>
                                <Td>
                                    {editando?.id === r.id ? (
                                        <input
                                            value={editando.nombre}
                                            onChange={(e) =>
                                                setEditando({ ...editando, nombre: e.target.value })
                                            }
                                            className="border rounded px-2 py-1 w-full"
                                        />
                                    ) : (
                                        r.nombre
                                    )}
                                </Td>
                                <Td className="space-x-2">
                                    {editando?.id === r.id ? (
                                        <Button size="sm" onClick={() => updateOne(r.id)}>
                                            Guardar
                                        </Button>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setEditando(r)}
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => deleteOne(r.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </Td>
                            </motion.tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}

const Th = ({ children }) => (
    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wide">
        {children}
    </th>
);
const Td = ({ children }) => (
    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{children}</td>
);