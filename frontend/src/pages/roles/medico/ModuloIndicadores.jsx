import React from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Activity } from "lucide-react";

export default function ModuloIndicadores() {
    const indicadores = [
        { id: 1, indicador: "Pacientes Atendidos Hoy", valor: 14 },
        { id: 2, indicador: "Citas Pendientes", valor: 5 },
        { id: 3, indicador: "Promedio de Atención (min)", valor: 22 },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Activity className="w-6 h-6 text-emerald-600" />
                Indicadores Médicos
            </h1>

            <div className="grid md:grid-cols-3 gap-4">
                {indicadores.map((i) => (
                    <Card key={i.id} className="border rounded-2xl shadow-sm">
                        <CardContent className="p-6 text-center">
                            <p className="text-gray-500 text-sm">{i.indicador}</p>
                            <h2 className="text-3xl font-bold text-gray-800 mt-2">{i.valor}</h2>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
