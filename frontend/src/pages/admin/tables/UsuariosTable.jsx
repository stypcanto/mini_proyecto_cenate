import React, { useState } from "react";
import EstadoBadge from "../ui/EstadoBadge";
import { Users } from "lucide-react";

export default function UsuariosTable({ usuarios, personal, searchTerm }) {
    const [filterEstado, setFilterEstado] = useState("");
    const [filterRol, setFilterRol] = useState("");

    const rolesDisponibles = [...new Set(usuarios.flatMap(u => u.roles || []))];

    const filtrados = usuarios.filter(u => {
        const matchSearch =
            !searchTerm ||
            (u.username && u.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (u.idUser && u.idUser.toString().includes(searchTerm));
        const matchEstado = !filterEstado || u.estado === filterEstado;
        const matchRol = !filterRol || (u.roles && u.roles.includes(filterRol));
        return matchSearch && matchEstado && matchRol;
    });

    const getPersonalInfo = (idUser) => personal.find(p => p.idUsuario === idUser);

    if (filtrados.length === 0) {
        return (
            <div className="p-12 text-center">
                <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg">No se encontraron usuarios</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Filtros */}
            <div className="flex gap-3 items-center bg-gray-50 p-4 rounded-lg">
                <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Estado</label>
                    <select
                        value={filterEstado}
                        onChange={(e) => setFilterEstado(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Todos</option>
                        <option value="ACTIVO">Activo</option>
                        <option value="INACTIVO">Inactivo</option>
                    </select>
                </div>
                <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Rol</label>
                    <select
                        value={filterRol}
                        onChange={(e) => setFilterRol(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Todos</option>
                        {rolesDisponibles.map((rol, idx) => (
                            <option key={idx} value={rol}>{rol}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">ID</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Usuario</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Nombre</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Documento</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Estado</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Roles</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Fecha Creación</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {filtrados.map(usuario => {
                        const info = getPersonalInfo(usuario.idUser);
                        return (
                            <tr key={usuario.idUser} className="hover:bg-gray-50">
                                <td className="px-6 py-4">{usuario.idUser}</td>
                                <td className="px-6 py-4">{usuario.username}</td>
                                <td className="px-6 py-4">{info?.nombreCompleto || "No vinculado"}</td>
                                <td className="px-6 py-4">{info ? `${info.tipoDocumento?.descTipDoc}: ${info.numDocPers}` : "-"}</td>
                                <td className="px-6 py-4"><EstadoBadge estado={usuario.estado} /></td>
                                <td className="px-6 py-4">
                                    {usuario.roles?.length ? (
                                        <div className="flex flex-wrap gap-1">
                                            {usuario.roles.map((rol, idx) => (
                                                <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                            {rol}
                          </span>
                                            ))}
                                        </div>
                                    ) : <span className="text-gray-400 text-sm">Sin roles</span>}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {usuario.createAt ? new Date(usuario.createAt).toLocaleDateString("es-PE") : "N/A"}
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
