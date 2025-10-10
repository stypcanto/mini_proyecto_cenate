import React from "react";
import { CheckCircle, XCircle } from "lucide-react";

export default function EstadoBadge({ estado }) {
    const activo = estado === "A" || estado === "ACTIVO";

    return activo ? (
        <span className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
      <CheckCircle className="w-3 h-3 mr-1" /> Activo
    </span>
    ) : (
        <span className="flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
      <XCircle className="w-3 h-3 mr-1" /> Inactivo
    </span>
    );
}
