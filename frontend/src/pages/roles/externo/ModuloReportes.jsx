import React from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { FileChartColumn, Download } from "lucide-react";
import { Button } from "../../../components/ui/button";

export default function ModuloReportes() {
    const reportes = [
        { id: 1, nombre: "Informe Mensual", estado: "Listo" },
        { id: 2, nombre: "Reporte Semanal", estado: "En progreso" },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <FileChartColumn className="w-6 h-6 text-indigo-600" />
                Módulo de Reportes
            </h1>

            <Card>
                <CardContent className="p-6">
                    <table className="w-full text-sm border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="p-2 text-left">Nombre</th>
                            <th className="p-2 text-left">Estado</th>
                            <th className="p-2 text-center">Acción</th>
                        </tr>
                        </thead>
                        <tbody>
                        {reportes.map((r) => (
                            <tr key={r.id} className="border-t">
                                <td className="p-2">{r.nombre}</td>
                                <td className="p-2">{r.estado}</td>
                                <td className="p-2 text-center">
                                    <Button size="sm" variant="outline">
                                        <Download className="w-4 h-4 mr-1" />
                                        Descargar
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
