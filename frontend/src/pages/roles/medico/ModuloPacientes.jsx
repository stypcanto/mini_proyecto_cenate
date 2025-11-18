import React from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { User } from "lucide-react";

export default function ModuloPacientes() {
    const pacientes = [
        { id: 1, nombre: "Luis García", edad: 32, diagnostico: "Gripe" },
        { id: 2, nombre: "Ana López", edad: 28, diagnostico: "Hipertensión" },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <User className="w-6 h-6 text-teal-600" />
                Mis Pacientes
            </h1>

            <Card>
                <CardContent className="p-6">
                    <table className="w-full text-sm border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="p-2 text-left">Nombre</th>
                            <th className="p-2 text-left">Edad</th>
                            <th className="p-2 text-left">Diagnóstico</th>
                        </tr>
                        </thead>
                        <tbody>
                        {pacientes.map((p) => (
                            <tr key={p.id} className="border-t">
                                <td className="p-2">{p.nombre}</td>
                                <td className="p-2">{p.edad}</td>
                                <td className="p-2">{p.diagnostico}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
