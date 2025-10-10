import React from "react";

export default function PersonalTable({ data, searchTerm }) {
    const filtrados = data.filter(item =>
        !searchTerm || item.nombreCompleto?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filtrados.length === 0) {
        return <p className="text-center text-gray-600 py-8">No se encontraron registros de personal</p>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Nombre</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Documento</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {filtrados.map(item => (
                    <tr key={item.idPersonal} className="hover:bg-gray-50">
                        <td className="px-6 py-4">{item.idPersonal}</td>
                        <td className="px-6 py-4">{item.nombreCompleto}</td>
                        <td className="px-6 py-4">{item.numDocPers}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
