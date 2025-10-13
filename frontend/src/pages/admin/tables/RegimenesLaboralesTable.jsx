import React, { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    getRegimenes,
    createRegimen,
    updateRegimen,
    deleteRegimen,
} from "@/api/regimenesApi";

export default function RegimenesLaboralesTable() {
    const [regimenes, setRegimenes] = useState([]);
    const [nuevoNombre, setNuevoNombre] = useState("");
    const [editandoId, setEditandoId] = useState(null);
    const [nombreEditado, setNombreEditado] = useState("");
    const [loading, setLoading] = useState(true);
    const [mensaje, setMensaje] = useState("");

    useEffect(() => {
        fetchRegimenes();
    }, []);

    const fetchRegimenes = async () => {
        setLoading(true);
        try {
            const data = await getRegimenes();
            setRegimenes(data || []);
        } catch (error) {
            console.error("Error cargando regímenes:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!nuevoNombre.trim()) {
            setMensaje("⚠️ Ingresa un nombre válido para el régimen.");
            return;
        }
        try {
            await createRegimen({ nombre: nuevoNombre.trim() });
            setNuevoNombre("");
            setMensaje("✅ Régimen laboral creado correctamente.");
            fetchRegimenes();
        } catch (error) {
            console.error("Error al crear régimen:", error);
            setMensaje("❌ No se pudo crear el régimen laboral.");
        }
    };

    const handleUpdate = async (id) => {
        if (!nombreEditado.trim()) {
            setMensaje("⚠️ El nombre no puede estar vacío.");
            return;
        }
        try {
            await updateRegimen(id, { nombre: nombreEditado.trim() });
            setEditandoId(null);
            setNombreEditado("");
            setMensaje("✅ Régimen actualizado exitosamente.");
            fetchRegimenes();
        } catch (error) {
            console.error("Error actualizando régimen:", error);
            setMensaje("❌ No se pudo actualizar el régimen.");
        }
    };

    const handleDelete = async (id) => {
        const confirmar = confirm("¿Seguro que deseas eliminar este régimen?");
        if (!confirmar) return;

        try {
            await deleteRegimen(id);
            setMensaje("🗑️ Régimen eliminado correctamente.");
            fetchRegimenes();
        } catch (error) {
            console.error("Error eliminando régimen:", error);
            setMensaje("❌ No se pudo eliminar el régimen.");
        }
    };

    return (
        <Card className="p-6 shadow-lg border border-gray-100 rounded-2xl">
            <CardContent>
                {/* 🔹 Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-1">
                            Regímenes Laborales
                        </h2>
                        <p className="text-gray-500 text-sm">
                            Administra los regímenes laborales del personal
                        </p>
                    </div>

                    <div className="flex mt-3 md:mt-0 space-x-2">
                        <input
                            type="text"
                            placeholder="Nuevo régimen..."
                            value={nuevoNombre}
                            onChange={(e) => setNuevoNombre(e.target.value)}
                            className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <Button
                            onClick={handleCreate}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <Plus className="w-4 h-4 mr-1" /> Agregar
                        </Button>
                        <Button
                            variant="outline"
                            onClick={fetchRegimenes}
                            className="border-gray-300 hover:bg-gray-100"
                        >
                            <RefreshCw className="w-4 h-4 mr-1" /> Actualizar
                        </Button>
                    </div>
                </div>

                {/* 🧭 Mensaje feedback */}
                {mensaje && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">
                        {mensaje}
                    </div>
                )}

                {/* 🗂 Tabla */}
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="py-12 text-center text-gray-500 flex flex-col items-center">
                            <RefreshCw className="w-10 h-10 animate-spin text-green-500 mb-3" />
                            Cargando regímenes...
                        </div>
                    ) : regimenes.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            No hay regímenes laborales registrados.
                        </div>
                    ) : (
                        <table className="w-full border border-gray-200 rounded-lg overflow-hidden text-sm">
                            <thead className="bg-gray-50 border-b-2 border-gray-200">
                            <tr>
                                <Th>ID</Th>
                                <Th>Nombre del Régimen</Th>
                                <Th className="text-center">Acciones</Th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                            {regimenes.map((regimen) => (
                                <tr
                                    key={regimen.id}
                                    className="hover:bg-gray-50 transition-all"
                                >
                                    <Td>#{regimen.id}</Td>
                                    <Td>
                                        {editandoId === regimen.id ? (
                                            <input
                                                value={nombreEditado}
                                                onChange={(e) => setNombreEditado(e.target.value)}
                                                className="border-2 border-gray-300 rounded px-2 py-1 text-sm w-full focus:ring-2 focus:ring-green-500"
                                            />
                                        ) : (
                                            <span className="font-medium text-gray-800">
                          {regimen.nombre}
                        </span>
                                        )}
                                    </Td>
                                    <Td className="text-center space-x-2">
                                        {editandoId === regimen.id ? (
                                            <Button
                                                size="sm"
                                                onClick={() => handleUpdate(regimen.id)}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                Guardar
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setEditandoId(regimen.id);
                                                    setNombreEditado(regimen.nombre);
                                                }}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleDelete(regimen.id)}
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

// 📦 Componentes auxiliares reutilizables
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