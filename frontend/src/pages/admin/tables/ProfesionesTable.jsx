import React, { useEffect, useState } from "react";
import { PenTool, Pencil, Trash2, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    getProfesiones,
    createProfesion,
    updateProfesion,
    deleteProfesion,
} from "@/api/profesionesApi";

export default function ProfesionesTable() {
    const [profesiones, setProfesiones] = useState([]);
    const [nuevoNombre, setNuevoNombre] = useState("");
    const [editandoId, setEditandoId] = useState(null);
    const [nombreEditado, setNombreEditado] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfesiones();
    }, []);

    const fetchProfesiones = async () => {
        setLoading(true);
        try {
            const data = await getProfesiones();
            setProfesiones(data || []);
        } catch (error) {
            console.error("❌ Error cargando profesiones:", error);
            setMensaje("❌ Error al cargar las profesiones.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!nuevoNombre.trim()) {
            setMensaje("⚠️ Ingresa un nombre válido para la profesión.");
            return;
        }
        try {
            await createProfesion({ nombre: nuevoNombre.trim() });
            setNuevoNombre("");
            setMensaje("✅ Profesión creada correctamente.");
            fetchProfesiones();
        } catch (error) {
            console.error("❌ Error al crear profesión:", error);
            setMensaje("❌ No se pudo crear la profesión.");
        }
    };

    const handleUpdate = async (id) => {
        if (!nombreEditado.trim()) {
            setMensaje("⚠️ El nombre no puede estar vacío.");
            return;
        }
        try {
            await updateProfesion(id, { nombre: nombreEditado.trim() });
            setEditandoId(null);
            setNombreEditado("");
            setMensaje("✅ Profesión actualizada correctamente.");
            fetchProfesiones();
        } catch (error) {
            console.error("❌ Error al actualizar profesión:", error);
            setMensaje("❌ No se pudo actualizar la profesión.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar esta profesión?")) return;

        try {
            await deleteProfesion(id);
            setMensaje("🗑️ Profesión eliminada correctamente.");
            fetchProfesiones();
        } catch (error) {
            console.error("❌ Error eliminando profesión:", error);
            setMensaje("❌ No se pudo eliminar la profesión.");
        }
    };

    return (
        <Card className="p-6 shadow-lg border border-gray-100 rounded-2xl">
            <CardContent>
                {/* 🔹 Encabezado */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                            <PenTool className="w-6 h-6 text-purple-600" />
                            Profesiones
                        </h2>
                        <p className="text-gray-500 text-sm">
                            Administra las profesiones registradas en el sistema
                        </p>
                    </div>

                    {/* 🆕 Nueva Profesión */}
                    <div className="flex mt-3 md:mt-0 space-x-2">
                        <input
                            type="text"
                            placeholder="Nueva profesión..."
                            value={nuevoNombre}
                            onChange={(e) => setNuevoNombre(e.target.value)}
                            className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <Button
                            onClick={handleCreate}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            <Plus className="w-4 h-4 mr-1" /> Agregar
                        </Button>
                        <Button
                            variant="outline"
                            onClick={fetchProfesiones}
                            className="border-gray-300 hover:bg-gray-100"
                        >
                            <RefreshCw className="w-4 h-4 mr-1" /> Actualizar
                        </Button>
                    </div>
                </div>

                {/* 💬 Mensaje */}
                {mensaje && (
                    <div className="mb-4 p-3 bg-purple-50 border border-purple-200 text-purple-700 text-sm rounded-lg">
                        {mensaje}
                    </div>
                )}

                {/* 📋 Tabla */}
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="py-12 text-center text-gray-500 flex flex-col items-center">
                            <RefreshCw className="w-10 h-10 animate-spin text-purple-500 mb-3" />
                            Cargando profesiones...
                        </div>
                    ) : profesiones.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            No hay profesiones registradas.
                        </div>
                    ) : (
                        <table className="w-full border border-gray-200 rounded-lg overflow-hidden text-sm">
                            <thead className="bg-gray-50 border-b-2 border-gray-200">
                            <tr>
                                <Th>ID</Th>
                                <Th>Nombre</Th>
                                <Th>Estado</Th>
                                <Th className="text-center">Acciones</Th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                            {profesiones.map((profesion) => (
                                <tr
                                    key={profesion.id_prof}
                                    className="hover:bg-gray-50 transition-all"
                                >
                                    <Td>#{profesion.id_prof}</Td>
                                    <Td>
                                        {editandoId === profesion.id_prof ? (
                                            <input
                                                value={nombreEditado}
                                                onChange={(e) => setNombreEditado(e.target.value)}
                                                className="border-2 border-gray-300 rounded px-2 py-1 text-sm w-full focus:ring-2 focus:ring-purple-500"
                                            />
                                        ) : (
                                            <span className="font-medium text-gray-800">
                          {profesion.desc_prof}
                        </span>
                                        )}
                                    </Td>
                                    <Td>
                                        {profesion.stat_prof === "A" ? (
                                            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full font-semibold">
                          Activo
                        </span>
                                        ) : (
                                            <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full font-semibold">
                          Inactivo
                        </span>
                                        )}
                                    </Td>
                                    <Td className="text-center space-x-2">
                                        {editandoId === profesion.id_prof ? (
                                            <Button
                                                size="sm"
                                                onClick={() => handleUpdate(profesion.id_prof)}
                                                className="bg-purple-600 hover:bg-purple-700"
                                            >
                                                Guardar
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setEditandoId(profesion.id_prof);
                                                    setNombreEditado(profesion.desc_prof);
                                                }}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleDelete(profesion.id_prof)}
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

/* 🧩 Componentes auxiliares */
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