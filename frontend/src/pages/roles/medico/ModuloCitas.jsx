import React from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Calendar, Clock } from "lucide-react";

export default function ModuloCitas() {
    const citas = [
        { id: 1, paciente: "Luis García", fecha: "2025-10-15 10:00", estado: "Pendiente" },
        { id: 2, paciente: "María Torres", fecha: "2025-10-15 10:30", estado: "Atendida" },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-600" />
                Mis Citas del Día
            </h1>

            <Card>
                <CardContent className="p-6">
                    <table className="w-full text-sm border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="p-2 text-left">Paciente</th>
                            <th className="p-2 text-left">Hora</th>
                            <th className="p-2 text-left">Estado</th>
                        </tr>
                        </thead>
                        <tbody>
                        {citas.map((cita) => (
                            <tr key={cita.id} className="border-t">
                                <td className="p-2">{cita.paciente}</td>
                                <td className="p-2 flex items-center gap-1">
                                    <Clock className="w-4 h-4 text-gray-500" />
                                    {cita.fecha}
                                </td>
                                <td className="p-2">{cita.estado}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
