import React from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Building2, FileText } from "lucide-react";

export default function DashboardExterno() {
    const reportes = [
        { id: 1, titulo: "Reporte mensual IPRESS A", fecha: "2025-09-30" },
        { id: 2, titulo: "Resumen de coordinación B", fecha: "2025-09-28" },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Building2 className="w-6 h-6 text-blue-600" />
                Panel Institucional Externo
            </h1>

            <Card>
                <CardContent className="p-6">
                    <table className="w-full text-sm border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="p-2 text-left">Reporte</th>
                            <th className="p-2 text-left">Fecha</th>
                        </tr>
                        </thead>
                        <tbody>
                        {reportes.map((r) => (
                            <tr key={r.id} className="border-t">
                                <td className="p-2 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-gray-500" /> {r.titulo}
                                </td>
                                <td className="p-2">{r.fecha}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
