import React, { useState } from "react";
import { BadgeCheck, UserCog, FileText, Info } from "lucide-react";
import EstadoBadge from "../ui/EstadoBadge";

export default function PersonalTable({ data, searchTerm }) {
    const [selected, setSelected] = useState(null);

    const filtrados = data.filter((item) =>
        !searchTerm ||
        item.nombreCompleto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.numDocPers?.includes(searchTerm)
    );

    if (filtrados.length === 0) {
        return (
            <div className="text-center py-16">
                <UserCog className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600 text-lg">No se encontraron registros de personal</p>
                <p className="text-gray-500 text-sm">Intenta ajustar tu búsqueda o filtros</p>
            </div>
        );
    }

    const getTipoBadge = (tipo) => {
        if (!tipo) return null;
        const isInterno = tipo.toUpperCase() === "INTERNO";
        return (
            <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    isInterno
                        ? "bg-blue-100 text-blue-700"
                        : "bg-teal-100 text-teal-700"
                }`}
            >
        {isInterno ? "Interno" : "Externo"}
      </span>
        );
    };

    return (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-lg border border-gray-100">
            <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                    <Th>ID</Th>
                    <Th>Nombre Completo</Th>
                    <Th>Documento</Th>
                    <Th>Tipo</Th>
                    <Th>Estado</Th>
                    <Th className="text-center">Acciones</Th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {filtrados.map((item) => (
                    <tr
                        key={item.idPersonal}
                        className="hover:bg-gray-50 transition-all duration-200"
                    >
                        <Td>#{item.idPersonal}</Td>
                        <Td>
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-bold shadow-sm">
                                    {item.nombreCompleto?.charAt(0) || "?"}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">{item.nombreCompleto}</p>
                                    <p className="text-xs text-gray-500">{item.descProfesion || "Sin profesión"}</p>
                                </div>
                            </div>
                        </Td>
                        <Td>
                <span className="text-sm text-gray-700">
                  {item.tipoDocumento
                      ? `${item.tipoDocumento.descTipDoc}: ${item.numDocPers}`
                      : item.numDocPers || "—"}
                </span>
                        </Td>
                        <Td>{getTipoBadge(item.tipoPersonal)}</Td>
                        <Td>
                            <EstadoBadge estado={item.estado} />
                        </Td>
                        <Td className="text-center">
                            <button
                                onClick={() => setSelected(item)}
                                className="px-3 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                                title="Ver detalles"
                            >
                                <Info className="w-4 h-4" />
                            </button>
                        </Td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* 🪄 Modal de detalle */}
            {selected && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fade-in">
                        <button
                            onClick={() => setSelected(null)}
                            className="absolute top-3 right-4 text-gray-500 hover:text-gray-800"
                        >
                            ✕
                        </button>

                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                            <BadgeCheck className="w-5 h-5 text-blue-600" />
                            <span>Detalle del Personal</span>
                        </h3>

                        <div className="space-y-3 text-sm text-gray-700">
                            <p>
                                <strong>Nombre:</strong> {selected.nombreCompleto}
                            </p>
                            <p>
                                <strong>Documento:</strong>{" "}
                                {selected.tipoDocumento
                                    ? `${selected.tipoDocumento.descTipDoc}: ${selected.numDocPers}`
                                    : selected.numDocPers || "—"}
                            </p>
                            <p>
                                <strong>Tipo:</strong> {selected.tipoPersonal || "—"}
                            </p>
                            <p>
                                <strong>Profesión:</strong> {selected.descProfesion || "—"}
                            </p>
                            <p>
                                <strong>Institución:</strong> {selected.descIpress || "—"}
                            </p>
                            <p>
                                <strong>Estado:</strong>{" "}
                                <EstadoBadge estado={selected.estado} />
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const Th = ({ children, className }) => (
    <th
        className={`px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase ${className || ""
        }`}
    >
        {children}
    </th>
);

const Td = ({ children }) => (
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        {children}
    </td>
);