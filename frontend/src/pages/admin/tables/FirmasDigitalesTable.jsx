import React, { useEffect, useState } from "react";
import { FileSignature, Pencil, Trash2, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getFirmasDigitales, createFirmaDigital, updateFirmaDigital, deleteFirmaDigital } from "@/api/firmasApi";

export default function FirmasDigitalesTable() {
    const [firmas, setFirmas] = useState([]);
    const [nuevo, setNuevo] = useState({ serie: "", estado: "A" });
    const [editando, setEditando] = useState(null);
    const [mensaje, setMensaje] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFirmas();
    }, []);

    const fetchFirmas = async () => {
        setLoading(true);
        try {
            const data = await getFirmasDigitales();
            setFirmas(data || []);
        } catch (e) {
            setMensaje("❌ Error al cargar las firmas digitales");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!nuevo.serie.trim()) return setMensaje("⚠️ Ingresa una serie válida.");
        try {
            await createFirmaDigital(nuevo);
            setMensaje("✅ Firma creada correctamente.");
            setNuevo({ serie: "", estado: "A" });
            fetchFirmas();
        } catch {
            setMensaje("❌ No se pudo crear la firma.");
        }
    };

    const handleUpdate = async (id) => {
        try {
            await updateFirmaDigital(id, editando);
            setMensaje("✅ Firma actualizada correctamente.");
            setEditando(null);
            fetchFirmas();
        } catch {
            setMensaje("❌ No se pudo actualizar la firma.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Eliminar firma digital?")) return;
        try {
            await deleteFirmaDigital(id);
            setMensaje("🗑️ Firma eliminada correctamente.");
            fetchFirmas();
        } catch {
            setMensaje("❌ No se pudo eliminar la firma.");
        }
    };

    return (
        <Card className="p-6 rounded-2xl border border-gray-200 shadow-lg">
            <CardContent>
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FileSignature className="w-6 h-6 text-blue-600" /> Firmas Digitales
                    </h2>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Serie nueva..."
                            value={nuevo.serie}
                            onChange={(e) => setNuevo({ ...nuevo, serie: e.target.value })}
                            className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm"
                        />
                        <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-1" /> Agregar
                        </Button>
                        <Button variant="outline" onClick={fetchFirmas}>
                            <RefreshCw className="w-4 h-4 mr-1" /> Actualizar
                        </Button>
                    </div>
                </div>

                {mensaje && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm">
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
                            <Th>Serie</Th>
                            <Th>Estado</Th>
                            <Th>Inicio</Th>
                            <Th>Fin</Th>
                            <Th>Acciones</Th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {firmas.map((f) => (
                            <tr key={f.id_firm_dig}>
                                <Td>#{f.id_firm_dig}</Td>
                                <Td>
                                    {editando?.id_firm_dig === f.id_firm_dig ? (
                                        <input
                                            value={editando.serie}
                                            onChange={(e) =>
                                                setEditando({ ...editando, serie: e.target.value })
                                            }
                                            className="border rounded px-2 py-1 w-full"
                                        />
                                    ) : (
                                        f.serie_firm_dig
                                    )}
                                </Td>
                                <Td>{f.stat_firm_dig === "A" ? "Activo" : "Inactivo"}</Td>
                                <Td>{f.fech_ini_firm}</Td>
                                <Td>{f.fech_fin_firm}</Td>
                                <Td className="flex gap-2 justify-center">
                                    {editando?.id_firm_dig === f.id_firm_dig ? (
                                        <Button
                                            size="sm"
                                            onClick={() => handleUpdate(f.id_firm_dig)}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            Guardar
                                        </Button>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                setEditando({
                                                    id_firm_dig: f.id_firm_dig,
                                                    serie: f.serie_firm_dig,
                                                })
                                            }
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleDelete(f.id_firm_dig)}
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
