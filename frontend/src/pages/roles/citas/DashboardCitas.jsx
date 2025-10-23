import React from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { CalendarPlus, UserPlus } from "lucide-react";

export default function DashboardCitas() {
    const citas = [
        { id: 1, paciente: "Carlos López", medico: "Dr. Torres", fecha: "2025-10-14 10:00" },
        { id: 2, paciente: "María Rivas", medico: "Dr. Pérez", fecha: "2025-10-14 11:30" },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <CalendarPlus className="w-6 h-6 text-orange-600" />
                Gestión de Citas
            </h1>

            <Card>
                <CardContent className="p-6">
                    <table className="w-full text-sm border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="p-2 text-left">Paciente</th>
                            <th className="p-2 text-left">Médico</th>
                            <th className="p-2 text-left">Fecha</th>
                            <th className="p-2 text-center">Acción</th>
                        </tr>
                        </thead>
                        <tbody>
                        {citas.map((c) => (
                            <tr key={c.id} className="border-t">
                                <td className="p-2">{c.paciente}</td>
                                <td className="p-2">{c.medico}</td>
                                <td className="p-2">{c.fecha}</td>
                                <td className="p-2 text-center">
                                    <Button variant="outline" size="sm">
                                        <UserPlus className="w-4 h-4 mr-1" />
                                        Reprogramar
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
