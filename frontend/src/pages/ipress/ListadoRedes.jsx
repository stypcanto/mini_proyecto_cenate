// ========================================================================
// 🌐 ListadoRedes.jsx – Gestión de Redes Asistenciales (CENATE 2025)
// ------------------------------------------------------------------------
// Panel completo con tabla, búsqueda, filtros y CRUD de redes
// Diseño consistente con ListadoIpress
// ========================================================================

import React, { useState, useEffect, useMemo } from "react";
import {
    Network, Search, Download, ChevronLeft, ChevronRight, Filter,
    ArrowUpDown, Loader, TrendingUp, MapPin, Plus, Edit2, Trash2, Eye
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { redesService } from "../../services/redesService";
import { useAuth } from "../../context/AuthContext";
import RedFormModal from "./components/RedFormModal";
import ConfirmDeleteRedModal from "./components/ConfirmDeleteRedModal";
import RedViewModal from "./components/RedViewModal";

export default function ListadoRedes() {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Estados principales
    const [redes, setRedes] = useState([]);
    const [macrorregiones, setMacrorregiones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState("");
    const [macroregionSeleccionada, setMacroregionSeleccionada] = useState(null);

    // Paginación
    const [paginaActual, setPaginaActual] = useState(1);
    const [itemsPorPagina, setItemsPorPagina] = useState(10);

    // Ordenamiento
    const [ordenamiento, setOrdenamiento] = useState({ campo: null, direccion: "asc" });

    // Estados para modales CRUD
    const [modalCrearEditar, setModalCrearEditar] = useState({ open: false, red: null });
    const [modalEliminar, setModalEliminar] = useState({ open: false, red: null });
    const [modalVer, setModalVer] = useState({ open: false, red: null });

    // Verificar permisos de usuario
    const esAdminOSuperadmin = user?.roles?.includes('ADMIN') || user?.roles?.includes('SUPERADMIN');
    const esSuperadmin = user?.roles?.includes('SUPERADMIN');

    // ================================================================
    // 📡 CARGAR DATOS
    // ================================================================
    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setLoading(true);

            // Cargar redes y macrorregiones
            const [redesData, macrorregionesData] = await Promise.all([
                redesService.obtenerTodas(),
                redesService.obtenerMacrorregiones()
            ]);

            setRedes(redesData || []);
            setMacrorregiones(macrorregionesData || []);
            toast.success(`${redesData?.length || 0} redes cargadas correctamente`);
        } catch (error) {
            console.error("Error al cargar datos:", error);
            toast.error("Error al cargar los datos de redes");
        } finally {
            setLoading(false);
        }
    };

    // ================================================================
    // 🔍 FILTRADO Y BÚSQUEDA
    // ================================================================
    const datosFiltrados = useMemo(() => {
        let resultado = [...redes];

        // Filtrar por búsqueda
        if (busqueda.trim()) {
            const termino = busqueda.toLowerCase();
            resultado = resultado.filter(
                (item) =>
                    item.descRed?.toLowerCase().includes(termino) ||
                    item.codRed?.toLowerCase().includes(termino) ||
                    item.macroregion?.descMacro?.toLowerCase().includes(termino)
            );
        }

        // Filtrar por macrorregión
        if (macroregionSeleccionada) {
            resultado = resultado.filter(
                (item) => item.macroregion?.idMacro === parseInt(macroregionSeleccionada)
            );
        }

        // Ordenar
        if (ordenamiento.campo) {
            resultado.sort((a, b) => {
                let valorA, valorB;

                if (ordenamiento.campo === 'macroregion') {
                    valorA = a.macroregion?.descMacro || "";
                    valorB = b.macroregion?.descMacro || "";
                } else {
                    valorA = a[ordenamiento.campo] || "";
                    valorB = b[ordenamiento.campo] || "";
                }

                const comparacion = valorA.toString().localeCompare(valorB.toString());
                return ordenamiento.direccion === "asc" ? comparacion : -comparacion;
            });
        }

        return resultado;
    }, [redes, busqueda, macroregionSeleccionada, ordenamiento]);

    // ================================================================
    // 📄 PAGINACIÓN
    // ================================================================
    const totalPaginas = Math.ceil(datosFiltrados.length / itemsPorPagina);
    const datosPaginados = useMemo(() => {
        const inicio = (paginaActual - 1) * itemsPorPagina;
        return datosFiltrados.slice(inicio, inicio + itemsPorPagina);
    }, [datosFiltrados, paginaActual, itemsPorPagina]);

    // Ajustar página si se queda fuera de rango
    useEffect(() => {
        if (paginaActual > totalPaginas && totalPaginas > 0) {
            setPaginaActual(1);
        }
    }, [totalPaginas, paginaActual]);

    // ================================================================
    // 🔄 HANDLERS
    // ================================================================
    const handleOrdenar = (campo) => {
        setOrdenamiento((prev) => ({
            campo,
            direccion: prev.campo === campo && prev.direccion === "asc" ? "desc" : "asc",
        }));
    };

    const limpiarFiltros = () => {
        setBusqueda("");
        setMacroregionSeleccionada(null);
        setPaginaActual(1);
        toast.success("Filtros limpiados");
    };

    // ================================================================
    // ✏️ CRUD DE REDES
    // ================================================================
    const handleCrear = () => {
        setModalCrearEditar({ open: true, red: null });
    };

    const handleEditar = (red) => {
        setModalCrearEditar({ open: true, red });
    };

    const handleEliminar = (red) => {
        setModalEliminar({ open: true, red });
    };

    const confirmarEliminar = async () => {
        try {
            await redesService.eliminar(modalEliminar.red.idRed);
            toast.success("Red eliminada exitosamente");
            setModalEliminar({ open: false, red: null });
            cargarDatos(); // Recargar datos
        } catch (error) {
            console.error("Error al eliminar red:", error);
            toast.error("Error al eliminar red");
        }
    };

    const handleSuccessModal = () => {
        setModalCrearEditar({ open: false, red: null });
        cargarDatos(); // Recargar datos
    };

    // ================================================================
    // 📥 EXPORTACIÓN
    // ================================================================
    const exportarCSV = () => {
        const headers = ["Código Red", "Nombre Red", "Macrorregión", "Estado"];
        const rows = datosFiltrados.map((item) => [
            item.codRed,
            item.descRed,
            item.macroregion?.descMacro || "Sin macrorregión",
            item.activa ? "Activa" : "Inactiva",
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `redes_${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("CSV exportado correctamente");
    };

    // ================================================================
    // 🎨 RENDER
    // ================================================================
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
                    <p className="text-slate-600">Cargando redes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* ============================================================ */ }
                {/* HEADER */ }
                {/* ============================================================ */ }
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={ () => navigate(-1) }
                            className="p-2 bg-white border-2 border-emerald-600 text-emerald-600 rounded-lg
                         hover:bg-emerald-600 hover:text-white transition-all"
                            title="Volver"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="bg-emerald-600 p-2 rounded-lg">
                            <Network className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Gestión de Redes</h1>
                            <p className="text-sm text-slate-600">
                                Administración de Redes Asistenciales
                            </p>
                        </div>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 text-sm">
                            <Network className="w-4 h-4 text-emerald-600" />
                            <span className="font-semibold text-slate-900">
                                { datosFiltrados.length }
                            </span>
                            <span className="text-slate-600">Redes</span>
                        </div>
                    </div>
                </header>

                {/* ============================================================ */ }
                {/* CARDS DE ESTADÍSTICAS */ }
                {/* ============================================================ */ }
                <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <Network className="w-8 h-8 opacity-80" />
                            <TrendingUp className="w-5 h-5 opacity-60" />
                        </div>
                        <p className="text-sm font-medium opacity-90 mb-1">Total Redes</p>
                        <p className="text-4xl font-bold">{ redes.length }</p>
                        <p className="text-xs opacity-75 mt-2">Redes registradas</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <MapPin className="w-8 h-8 opacity-80" />
                            <TrendingUp className="w-5 h-5 opacity-60" />
                        </div>
                        <p className="text-sm font-medium opacity-90 mb-1">Macrorregiones</p>
                        <p className="text-4xl font-bold">{ macrorregiones.length }</p>
                        <p className="text-xs opacity-75 mt-2">Regiones disponibles</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <Filter className="w-8 h-8 opacity-80" />
                            <TrendingUp className="w-5 h-5 opacity-60" />
                        </div>
                        <p className="text-sm font-medium opacity-90 mb-1">Filtradas</p>
                        <p className="text-4xl font-bold">{ datosFiltrados.length }</p>
                        <p className="text-xs opacity-75 mt-2">Resultados actuales</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                ✓
                            </div>
                            <TrendingUp className="w-5 h-5 opacity-60" />
                        </div>
                        <p className="text-sm font-medium opacity-90 mb-1">Activas</p>
                        <p className="text-4xl font-bold">
                            { redes.filter(r => r.activa).length }
                        </p>
                        <p className="text-xs opacity-75 mt-2">Redes habilitadas</p>
                    </div>
                </section>

                {/* ============================================================ */ }
                {/* FILTROS Y BÚSQUEDA */ }
                {/* ============================================================ */ }
                <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    {/* Búsqueda */ }
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Buscar Red
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                value={ busqueda }
                                onChange={ (e) => {
                                    setBusqueda(e.target.value);
                                    setPaginaActual(1);
                                } }
                                placeholder="Buscar por nombre, código o macrorregión..."
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg
                           focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                        </div>
                    </div>

                    {/* Filtro por Macrorregión */ }
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Filtrar por Macrorregión
                        </label>
                        <select
                            value={ macroregionSeleccionada || "" }
                            onChange={ (e) => {
                                setMacroregionSeleccionada(e.target.value || null);
                                setPaginaActual(1);
                            } }
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg
                         focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                            <option value="">Todas las macrorregiones</option>
                            { macrorregiones.map((macro) => (
                                <option key={ macro.idMacro } value={ macro.idMacro }>
                                    { macro.descMacro }
                                </option>
                            )) }
                        </select>
                    </div>

                    {/* Botones de acción */ }
                    <div className="flex flex-wrap items-center gap-3">
                        { esAdminOSuperadmin && (
                            <button
                                onClick={ handleCrear }
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white
                           rounded-lg hover:bg-emerald-700 transition-all shadow-md"
                            >
                                <Plus className="w-4 h-4" />
                                Nueva Red
                            </button>
                        ) }

                        <button
                            onClick={ exportarCSV }
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white
                         rounded-lg hover:bg-blue-700 transition-all shadow-md"
                        >
                            <Download className="w-4 h-4" />
                            Exportar a CSV
                        </button>

                        { (busqueda || macroregionSeleccionada) && (
                            <button
                                onClick={ limpiarFiltros }
                                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white
                           border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                Limpiar filtros
                            </button>
                        ) }

                        <div className="ml-auto flex items-center gap-2 text-sm text-slate-600">
                            <span>Mostrar:</span>
                            <select
                                value={ itemsPorPagina }
                                onChange={ (e) => {
                                    setItemsPorPagina(Number(e.target.value));
                                    setPaginaActual(1);
                                } }
                                className="px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value={ 10 }>10</option>
                                <option value={ 25 }>25</option>
                                <option value={ 50 }>50</option>
                                <option value={ 100 }>100</option>
                            </select>
                            <span>entradas</span>
                        </div>
                    </div>
                </section>

                {/* ============================================================ */ }
                {/* TABLA DE DATOS */ }
                {/* ============================================================ */ }
                <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-left">
                                        <button
                                            onClick={ () => handleOrdenar("codRed") }
                                            className="flex items-center gap-2 font-semibold text-slate-700 hover:text-emerald-600 transition-colors"
                                        >
                                            Código
                                            <ArrowUpDown className="w-4 h-4" />
                                        </button>
                                    </th>
                                    <th className="px-6 py-4 text-left">
                                        <button
                                            onClick={ () => handleOrdenar("descRed") }
                                            className="flex items-center gap-2 font-semibold text-slate-700 hover:text-emerald-600 transition-colors"
                                        >
                                            Nombre de la Red
                                            <ArrowUpDown className="w-4 h-4" />
                                        </button>
                                    </th>
                                    <th className="px-6 py-4 text-left">
                                        <button
                                            onClick={ () => handleOrdenar("macroregion") }
                                            className="flex items-center gap-2 font-semibold text-slate-700 hover:text-emerald-600 transition-colors"
                                        >
                                            Macrorregión
                                            <ArrowUpDown className="w-4 h-4" />
                                        </button>
                                    </th>
                                    <th className="px-6 py-4 text-left font-semibold text-slate-700">
                                        Estado
                                    </th>
                                    <th className="px-6 py-4 text-center font-semibold text-slate-700">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                { datosPaginados.length > 0 ? (
                                    datosPaginados.map((item, index) => (
                                        <tr
                                            key={ index }
                                            className="hover:bg-emerald-50/50 transition-colors"
                                        >
                                            <td className="px-6 py-4 text-sm font-mono font-semibold text-slate-900">
                                                { item.codRed }
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                                { item.descRed }
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-700">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                                    { item.macroregion?.descMacro || 'Sin macrorregión' }
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={ `inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${item.activa
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }` }>
                                                    { item.activa ? 'Activa' : 'Inactiva' }
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-700">
                                                <div className="flex items-center justify-center gap-2">
                                                    {/* Botón Ver - Disponible para TODOS */ }
                                                    <button
                                                        onClick={ () => setModalVer({ open: true, red: item }) }
                                                        className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                                                        title="Ver detalles"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>

                                                    {/* Botones Editar y Eliminar - Solo para ADMIN y SUPERADMIN */ }
                                                    { esAdminOSuperadmin && (
                                                        <>
                                                            <button
                                                                onClick={ () => handleEditar(item) }
                                                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                                title="Editar Red"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            { esSuperadmin && (
                                                                <button
                                                                    onClick={ () => handleEliminar(item) }
                                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                    title="Eliminar Red (solo SUPERADMIN)"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            ) }
                                                        </>
                                                    ) }
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                            <Network className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                                            <p className="text-lg font-medium">No se encontraron redes</p>
                                            <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
                                        </td>
                                    </tr>
                                ) }
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */ }
                    { datosFiltrados.length > 0 && (
                        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                            <div className="text-sm text-slate-600">
                                Mostrando{ " " }
                                <span className="font-semibold text-slate-900">
                                    { (paginaActual - 1) * itemsPorPagina + 1 }
                                </span>{ " " }
                                a{ " " }
                                <span className="font-semibold text-slate-900">
                                    { Math.min(paginaActual * itemsPorPagina, datosFiltrados.length) }
                                </span>{ " " }
                                de{ " " }
                                <span className="font-semibold text-slate-900">
                                    { datosFiltrados.length }
                                </span>{ " " }
                                entradas
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={ () => setPaginaActual((p) => Math.max(1, p - 1)) }
                                    disabled={ paginaActual === 1 }
                                    className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-white
                             disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5 text-slate-700" />
                                </button>

                                <div className="flex items-center gap-1">
                                    { [...Array(Math.min(5, totalPaginas))].map((_, i) => {
                                        const pagina = i + 1;
                                        return (
                                            <button
                                                key={ pagina }
                                                onClick={ () => setPaginaActual(pagina) }
                                                className={ `px-4 py-2 rounded-lg font-medium transition-all ${paginaActual === pagina
                                                        ? "bg-emerald-600 text-white shadow-md"
                                                        : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                                                    }` }
                                            >
                                                { pagina }
                                            </button>
                                        );
                                    }) }
                                    { totalPaginas > 5 && (
                                        <>
                                            <span className="px-2 text-slate-400">...</span>
                                            <button
                                                onClick={ () => setPaginaActual(totalPaginas) }
                                                className={ `px-4 py-2 rounded-lg font-medium transition-all ${paginaActual === totalPaginas
                                                        ? "bg-emerald-600 text-white shadow-md"
                                                        : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                                                    }` }
                                            >
                                                { totalPaginas }
                                            </button>
                                        </>
                                    ) }
                                </div>

                                <button
                                    onClick={ () => setPaginaActual((p) => Math.min(totalPaginas, p + 1)) }
                                    disabled={ paginaActual === totalPaginas }
                                    className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-white
                             disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5 text-slate-700" />
                                </button>
                            </div>
                        </div>
                    ) }
                </section>

                {/* ============================================================ */ }
                {/* MODALES */ }
                {/* ============================================================ */ }
                { modalCrearEditar.open && (
                    <RedFormModal
                        red={ modalCrearEditar.red }
                        macrorregiones={ macrorregiones }
                        onClose={ () => setModalCrearEditar({ open: false, red: null }) }
                        onSuccess={ handleSuccessModal }
                    />
                ) }

                { modalEliminar.open && (
                    <ConfirmDeleteRedModal
                        red={ modalEliminar.red }
                        onConfirm={ confirmarEliminar }
                        onCancel={ () => setModalEliminar({ open: false, red: null }) }
                    />
                ) }

                { modalVer.open && (
                    <RedViewModal
                        red={ modalVer.red }
                        onClose={ () => setModalVer({ open: false, red: null }) }
                    />
                ) }
            </div>
        </div>
    );
}
