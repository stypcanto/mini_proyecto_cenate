// ========================================================================
// AsignarAdmisionistaModal.jsx - Modal flexible para asignar paciente a usuario
// ========================================================================
// Muestra lista de usuarios según el rol especificado y permite asignar
// ========================================================================

import React, { useState, useEffect } from "react";
import { X, UserCheck, Search, AlertCircle, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import apiClient from '../../lib/apiClient';

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
            const response = await apiClient.get(`/api/usuarios/por-rol?roles=${encodeURIComponent(rol)}`, true);
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

    // Asignar paciente al admisionista/gestor seleccionado
    const handleAsignar = async () => {
        if (!selectedAdmisionista) {
            toast.error(`Selecciona un ${rol.toLowerCase()}`);
            return;
        }

        setAsignando(true);
        try {
            // Determinar endpoint y parámetro según el rol
            const isGestor = rol.toUpperCase().includes('GESTOR');
            const endpoint = isGestor ? '/api/bolsa107/asignar-gestor' : '/api/bolsa107/asignar-admisionista';
            const paramName = isGestor ? 'id_gestor' : 'id_admisionista';

            const response = await apiClient.post(endpoint, {
                id_item: paciente.id_item,
                [paramName]: selectedAdmisionista.id_user
            }, true);

            const nombreCompleto = getNombreCompleto(selectedAdmisionista);
            toast.success(`Paciente asignado a ${nombreCompleto}`);
            onAsignacionExitosa && onAsignacionExitosa();
            onClose();
        } catch (error) {
            console.error("Error al asignar paciente:", error);
            toast.error("Error al asignar el paciente");
        } finally {
            setAsignando(false);
        }
    };

    // ============================================================================
    // 🧩 FUNCIONES AUXILIARES
    // ============================================================================

    /**
     * Obtiene el nombre completo del usuario con fallbacks inteligentes
     */
    const getNombreCompleto = (usuario) => {
        // 1. Si tiene nombreCompleto, usarlo
        if (usuario.nombreCompleto && usuario.nombreCompleto.trim()) {
            return usuario.nombreCompleto;
        }

        // 2. Construir desde nombres + apellidos
        if (usuario.nombres || usuario.apellidoPaterno || usuario.apellidoMaterno) {
            const partes = [
                usuario.nombres,
                usuario.apellidoPaterno,
                usuario.apellidoMaterno
            ].filter(parte => parte && parte.trim());

            if (partes.length > 0) {
                return partes.join(' ');
            }
        }

        // 3. Fallback: Gestor + DNI
        return `Gestor ${usuario.username || 'Sin DNI'}`;
    };

    /**
     * Obtiene las iniciales del nombre completo (no del DNI)
     */
    const getInitials = (usuario) => {
        const nombreCompleto = getNombreCompleto(usuario);

        // Si es "Gestor XXXXXXXX", usar "GC"
        if (nombreCompleto.startsWith('Gestor ')) {
            return 'GC';
        }

        // Extraer iniciales del nombre completo
        const palabras = nombreCompleto.trim().split(/\s+/);

        if (palabras.length >= 2) {
            // Tomar primera letra del primer y segundo nombre/apellido
            return (palabras[0][0] + palabras[1][0]).toUpperCase();
        } else if (palabras.length === 1) {
            // Solo un nombre: tomar primeras 2 letras
            return palabras[0].substring(0, 2).toUpperCase();
        }

        return 'GC'; // Fallback
    };

    // ============================================================================

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
                        <div className="grid gap-4">
                            {admisionistasFiltrados.map((adm) => (
                                <button
                                    key={adm.id_user}
                                    onClick={() => setSelectedAdmisionista(adm)}
                                    className={`p-5 rounded-xl border-2 transition-all duration-200 text-left ${
                                        selectedAdmisionista?.id_user === adm.id_user
                                            ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg scale-[1.02]'
                                            : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50 hover:shadow-md'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Avatar/Foto */}
                                        <div className="flex-shrink-0">
                                            {adm.fotoUrl ? (
                                                <img
                                                    src={adm.fotoUrl}
                                                    alt={getNombreCompleto(adm)}
                                                    className={`w-14 h-14 rounded-full object-cover border-3 transition-all ${
                                                        selectedAdmisionista?.id_user === adm.id_user
                                                            ? 'border-blue-500 shadow-lg'
                                                            : 'border-slate-300'
                                                    }`}
                                                />
                                            ) : (
                                                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white transition-all ${
                                                    selectedAdmisionista?.id_user === adm.id_user
                                                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg ring-2 ring-blue-300'
                                                        : 'bg-gradient-to-br from-slate-500 to-slate-600'
                                                }`}>
                                                    {getInitials(adm)}
                                                </div>
                                            )}
                                        </div>

                                        {/* Información del Gestor */}
                                        <div className="flex-1 min-w-0">
                                            {/* Nombre Completo (DESTACADO) */}
                                            <h3 className={`text-base font-bold mb-0.5 truncate transition-colors ${
                                                selectedAdmisionista?.id_user === adm.id_user
                                                    ? 'text-blue-900'
                                                    : 'text-slate-900'
                                            }`}>
                                                {getNombreCompleto(adm)}
                                            </h3>

                                            {/* DNI */}
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm text-slate-600">
                                                    DNI: <span className="font-semibold text-slate-800">{adm.username}</span>
                                                </span>
                                            </div>

                                            {/* Badge del Rol */}
                                            {adm.roles && adm.roles.length > 0 && (
                                                <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full transition-colors ${
                                                    selectedAdmisionista?.id_user === adm.id_user
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-slate-100 text-slate-700'
                                                }`}>
                                                    {adm.roles[0]}
                                                </span>
                                            )}
                                        </div>

                                        {/* Checkmark */}
                                        <div className="flex-shrink-0">
                                            {selectedAdmisionista?.id_user === adm.id_user ? (
                                                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shadow-md">
                                                    <CheckCircle2 className="w-5 h-5 text-white" />
                                                </div>
                                            ) : (
                                                <div className="w-7 h-7 rounded-full border-2 border-slate-300 transition-all hover:border-blue-400" />
                                            )}
                                        </div>
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
