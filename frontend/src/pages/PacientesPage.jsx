// frontend/src/pages/PacientesPage.jsx
import React, { useState } from "react";
import { usePacientes } from "../hooks/usePacientes";

const PacientesPage = () => {
    const { pacientes, loading, error } = usePacientes();
    const [busqueda, setBusqueda] = useState("");

    // Filtrado con las claves correctas
    const pacientesFiltrados = (pacientes || []).filter((p) =>
        p.docPaciente?.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.paciente?.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-6">
                Lista de Pacientes
            </h1>

            {/* Estado de carga */}
            {loading && (
                <div className="flex justify-center items-center py-20 space-x-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
                    <span className="text-gray-600 text-lg font-medium">
                        Cargando pacientes...
                    </span>
                </div>
            )}

            {/* Mensaje de error */}
            {error && (
                <div className="bg-red-50 border border-red-400 text-red-700 px-6 py-4 rounded-md mb-6 shadow">
                    <strong className="font-semibold">Error:</strong> {error}
                </div>
            )}

            {/* Mensaje si no hay pacientes */}
            {!loading && !error && pacientes.length === 0 && (
                <p className="text-gray-500 text-lg text-center py-10">
                    No se encontraron pacientes registrados.
                </p>
            )}

            {/* Tabla con búsqueda */}
            {!loading && !error && pacientes.length > 0 && (
                <>
                    {/* Input de búsqueda */}
                    <div className="mb-6">
                        <input
                            type="text"
                            placeholder="Buscar por nombre o documento..."
                            className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>

                    {/* Tabla */}
                    <div className="overflow-x-auto shadow-md rounded-lg ring-1 ring-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-blue-600 to-blue-500 text-white">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold">
                                    Documento
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold">
                                    Nombre
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold">
                                    Fecha de Nacimiento
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold">
                                    Sexo
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {pacientesFiltrados.length > 0 ? (
                                pacientesFiltrados.map((p) => (
                                    <tr
                                        key={p.docPaciente}
                                        className="hover:bg-blue-50 transition-colors duration-200"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                                            {p.docPaciente}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                            {p.paciente}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                            {p.fecnacimpaciente}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                            {p.sexo}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="px-6 py-4 text-center text-gray-500"
                                    >
                                        No se encontraron pacientes que coincidan con la búsqueda.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default PacientesPage;
