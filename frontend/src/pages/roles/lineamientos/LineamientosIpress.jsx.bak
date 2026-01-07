import React from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { FileSpreadsheet, Check, Edit } from "lucide-react";

export default function LineamientosIpress() {
    const lineamientos = [
        { id: 1, titulo: "Protocolo COVID-19", estado: "Pendiente" },
        { id: 2, titulo: "Guía de Nutrición Infantil", estado: "Aprobado" },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <FileSpreadsheet className="w-6 h-6 text-purple-600" />
                Lineamientos IPRESS
            </h1>

            <Card>
                <CardContent className="p-6">
                    <table className="w-full text-sm border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="p-2 text-left">Título</th>
                            <th className="p-2 text-left">Estado</th>
                            <th className="p-2 text-center">Acción</th>
                        </tr>
                        </thead>
                        <tbody>
                        {lineamientos.map((l) => (
                            <tr key={l.id} className="border-t">
                                <td className="p-2">{l.titulo}</td>
                                <td className="p-2">{l.estado}</td>
                                <td className="p-2 text-center flex justify-center gap-2">
                                    <Button variant="outline" size="sm">
                                        <Edit className="w-4 h-4 mr-1" /> Editar
                                    </Button>
                                    <Button
                                        size="sm"
                                        className={`${
                                            l.estado === "Aprobado"
                                                ? "bg-green-600 hover:bg-green-700"
                                                : "bg-blue-600 hover:bg-blue-700"
                                        }`}
                                    >
                                        <Check className="w-4 h-4 mr-1" />{" "}
                                        {l.estado === "Aprobado" ? "Ver" : "Aprobar"}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
