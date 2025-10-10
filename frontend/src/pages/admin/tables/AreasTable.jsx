import React, { useEffect, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAreas, createArea, updateArea, deleteArea } from "@/api/areasApi";

export default function AreasTable() {
    const [areas, setAreas] = useState([]);
    const [nuevoNombre, setNuevoNombre] = useState("");
    const [editandoId, setEditandoId] = useState(null);
    const [nombreEditado, setNombreEditado] = useState("");

    useEffect(() => {
        fetchAreas();
    }, []);

    const fetchAreas = async () => {
        const data = await getAreas();
        setAreas(data);
    };

    const handleCreate = async () => {
        if (!nuevoNombre.trim()) return;
        await createArea({ nombre: nuevoNombre });
        setNuevoNombre("");
        fetchAreas();
    };

    const handleUpdate = async (id) => {
        if (!nombreEditado.trim()) return;
        await updateArea(id, { nombre: nombreEditado });
        setEditandoId(null);
        setNombreEditado("");
        fetchAreas();
    };

    const handleDelete = async (id) => {
        await deleteArea(id);
        fetchAreas();
    };

    return (
        <Card className="p-4">
            <CardContent>
                <div className="flex justify-between mb-4">
                    <h2 className="text-xl font-bold">Áreas</h2>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            placeholder="Nueva área..."
                            value={nuevoNombre}
                            onChange={(e) => setNuevoNombre(e.target.value)}
                            className="border rounded px-2 py-1"
                        />
                        <Button onClick={handleCreate}>
                            <Plus className="w-4 h-4 mr-1" /> Agregar
                        </Button>
                    </div>
                </div>

                <table className="w-full text-left border">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="p-2 border">ID</th>
                        <th className="p-2 border">Nombre</th>
                        <th className="p-2 border text-center">Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {areas.map((area) => (
                        <tr key={area.id}>
                            <td className="p-2 border">{area.id}</td>
                            <td className="p-2 border">
                                {editandoId === area.id ? (
                                    <input
                                        value={nombreEditado}
                                        onChange={(e) => setNombreEditado(e.target.value)}
                                        className="border rounded px-2 py-1"
                                    />
                                ) : (
                                    area.nombre
                                )}
                            </td>
                            <td className="p-2 border text-center space-x-2">
                                {editandoId === area.id ? (
                                    <Button size="sm" onClick={() => handleUpdate(area.id)}>
                                        Guardar
                                    </Button>
                                ) : (
                                    <Button size="sm" variant="outline" onClick={() => { setEditandoId(area.id); setNombreEditado(area.nombre); }}>
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                )}
                                <Button size="sm" variant="destructive" onClick={() => handleDelete(area.id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </CardContent>
        </Card>
    );
}
