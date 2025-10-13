import React, { useState } from "react";
import { motion } from "framer-motion";
import { Users, Shield, CalendarClock, Search } from "lucide-react";
import EstadoBadge from "../ui/EstadoBadge";

export default function UsuariosTable({ usuarios = [], personal = [], searchTerm = "" }) {
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
            <div className="p-16 text-center backdrop-blur-lg bg-white/70 rounded-3xl shadow-inner">
                <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-700 text-lg font-medium">
                    No se encontraron usuarios
                </p>
                <p className="text-gray-500 text-sm mt-1">
                    Ajusta los filtros o intenta con otro término de búsqueda.
                </p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
        >
            {/* 🔹 Filtros */}
            <div className="flex flex-wrap gap-4 items-end bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                        Estado
                    </label>
                    <select
                        value={filterEstado}
                        onChange={(e) => setFilterEstado(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                        <option value="">Todos</option>
                        <option value="ACTIVO">Activo</option>
                        <option value="INACTIVO">Inactivo</option>
                    </select>
                </div>

                <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                        Rol
                    </label>
                    <select
                        value={filterRol}
                        onChange={(e) => setFilterRol(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                        <option value="">Todos</option>
                        {rolesDisponibles.map((rol, idx) => (
                            <option key={idx} value={rol}>
                                {rol}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        value={searchTerm}
                        readOnly
                        placeholder="Buscar usuario..."
                        className="w-full pl-9 pr-4 py-2 border-2 border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* 🔹 Tabla */}
            <div className="overflow-x-auto rounded-3xl shadow-lg border border-gray-100 bg-white/80 backdrop-blur-xl">
                <table className="w-full border-collapse text-sm">
                    <thead className="bg-gray-50/80 border-b border-gray-200">
                    <tr>
                        <Th>ID</Th>
                        <Th>Usuario</Th>
                        <Th>Nombre</Th>
                        <Th>Documento</Th>
                        <Th>Estado</Th>
                        <Th>Roles</Th>
                        <Th>Creado</Th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {filtrados.map((usuario, index) => {
                        const info = getPersonalInfo(usuario.idUser);
                        return (
                            <motion.tr
                                key={usuario.idUser || index}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.03 }}
                                className="hover:bg-gray-50 transition-all duration-150"
                            >
                                <Td>#{usuario.idUser}</Td>

                                {/* Usuario */}
                                <Td>
                                    <div className="flex items-center space-x-3">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold shadow">
                                            {usuario.username?.charAt(0)?.toUpperCase() || "?"}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">
                                                {usuario.username || "—"}
                                            </p>
                                            <p className="text-xs text-gray-500">{usuario.email || ""}</p>
                                        </div>
                                    </div>
                                </Td>

                                {/* Nombre */}
                                <Td>{info?.nombreCompleto || "—"}</Td>

                                {/* Documento */}
                                <Td>
                                    {info
                                        ? `${info.tipoDocumento?.descTipDoc || ""} ${info.numDocPers || ""}`
                                        : "—"}
                                </Td>

                                {/* Estado */}
                                <Td>
                                    <EstadoBadge estado={usuario.estado} />
                                </Td>

                                {/* Roles */}
                                <Td>
                                    {usuario.roles?.length ? (
                                        <div className="flex flex-wrap gap-1">
                                            {usuario.roles.map((rol, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                                                >
                            {rol}
                          </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 text-xs">Sin roles</span>
                                    )}
                                </Td>

                                {/* Fecha */}
                                <Td className="text-gray-500 text-xs">
                                    <CalendarClock className="w-4 h-4 inline mr-1 text-gray-400" />
                                    {usuario.createAt
                                        ? new Date(usuario.createAt).toLocaleDateString("es-PE", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        })
                                        : "—"}
                                </Td>
                            </motion.tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}

/* === 🧩 COMPONENTES REUTILIZABLES === */
const Th = ({ children }) => (
    <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-600 uppercase tracking-wider select-none">
        {children}
    </th>
);

const Td = ({ children, className = "" }) => (
    <td
        className={`px-6 py-4 whitespace-nowrap text-sm text-gray-700 ${className}`}
    >
        {children}
    </td>
);