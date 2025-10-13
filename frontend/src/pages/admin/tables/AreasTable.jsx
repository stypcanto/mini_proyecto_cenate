import React, { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    getAreas,
    createArea,
    updateArea,
    deleteArea,
} from "@/api/areasApi";

export default function AreasTable() {
    const [areas, setAreas] = useState([]);
    const [nuevoNombre, setNuevoNombre] = useState("");
    const [editandoId, setEditandoId] = useState(null);
    const [nombreEditado, setNombreEditado] = useState("");
    const [loading, setLoading] = useState(true);
    const [mensaje, setMensaje] = useState("");

    useEffect(() => {
        fetchAreas();
    }, []);

    const fetchAreas = async () => {
        setLoading(true);
        try {
            const data = await getAreas();
            setAreas(data || []);
        } catch (error) {
            console.error("Error cargando áreas:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!nuevoNombre.trim()) {
            setMensaje("⚠️ Ingresa un nombre válido para el área.");
            return;
        }
        try {
            await createArea({ nombre: nuevoNombre.trim() });
            setNuevoNombre("");
            setMensaje("✅ Área creada exitosamente.");
            fetchAreas();
        } catch (error) {
            console.error("Error creando área:", error);
            setMensaje("❌ No se pudo crear el área.");
        }
    };

    const handleUpdate = async (id) => {
        if (!nombreEditado.trim()) {
            setMensaje("⚠️ El nombre no puede estar vacío.");
            return;
        }
        try {
            await updateArea(id, { nombre: nombreEditado.trim() });
            setEditandoId(null);
            setNombreEditado("");
            setMensaje("✅ Área actualizada correctamente.");
            fetchAreas();
        } catch (error) {
            console.error("Error actualizando área:", error);
            setMensaje("❌ No se pudo actualizar el área.");
        }
    };

    const handleDelete = async (id) => {
        const confirmar = confirm("¿Seguro que deseas eliminar esta área?");
        if (!confirmar) return;

        try {
            await deleteArea(id);
            setMensaje("🗑️ Área eliminada correctamente.");
            fetchAreas();
        } catch (error) {
            console.error("Error eliminando área:", error);
            setMensaje("❌ No se pudo eliminar el área.");
        }
    };

    return (
        <Card className="p-6 shadow-lg border border-gray-100 rounded-2xl">
            <CardContent>
                {/* Encabezado */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-1">
                            Gestión de Áreas
                        </h2>
                        <p className="text-gray-500 text-sm">
                            Administra las áreas internas y externas del sistema
                        </p>
                    </div>

                    <div className="flex mt-3 md:mt-0 space-x-2">
                        <input
                            type="text"
                            placeholder="Nueva área..."
                            value={nuevoNombre}
                            onChange={(e) => setNuevoNombre(e.target.value)}
                            className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-1" /> Agregar
                        </Button>
                        <Button
                            variant="outline"
                            onClick={fetchAreas}
                            className="border-gray-300 hover:bg-gray-100"
                        >
                            <RefreshCw className="w-4 h-4 mr-1" /> Actualizar
                        </Button>
                    </div>
                </div>

                {/* Mensaje feedback */}
                {mensaje && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-lg">
                        {mensaje}
                    </div>
                )}

                {/* Tabla */}
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="py-12 text-center text-gray-500 flex flex-col items-center">
                            <RefreshCw className="w-10 h-10 animate-spin text-blue-500 mb-3" />
                            Cargando áreas...
                        </div>
                    ) : areas.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            No hay áreas registradas.
                        </div>
                    ) : (
                        <table className="w-full border border-gray-200 rounded-lg overflow-hidden text-sm">
                            <thead className="bg-gray-50 border-b-2 border-gray-200">
                            <tr>
                                <Th>ID</Th>
                                <Th>Nombre del Área</Th>
                                <Th className="text-center">Acciones</Th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                            {areas.map((area) => (
                                <tr key={area.id} className="hover:bg-gray-50 transition-all">
                                    <Td>#{area.id}</Td>
                                    <Td>
                                        {editandoId === area.id ? (
                                            <input
                                                value={nombreEditado}
                                                onChange={(e) => setNombreEditado(e.target.value)}
                                                className="border-2 border-gray-300 rounded px-2 py-1 text-sm w-full focus:ring-2 focus:ring-blue-500"
                                            />
                                        ) : (
                                            <span className="font-medium text-gray-800">{area.nombre}</span>
                                        )}
                                    </Td>
                                    <Td className="text-center space-x-2">
                                        {editandoId === area.id ? (
                                            <Button
                                                size="sm"
                                                onClick={() => handleUpdate(area.id)}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                Guardar
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setEditandoId(area.id);
                                                    setNombreEditado(area.nombre);
                                                }}
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
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

// 🧩 Helpers para celdas y cabeceras
const Th = ({ children, className }) => (
    <th
        className={`px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider ${className}`}
    >
        {children}
    </th>
);

const Td = ({ children, className }) => (
    <td className={`px-6 py-3 text-gray-700 ${className}`}>{children}</td>
);