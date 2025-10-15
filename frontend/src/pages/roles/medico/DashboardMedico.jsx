import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ClipboardList } from "lucide-react";

export default function DashboardMedico() {
    const pacientes = [
        { id: 1, nombre: "Juan Pérez", cita: "2025-10-14 09:00", estado: "Atendido" },
        { id: 2, nombre: "Ana Torres", cita: "2025-10-14 09:30", estado: "Pendiente" },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-600" />
                Panel del Médico
            </h1>

            <Card>
                <CardContent className="p-6">
                    <h2 className="font-semibold text-gray-700 mb-3">Citas programadas</h2>
                    <table className="w-full text-sm border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="p-2 text-left">Paciente</th>
                            <th className="p-2 text-left">Hora</th>
                            <th className="p-2 text-left">Estado</th>
                            <th className="p-2 text-center">Acción</th>
                        </tr>
                        </thead>
                        <tbody>
                        {pacientes.map((p) => (
                            <tr key={p.id} className="border-t">
                                <td className="p-2">{p.nombre}</td>
                                <td className="p-2">{p.cita}</td>
                                <td className="p-2">{p.estado}</td>
                                <td className="p-2 text-center">
                                    <Button variant="outline" size="sm">
                                        <ClipboardList className="w-4 h-4 mr-1" />
                                        Ver ficha
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
