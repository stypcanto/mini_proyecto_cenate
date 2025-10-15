// ========================================================================
// 👥 UsuariosTable.jsx - Panel administrativo CENATE
// CRUD de usuarios internos/externos con soporte de roles y estados
// ========================================================================

import React from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import EstadoBadge from "../ui/EstadoBadge";
import { useUsuarios } from "@/hooks/useUsuarios";
import toast from "react-hot-toast";

export default function UsuariosTable({ usuarios = [] }) {
    const navigate = useNavigate();
    const { deleteExistingUsuario } = useUsuarios();

    // ======================================================
    // ✏️ Editar usuario
    // ======================================================
    const handleEdit = (usuario) => {
        if (!usuario) return;
        navigate(`/admin/users/${usuario.username}`); // redirige al detalle editable
    };

    // ======================================================
    // 🗑️ Eliminar usuario
    // ======================================================
    const handleDelete = async (idUser) => {
        if (!idUser) return;
        const confirmar = window.confirm("¿Seguro que deseas eliminar este usuario?");
        if (!confirmar) return;

        try {
            await deleteExistingUsuario(idUser);
            toast.success("Usuario eliminado correctamente.");
        } catch (err) {
            toast.error("Error al eliminar usuario.");
            console.error(err);
        }
    };

    if (!usuarios.length) {
        return (
            <div className="p-8 text-center text-gray-500 bg-white rounded-xl shadow-sm">
                No hay usuarios registrados.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-md border border-gray-100">
            <table className="w-full border-collapse text-sm">
                <thead className="bg-gray-50 border-b">
                <tr>
                    <Th>ID</Th>
                    <Th>Usuario</Th>
                    <Th>Nombre</Th>
                    <Th>Documento</Th>
                    <Th>Rol</Th>
                    <Th>Estado</Th>
                    <Th className="text-center">Acciones</Th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {usuarios.map((usuario) => (
                    <tr
                        key={usuario.idUser}
                        className="hover:bg-gray-50 transition-all duration-150"
                    >
                        <Td>#{usuario.idUser}</Td>
                        <Td>{usuario.username || "—"}</Td>
                        <Td>{usuario.nombreCompleto || "—"}</Td>
                        <Td>{usuario.numeroDocumento || "—"}</Td>
                        <Td>
                            {usuario.roles?.length ? usuario.roles.join(", ") : "Sin rol"}
                        </Td>
                        <Td>
                            <EstadoBadge estado={usuario.activo ? "Activo" : "Inactivo"} />
                        </Td>

                        {/* 🔘 Acciones */}
                        <Td className="flex justify-center gap-2 py-3">
                            <button
                                onClick={() => navigate(`/admin/users/${usuario.username}`)}
                                title="Ver detalle"
                                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition"
                            >
                                <Eye className="w-4 h-4 text-gray-600" />
                            </button>

                            <button
                                onClick={() => handleEdit(usuario)}
                                title="Editar usuario"
                                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition"
                            >
                                <Pencil className="w-4 h-4 text-gray-600" />
                            </button>

                            <button
                                onClick={() => handleDelete(usuario.idUser)}
                                title="Eliminar usuario"
                                className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </Td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

// 🧩 Helpers
const Th = ({ children, className }) => (
    <th
        className={`px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wide ${className}`}
    >
        {children}
    </th>
);

const Td = ({ children, className }) => (
    <td className={`px-6 py-4 text-gray-700 ${className}`}>{children}</td>
);