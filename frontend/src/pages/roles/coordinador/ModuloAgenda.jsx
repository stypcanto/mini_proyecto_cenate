import React from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { CalendarDays, Clipboard } from "lucide-react";

export default function ModuloAgenda() {
    const agenda = [
        { id: 1, medico: "Dr. Pérez", fecha: "2025-10-14", pacientes: 10 },
        { id: 2, medico: "Dra. Torres", fecha: "2025-10-14", pacientes: 8 },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <CalendarDays className="w-6 h-6 text-indigo-600" />
                Agenda del Día
            </h1>

            <Card>
                <CardContent className="p-6">
                    <table className="w-full text-sm border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="p-2 text-left">Médico</th>
                            <th className="p-2 text-left">Fecha</th>
                            <th className="p-2 text-left">Pacientes Asignados</th>
                        </tr>
                        </thead>
                        <tbody>
                        {agenda.map((a) => (
                            <tr key={a.id} className="border-t">
                                <td className="p-2">{a.medico}</td>
                                <td className="p-2">{a.fecha}</td>
                                <td className="p-2 flex items-center gap-2">
                                    <Clipboard className="w-4 h-4 text-gray-500" />
                                    {a.pacientes}
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
