// ========================================================================
// AsignarAdmisionistaModal.jsx - Modal flexible para asignar paciente a usuario
// ========================================================================
// Muestra lista de usuarios según el rol especificado y permite asignar
// ========================================================================

import React, { useState, useEffect } from "react";
import { X, UserCheck, Search, AlertCircle, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import apiClient from "../../lib/apiClient";

export default function AsignarAdmisionistaModal({
    isOpen,
    onClose,
    paciente,
    onAsignacionExitosa,
    rol = "GESTOR DE CITAS", // Por defecto busca Gestor de Citas
    titulo = "Asignar Gestor de Citas" // Título personalizable
}) {
    const [admisionistas, setAdmisionistas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAdmisionista, setSelectedAdmisionista] = useState(null);
    const [asignando, setAsignando] = useState(false);

    // Cargar usuarios del rol especificado al abrir el modal
    useEffect(() => {
        if (isOpen) {
            cargarAdmisionistas();
        }
    }, [isOpen, rol]);

    const cargarAdmisionistas = async () => {
        setLoading(true);
        try {
            console.log(`🔍 Cargando usuarios con rol: ${rol}...`);
            const response = await apiClient.get(`/api/usuarios/por-rol?rol=${encodeURIComponent(rol)}`, true);
            console.log("📦 Respuesta completa:", response);
            console.log("📊 Tipo de respuesta:", typeof response);
            console.log("🔢 Es array?", Array.isArray(response));

            // El backend devuelve directamente un array
            const admisionistasData = Array.isArray(response) ? response : [];
            console.log("✅ Admisionistas procesados:", admisionistasData.length);

            setAdmisionistas(admisionistasData);

            if (admisionistasData.length === 0) {
                toast.error(`No hay usuarios con rol ${rol} disponibles en el sistema`);
            }
        } catch (error) {
            console.error(`❌ Error al cargar usuarios con rol ${rol}:`, error);
            toast.error(`Error al cargar usuarios: ${error.message}`);
            setAdmisionistas([]);
        } finally {
            setLoading(false);
        }
    };

    // Filtrar admisionistas por búsqueda
    const admisionistasFiltrados = admisionistas.filter((adm) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            adm.nombreCompleto?.toLowerCase().includes(searchLower) ||
            adm.username?.toLowerCase().includes(searchLower) ||
            adm.correoPersonal?.toLowerCase().includes(searchLower)
        );
    });

    // Asignar paciente al admisionista seleccionado
    const handleAsignar = async () => {
        if (!selectedAdmisionista) {
            toast.error("Selecciona un admisionista");
            return;
        }

        setAsignando(true);
        try {
            const response = await apiClient.post('/api/bolsa107/asignar-admisionista', {
                id_item: paciente.id_item,
                id_admisionista: selectedAdmisionista.idUser
            }, true);

            toast.success(`Paciente asignado a ${selectedAdmisionista.nombreCompleto}`);
            onAsignacionExitosa && onAsignacionExitosa();
            onClose();
        } catch (error) {
            console.error("Error al asignar paciente:", error);
            toast.error("Error al asignar el paciente");
        } finally {
            setAsignando(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <UserCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{titulo}</h2>
                                <p className="text-blue-100 text-sm mt-1">
                                    Paciente: {paciente?.paciente} (DNI: {paciente?.numero_documento})
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Buscador */}
                <div className="p-6 border-b border-slate-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder={`Buscar ${rol.toLowerCase()} por nombre, DNI o correo...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Lista de admisionistas */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                            <p className="mt-4 text-slate-600">Cargando usuarios...</p>
                        </div>
                    ) : admisionistasFiltrados.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <AlertCircle className="w-16 h-16 text-slate-300 mb-4" />
                            <p className="text-slate-600 font-medium">No se encontraron usuarios</p>
                            <p className="text-slate-500 text-sm mt-1">
                                {searchTerm ? "Intenta con otro término de búsqueda" : `No hay usuarios con rol ${rol} registrados`}
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {admisionistasFiltrados.map((adm) => (
                                <button
                                    key={adm.idUser}
                                    onClick={() => setSelectedAdmisionista(adm)}
                                    className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                                        selectedAdmisionista?.idUser === adm.idUser
                                            ? 'border-blue-500 bg-blue-50 shadow-md'
                                            : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/30'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {/* Avatar */}
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                                                selectedAdmisionista?.idUser === adm.idUser
                                                    ? 'bg-blue-600'
                                                    : 'bg-slate-400'
                                            }`}>
                                                {adm.nombreCompleto?.charAt(0) || adm.username?.charAt(0) || 'A'}
                                            </div>

                                            {/* Información */}
                                            <div className="flex-1">
                                                <p className="font-semibold text-slate-800">
                                                    {adm.nombreCompleto || `Usuario ${adm.username}`}
                                                </p>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <span className="text-sm text-slate-600">
                                                        DNI: {adm.username}
                                                    </span>
                                                    {adm.correoPersonal && (
                                                        <span className="text-sm text-slate-500">
                                                            {adm.correoPersonal}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex gap-2 mt-2">
                                                    {adm.roles?.map((rol, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800"
                                                        >
                                                            {rol}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Checkmark si está seleccionado */}
                                        {selectedAdmisionista?.idUser === adm.idUser && (
                                            <div className="ml-4">
                                                <CheckCircle2 className="w-6 h-6 text-blue-600" />
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer con botones */}
                <div className="p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                    <p className="text-sm text-slate-600">
                        {admisionistasFiltrados.length} usuario{admisionistasFiltrados.length !== 1 ? 's' : ''} disponible{admisionistasFiltrados.length !== 1 ? 's' : ''}
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleAsignar}
                            disabled={!selectedAdmisionista || asignando}
                            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
                        >
                            {asignando ? 'Asignando...' : `Asignar ${rol}`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
