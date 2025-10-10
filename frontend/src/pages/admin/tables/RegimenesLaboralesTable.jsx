import React, { useEffect, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getRegimenes, createRegimen, updateRegimen, deleteRegimen } from "@/api/regimenesApi";

export default function RegimenesLaboralesTable() {
    const [regimenes, setRegimenes] = useState([]);
    const [nuevoNombre, setNuevoNombre] = useState("");
    const [editandoId, setEditandoId] = useState(null);
    const [nombreEditado, setNombreEditado] = useState("");

    useEffect(() => {
        fetchRegimenes();
    }, []);

    const fetchRegimenes = async () => {
        const data = await getRegimenes();
        setRegimenes(data);
    };

    const handleCreate = async () => {
        if (!nuevoNombre.trim()) return;
        await createRegimen({ nombre: nuevoNombre });
        setNuevoNombre("");
        fetchRegimenes();
    };

    const handleUpdate = async (id) => {
        if (!nombreEditado.trim()) return;
        await updateRegimen(id, { nombre: nombreEditado });
        setEditandoId(null);
        setNombreEditado("");
        fetchRegimenes();
    };

    const handleDelete = async (id) => {
        await deleteRegimen(id);
        fetchRegimenes();
    };

    return (
        <Card className="p-4">
            <CardContent>
                <div className="flex justify-between mb-4">
                    <h2 className="text-xl font-bold">Regímenes Laborales</h2>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            placeholder="Nuevo régimen..."
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
                    {regimenes.map((regimen) => (
                        <tr key={regimen.id}>
                            <td className="p-2 border">{regimen.id}</td>
                            <td className="p-2 border">
                                {editandoId === regimen.id ? (
                                    <input
                                        value={nombreEditado}
                                        onChange={(e) => setNombreEditado(e.target.value)}
                                        className="border rounded px-2 py-1"
                                    />
                                ) : (
                                    regimen.nombre
                                )}
                            </td>
                            <td className="p-2 border text-center space-x-2">
                                {editandoId === regimen.id ? (
                                    <Button size="sm" onClick={() => handleUpdate(regimen.id)}>
                                        Guardar
                                    </Button>
                                ) : (
                                    <Button size="sm" variant="outline" onClick={() => { setEditandoId(regimen.id); setNombreEditado(regimen.nombre); }}>
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                )}
                                <Button size="sm" variant="destructive" onClick={() => handleDelete(regimen.id)}>
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
