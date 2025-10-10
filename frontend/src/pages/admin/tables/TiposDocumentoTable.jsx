import React, { useEffect, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getTiposDocumento, createTipoDocumento, updateTipoDocumento, deleteTipoDocumento } from "@/api/tiposDocumentoApi";

export default function TiposDocumentoTable() {
    const [tiposDocumento, setTiposDocumento] = useState([]);
    const [nuevoNombre, setNuevoNombre] = useState("");
    const [editandoId, setEditandoId] = useState(null);
    const [nombreEditado, setNombreEditado] = useState("");

    useEffect(() => {
        fetchTiposDocumento();
    }, []);

    const fetchTiposDocumento = async () => {
        const data = await getTiposDocumento();
        setTiposDocumento(data);
    };

    const handleCreate = async () => {
        if (!nuevoNombre.trim()) return;
        await createTipoDocumento({ nombre: nuevoNombre });
        setNuevoNombre("");
        fetchTiposDocumento();
    };

    const handleUpdate = async (id) => {
        if (!nombreEditado.trim()) return;
        await updateTipoDocumento(id, { nombre: nombreEditado });
        setEditandoId(null);
        setNombreEditado("");
        fetchTiposDocumento();
    };

    const handleDelete = async (id) => {
        await deleteTipoDocumento(id);
        fetchTiposDocumento();
    };

    return (
        <Card className="p-4">
            <CardContent>
                <div className="flex justify-between mb-4">
                    <h2 className="text-xl font-bold">Tipos de Documento</h2>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            placeholder="Nuevo tipo..."
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
                    {tiposDocumento.map((tipo) => (
                        <tr key={tipo.id}>
                            <td className="p-2 border">{tipo.id}</td>
                            <td className="p-2 border">
                                {editandoId === tipo.id ? (
                                    <input
                                        value={nombreEditado}
                                        onChange={(e) => setNombreEditado(e.target.value)}
                                        className="border rounded px-2 py-1"
                                    />
                                ) : (
                                    tipo.nombre
                                )}
                            </td>
                            <td className="p-2 border text-center space-x-2">
                                {editandoId === tipo.id ? (
                                    <Button size="sm" onClick={() => handleUpdate(tipo.id)}>
                                        Guardar
                                    </Button>
                                ) : (
                                    <Button size="sm" variant="outline" onClick={() => { setEditandoId(tipo.id); setNombreEditado(tipo.nombre); }}>
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                )}
                                <Button size="sm" variant="destructive" onClick={() => handleDelete(tipo.id)}>
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
