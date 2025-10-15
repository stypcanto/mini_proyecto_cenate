import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, RefreshCw, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAreas, createArea, updateArea, deleteArea } from "@/api/areasApi";

export default function AreasTable() {
    const [areas, setAreas] = useState([]);
    const [nuevo, setNuevo] = useState("");
    const [editando, setEditando] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchAreas = async () => {
        setLoading(true);
        try {
            const data = await getAreas();
            setAreas(data || []);
        } catch {
            setMensaje("❌ Error al cargar áreas.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAreas();
    }, []);

    const handleCreate = async () => {
        if (!nuevo.trim()) return setMensaje("⚠️ Ingresa un nombre válido.");
        try {
            await createArea({ nombre: nuevo.trim() });
            setNuevo("");
            setMensaje("✅ Área creada correctamente.");
            fetchAreas();
        } catch {
            setMensaje("❌ Error al crear área.");
        }
    };

    const handleUpdate = async (id) => {
        if (!editando?.nombre?.trim()) return;
        try {
            await updateArea(id, { nombre: editando.nombre });
            setEditando(null);
            setMensaje("✅ Área actualizada correctamente.");
            fetchAreas();
        } catch {
            setMensaje("❌ Error al actualizar área.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Eliminar área?")) return;
        try {
            await deleteArea(id);
            setMensaje("🗑️ Área eliminada correctamente.");
            fetchAreas();
        } catch {
            setMensaje("❌ No se pudo eliminar área.");
        }
    };

    const filtradas = areas.filter((a) =>
        a.nombre?.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <Card className="p-6 shadow-lg border border-gray-100 rounded-2xl bg-white/90 backdrop-blur">
            <CardContent>
                <Header title="Gestión de Áreas" fetch={fetchAreas} setBusqueda={setBusqueda} />
                <FormCreate
                    nuevo={nuevo}
                    setNuevo={setNuevo}
                    handleCreate={handleCreate}
                    mensaje={mensaje}
                />
                <DataTable
                    data={filtradas}
                    editando={editando}
                    setEditando={setEditando}
                    handleUpdate={handleUpdate}
                    handleDelete={handleDelete}
                    loading={loading}
                />
            </CardContent>
        </Card>
    );
}

/* 🔹 Subcomponentes reutilizables */
const Header = ({ title, fetch, setBusqueda }) => (
    <div className="flex flex-col md:flex-row justify-between items-center mb-5">
        <h2 className="text-2xl font-bold text-gray-800 mb-3 md:mb-0">{title}</h2>
        <div className="flex space-x-2 items-center">
            <input
                placeholder="Buscar..."
                onChange={(e) => setBusqueda(e.target.value)}
                className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
            <Button variant="outline" onClick={fetch}>
                <RefreshCw className="w-4 h-4 mr-1" /> Actualizar
            </Button>
        </div>
    </div>
);

const FormCreate = ({ nuevo, setNuevo, handleCreate, mensaje }) => (
    <div className="flex gap-3 mb-4">
        <input
            value={nuevo}
            onChange={(e) => setNuevo(e.target.value)}
            placeholder="Nueva área..."
            className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 focus:ring-2 focus:ring-blue-500"
        />
        <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-1" /> Agregar
        </Button>
        {mensaje && <p className="text-blue-600 text-sm mt-2">{mensaje}</p>}
    </div>
);

const DataTable = ({ data, editando, setEditando, handleUpdate, handleDelete, loading }) => {
    if (loading)
        return <p className="text-center py-6 text-gray-500">Cargando áreas...</p>;

    if (data.length === 0)
        return <p className="text-center py-6 text-gray-500">No hay áreas registradas.</p>;

    return (
        <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                    <Th>ID</Th>
                    <Th>Nombre</Th>
                    <Th className="text-center">Acciones</Th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {data.map((area) => (
                    <motion.tr key={area.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Td>#{area.id}</Td>
                        <Td>
                            {editando?.id === area.id ? (
                                <input
                                    value={editando.nombre}
                                    onChange={(e) =>
                                        setEditando({ ...editando, nombre: e.target.value })
                                    }
                                    className="border rounded px-2 py-1 w-full"
                                />
                            ) : (
                                <span className="font-medium text-gray-800">{area.nombre}</span>
                            )}
                        </Td>
                        <Td className="text-center space-x-2">
                            {editando?.id === area.id ? (
                                <Button size="sm" onClick={() => handleUpdate(area.id)}>
                                    Guardar
                                </Button>
                            ) : (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditando(area)}
                                >
                                    <Pencil className="w-4 h-4" />
                                </Button>
                            )}
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(area.id)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </Td>
                    </motion.tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

const Th = ({ children, className }) => (
    <th
        className={`px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wide ${className}`}
    >
        {children}
    </th>
);
const Td = ({ children, className }) => (
    <td className={`px-6 py-3 text-gray-700 ${className}`}>{children}</td>
);