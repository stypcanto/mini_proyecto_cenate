// ========================================================================
// Listado107.jsx – Importación Masiva de Pacientes (CENATE 2025)
// ------------------------------------------------------------------------
// Módulo "Bolsa 107" - Importación de pacientes desde archivos Excel
// Sistema de carga, validación y gestión de pacientes masivos
// ========================================================================

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import {
    Upload,
    FileSpreadsheet,
    Users,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Download,
    Eye,
    Trash2,
    RefreshCw,
    Search,
    Calendar,
    Clock,
    FileText,
    TrendingUp,
    BarChart3,
    Info,
    X
} from "lucide-react";
import formulario107Service from "../../../services/formulario107Service";

export default function Listado107() {
    // Estados
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [cargas, setCargas] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [modalDetalle, setModalDetalle] = useState(null);
    const [detalleData, setDetalleData] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const fileInputRef = useRef(null);

    // Cargar lista de cargas al montar el componente
    useEffect(() => {
        cargarListaCargas();
    }, []);

    const cargarListaCargas = async () => {
        try {
            setLoading(true);
            const cargas = await formulario107Service.obtenerListaCargas();
            console.log("📋 Cargas obtenidas:", cargas); // Debug
            setCargas(cargas || []);
        } catch (error) {
            console.error("Error al cargar lista de cargas:", error);
            alert("Error al cargar el historial de importaciones");
        } finally {
            setLoading(false);
        }
    };

    // Drag & Drop handlers
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            validarYSeleccionarArchivo(file);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            validarYSeleccionarArchivo(file);
        }
    };

    const validarYSeleccionarArchivo = (file) => {
        // Validar que sea un archivo Excel
        const extensionesValidas = ['.xlsx', '.xls'];
        const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

        if (!extensionesValidas.includes(extension)) {
            alert("Por favor, selecciona un archivo Excel válido (.xlsx o .xls)");
            return;
        }

        // Validar tamaño (máximo 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            alert("El archivo es demasiado grande. Tamaño máximo: 10MB");
            return;
        }

        setSelectedFile(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            alert("⚠️ Por favor, selecciona un archivo primero");
            return;
        }

        try {
            setUploading(true);
            const data = await formulario107Service.importarPacientesExcel(selectedFile);

            // El apiClient devuelve 'data' directamente, no el objeto 'response' completo
            if (data) {
                const { totalFilas, filasOk, filasError } = data;

                console.log('📊 Resultado de importación:', { totalFilas, filasOk, filasError });

                // Caso 1: 100% Exitoso (sin errores)
                if (filasError === 0 && filasOk > 0) {
                    const mensajeExito =
                        `✅ ¡CARGA COMPLETADA CON ÉXITO!\n\n` +
                        `📊 Resumen:\n` +
                        `   • Total procesado: ${totalFilas} registro${totalFilas !== 1 ? 's' : ''}\n` +
                        `   • Importados correctamente: ${filasOk}\n` +
                        `   • Sin errores: ✓\n\n` +
                        `🎉 Todos los registros fueron procesados exitosamente.`;

                    console.log('✅ MOSTRANDO MENSAJE DE ÉXITO:', mensajeExito);
                    alert(mensajeExito);
                }
                // Caso 2: Carga Parcial (algunos errores, pero también hay registros correctos)
                else if (filasOk > 0 && filasError > 0) {
                    const porcentajeOk = ((filasOk / totalFilas) * 100).toFixed(1);
                    alert(
                        `📋 CARGA COMPLETADA (con observaciones)\n\n` +
                        `📊 Resumen:\n` +
                        `   • Total procesado: ${totalFilas} registro${totalFilas !== 1 ? 's' : ''}\n` +
                        `   • ✅ Importados correctamente: ${filasOk} (${porcentajeOk}%)\n` +
                        `   • ⚠️  Con observaciones: ${filasError}\n\n` +
                        `💡 Se importaron ${filasOk} paciente${filasOk !== 1 ? 's' : ''} correctamente.\n` +
                        `Los registros con observaciones aparecen en el detalle de la carga.\n\n` +
                        `👉 Puedes ver los detalles haciendo clic en el ícono 👁️ del historial.`
                    );
                }
                // Caso 3: Solo errores (ningún registro válido)
                else if (filasOk === 0 && filasError > 0) {
                    alert(
                        `⚠️ CARGA PROCESADA - REQUIERE REVISIÓN\n\n` +
                        `📊 Resumen:\n` +
                        `   • Total procesado: ${totalFilas} registro${totalFilas !== 1 ? 's' : ''}\n` +
                        `   • ❌ Todos los registros tienen observaciones\n\n` +
                        `🔍 Posibles causas:\n` +
                        `   • Campos obligatorios vacíos (DNI, Nombres, Sexo, etc.)\n` +
                        `   • Formato de fecha incorrecto (debe ser dd/MM/yyyy)\n` +
                        `   • Datos inválidos o mal formateados\n\n` +
                        `👉 Revisa el detalle de errores en el historial (ícono 👁️) para corregir el archivo.`
                    );
                }
                // Caso 4: Archivo vacío
                else {
                    alert(
                        `⚠️ ARCHIVO VACÍO\n\n` +
                        `El archivo no contiene registros válidos para procesar.\n` +
                        `Por favor, verifica que el archivo tenga datos después del encabezado.`
                    );
                }

                // Limpiar selección y recargar lista
                setSelectedFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
                cargarListaCargas();
            }
        } catch (error) {
            console.error("Error al importar archivo:", error);

            // Manejar errores específicos del backend
            // El error capturado es un objeto Error con message
            const errorMessage = error.message || error.toString();
            let mensajeError = "";

            // Archivo duplicado
            if (errorMessage.includes("Ya se cargó este archivo") ||
                errorMessage.includes("mismo hash")) {
                mensajeError =
                    `📁 ARCHIVO YA CARGADO\n\n` +
                    `Este archivo ya fue importado anteriormente el día de hoy.\n\n` +
                    `🔍 Detalles:\n` +
                    `   • El sistema detecta archivos duplicados para evitar importaciones repetidas.\n` +
                    `   • Puedes ver la carga anterior en el historial.\n\n` +
                    `💡 Si necesitas volver a cargar el archivo:\n` +
                    `   1. Modifica algún dato en el Excel (aunque sea un espacio)\n` +
                    `   2. O elimina la carga anterior del historial`;
            }
            // Error de validación de headers
            else if (errorMessage.includes("encabezado") ||
                     errorMessage.includes("columna")) {
                mensajeError =
                    `📋 ERROR DE FORMATO - COLUMNAS INCORRECTAS\n\n` +
                    `El archivo no tiene el formato correcto.\n\n` +
                    `❌ Problema detectado:\n` +
                    `   ${errorMessage}\n\n` +
                    `✅ Solución:\n` +
                    `   • Verifica que el archivo tenga exactamente 14 columnas\n` +
                    `   • Los nombres de las columnas deben coincidir exactamente\n` +
                    `   • Revisa la guía de formato azul que aparece arriba\n\n` +
                    `💡 Tip: Descarga una plantilla de ejemplo del historial.`;
            }
            // Error de tamaño
            else if (errorMessage.includes("tamaño") || errorMessage.includes("size")) {
                mensajeError =
                    `📦 ARCHIVO DEMASIADO GRANDE\n\n` +
                    `El archivo excede el tamaño máximo permitido.\n\n` +
                    `Límites:\n` +
                    `   • Tamaño máximo: 10 MB\n` +
                    `   • Tamaño actual: ${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB\n\n` +
                    `💡 Soluciones:\n` +
                    `   • Divide el archivo en partes más pequeñas\n` +
                    `   • Elimina columnas innecesarias\n` +
                    `   • Guarda como .xlsx (no .xls)`;
            }
            // Error de extensión
            else if (errorMessage.includes("extensión") || errorMessage.includes("extension")) {
                mensajeError =
                    `📄 TIPO DE ARCHIVO NO VÁLIDO\n\n` +
                    `Solo se aceptan archivos de Excel.\n\n` +
                    `Formatos permitidos:\n` +
                    `   • .xlsx (Excel 2007 o superior) ✓\n` +
                    `   • .xls (Excel 97-2003) ✓\n\n` +
                    `Formato actual: ${selectedFile.name.split('.').pop()}\n\n` +
                    `💡 Guarda tu archivo como Excel (.xlsx) antes de cargarlo.`;
            }
            // Error genérico
            else {
                mensajeError =
                    `❌ ERROR AL PROCESAR EL ARCHIVO\n\n` +
                    `🔍 Detalle del error:\n` +
                    `   ${errorMessage}\n\n` +
                    `💡 Posibles soluciones:\n` +
                    `   • Verifica el formato del archivo (debe ser .xlsx o .xls)\n` +
                    `   • Asegúrate de que el archivo no esté corrupto\n` +
                    `   • Revisa que las columnas sean las correctas\n` +
                    `   • Verifica que los datos estén bien formateados\n\n` +
                    `Si el problema persiste, contacta con soporte técnico.`;
            }

            alert(mensajeError);
        } finally {
            setUploading(false);
        }
    };

    const verDetalleCarga = async (carga) => {
        try {
            setLoading(true);
            const response = await formulario107Service.obtenerDatosCarga(carga.idCarga);
            // response.data ya contiene { items, errores, total_items, total_errores }
            setDetalleData(response.data || response);
            setModalDetalle(carga);
        } catch (error) {
            console.error("Error al cargar detalles:", error);
            alert("Error al cargar los detalles de la carga");
        } finally {
            setLoading(false);
        }
    };

    const eliminarCarga = async (idCarga) => {
        if (!window.confirm("¿Estás seguro de eliminar esta carga? Esta acción no se puede deshacer.")) {
            return;
        }

        try {
            setLoading(true);
            await formulario107Service.eliminarCarga(idCarga);
            alert("✅ Carga eliminada correctamente");
            cargarListaCargas();
        } catch (error) {
            console.error("Error al eliminar carga:", error);
            alert("Error al eliminar la carga");
        } finally {
            setLoading(false);
        }
    };

    const exportarCarga = async (idCarga) => {
        try {
            setLoading(true);
            const blob = await formulario107Service.exportarCargaExcel(idCarga);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `bolsa_107_carga_${idCarga}.xlsx`;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error al exportar:", error);
            alert("Error al exportar la carga");
        } finally {
            setLoading(false);
        }
    };

    // Filtrar cargas según búsqueda
    const cargasFiltradas = cargas.filter(carga => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            carga.nombreArchivo?.toLowerCase().includes(term) ||
            carga.fechaReporte?.includes(term) ||
            carga.usuarioCarga?.toLowerCase().includes(term)
        );
    });

    // Calcular estadísticas
    const estadisticas = {
        totalCargas: cargas.length,
        totalPacientes: cargas.reduce((sum, c) => sum + (c.totalFilas || 0), 0),
        pacientesOk: cargas.reduce((sum, c) => sum + (c.filasOk || 0), 0),
        pacientesError: cargas.reduce((sum, c) => sum + (c.filasError || 0), 0),
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg shadow-lg">
                                <FileSpreadsheet className="w-8 h-8 text-white" />
                            </div>
                            Formulario 107 - Importación de Pacientes
                        </h1>
                        <p className="text-slate-600">Sistema de carga masiva desde archivos Excel</p>
                    </div>
                    <Button
                        onClick={cargarListaCargas}
                        disabled={loading}
                        className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Actualizar
                    </Button>
                </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-white border-2 border-violet-200 hover:border-violet-400 transition-all duration-300 hover:shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 mb-1">Total Cargas</p>
                                <p className="text-3xl font-bold text-violet-600">{estadisticas.totalCargas}</p>
                            </div>
                            <div className="p-3 bg-violet-100 rounded-lg">
                                <Upload className="w-6 h-6 text-violet-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 mb-1">Total Pacientes</p>
                                <p className="text-3xl font-bold text-blue-600">{estadisticas.totalPacientes}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-2 border-green-200 hover:border-green-400 transition-all duration-300 hover:shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 mb-1">Registros OK</p>
                                <p className="text-3xl font-bold text-green-600">{estadisticas.pacientesOk}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-2 border-red-200 hover:border-red-400 transition-all duration-300 hover:shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 mb-1">Con Errores</p>
                                <p className="text-3xl font-bold text-red-600">{estadisticas.pacientesError}</p>
                            </div>
                            <div className="p-3 bg-red-100 rounded-lg">
                                <XCircle className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Área de carga de archivos */}
            <Card className="bg-white shadow-lg mb-6 border-2 border-violet-200">
                <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Upload className="w-5 h-5 text-violet-600" />
                        Cargar Nuevo Archivo
                    </h2>

                    {/* Drag & Drop Zone */}
                    <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                            dragActive
                                ? 'border-violet-500 bg-violet-50'
                                : 'border-slate-300 hover:border-violet-400 hover:bg-violet-50/30'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-gradient-to-r from-violet-100 to-purple-100 rounded-full">
                                <FileSpreadsheet className="w-12 h-12 text-violet-600" />
                            </div>

                            {selectedFile ? (
                                <div className="w-full max-w-md">
                                    <div className="bg-violet-50 border-2 border-violet-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-6 h-6 text-violet-600" />
                                                <div className="text-left">
                                                    <p className="font-semibold text-slate-800">{selectedFile.name}</p>
                                                    <p className="text-sm text-slate-600">
                                                        {(selectedFile.size / 1024).toFixed(2)} KB
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setSelectedFile(null);
                                                    if (fileInputRef.current) fileInputRef.current.value = "";
                                                }}
                                                className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                                            >
                                                <X className="w-5 h-5 text-red-600" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <p className="text-lg font-semibold text-slate-800 mb-2">
                                            Arrastra tu archivo Excel aquí
                                        </p>
                                        <p className="text-sm text-slate-600">
                                            o haz clic para seleccionar un archivo
                                        </p>
                                    </div>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".xlsx,.xls"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="fileInput"
                                    />
                                    <label htmlFor="fileInput">
                                        <Button
                                            as="span"
                                            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white cursor-pointer"
                                        >
                                            <Upload className="w-4 h-4 mr-2" />
                                            Seleccionar Archivo
                                        </Button>
                                    </label>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Información de formato */}
                    <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                        <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-blue-800 flex-1">
                                <p className="font-semibold mb-3 text-blue-900">⚠️ Formato del archivo Excel (IMPORTANTE):</p>

                                {/* Columnas requeridas */}
                                <div className="mb-3">
                                    <p className="font-semibold text-blue-900 mb-1">📋 El archivo debe contener exactamente 14 columnas en este orden:</p>
                                    <div className="bg-white/80 rounded p-3 border border-blue-300">
                                        <ol className="text-xs space-y-0.5 text-blue-800 font-mono">
                                            <li>1. REGISTRO</li>
                                            <li>2. OPCIONES DE INGRESO DE LLAMADA</li>
                                            <li>3. TELEFONO</li>
                                            <li>4. TIPO DE DOCUMENTO</li>
                                            <li>5. DNI</li>
                                            <li>6. APELLIDOS Y NOMBRES</li>
                                            <li>7. SEXO</li>
                                            <li>8. FechaNacimiento</li>
                                            <li>9. DEPARTAMENTO</li>
                                            <li>10. PROVINCIA</li>
                                            <li>11. DISTRITO</li>
                                            <li>12. MOTIVO DE LA LLAMADA</li>
                                            <li>13. AFILIACION</li>
                                            <li>14. DERIVACION INTERNA</li>
                                        </ol>
                                    </div>
                                </div>

                                {/* Campos obligatorios */}
                                <div className="mb-3">
                                    <p className="font-semibold text-blue-900">✅ Campos obligatorios (sin estos la fila se marca como error):</p>
                                    <div className="bg-amber-50 rounded p-2 border border-amber-300 mt-1">
                                        <p className="text-xs text-amber-900 font-mono">
                                            TIPO DE DOCUMENTO, DNI, APELLIDOS Y NOMBRES, SEXO, FechaNacimiento, DERIVACION INTERNA
                                        </p>
                                    </div>
                                </div>

                                {/* Otras validaciones */}
                                <ul className="list-disc list-inside space-y-1 text-blue-700 text-xs">
                                    <li>Formato de fecha: <span className="font-mono bg-white px-1">dd/MM/yyyy</span> (ejemplo: 16/05/1990)</li>
                                    <li>Formato de archivo: <strong>.xlsx</strong> o <strong>.xls</strong></li>
                                    <li>Tamaño máximo: <strong>10MB</strong></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Botón de importar */}
                    {selectedFile && (
                        <div className="mt-6 flex justify-center">
                            <Button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg px-8 py-3 text-lg"
                            >
                                {uploading ? (
                                    <>
                                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                                        Procesando archivo...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-5 h-5 mr-2" />
                                        Importar Pacientes
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Historial de cargas */}
            <Card className="bg-white shadow-lg border-2 border-slate-200">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-violet-600" />
                            Historial de Importaciones
                        </h2>

                        {/* Búsqueda */}
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar por archivo, fecha..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-sm"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-slate-200 bg-slate-50">
                                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Archivo</th>
                                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Fecha Reporte</th>
                                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Fecha Carga</th>
                                    <th className="text-center py-3 px-4 font-semibold text-slate-700">Total</th>
                                    <th className="text-center py-3 px-4 font-semibold text-slate-700">Correctos</th>
                                    <th className="text-center py-3 px-4 font-semibold text-slate-700">Errores</th>
                                    <th className="text-center py-3 px-4 font-semibold text-slate-700">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cargasFiltradas.length > 0 ? (
                                    cargasFiltradas.map((carga) => (
                                        <tr key={carga.idCarga} className="border-b border-slate-100 hover:bg-violet-50/30 transition-colors">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <FileSpreadsheet className="w-4 h-4 text-violet-600" />
                                                    <span className="font-medium text-slate-800">{carga.nombreArchivo}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2 text-slate-700">
                                                    <Calendar className="w-4 h-4 text-slate-400" />
                                                    {carga.fechaReporte}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2 text-slate-600 text-sm">
                                                    <Clock className="w-4 h-4 text-slate-400" />
                                                    {new Date(carga.fechaCarga).toLocaleString('es-PE')}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                                                    {carga.totalFilas}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                                                    {carga.filasOk}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                                                    {carga.filasError}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => verDetalleCarga(carga)}
                                                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                                                        title="Ver detalles"
                                                    >
                                                        <Eye className="w-4 h-4 text-blue-600" />
                                                    </button>
                                                    <button
                                                        onClick={() => exportarCarga(carga.idCarga)}
                                                        className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                                                        title="Exportar"
                                                    >
                                                        <Download className="w-4 h-4 text-green-600" />
                                                    </button>
                                                    <button
                                                        onClick={() => eliminarCarga(carga.idCarga)}
                                                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-600" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="py-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-3">
                                                <FileSpreadsheet className="w-16 h-16 text-slate-300" />
                                                <p className="font-medium text-lg">No hay importaciones registradas</p>
                                                <p className="text-sm">Comienza cargando tu primer archivo Excel</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Modal de detalle de carga */}
            {modalDetalle && detalleData && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="bg-white max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                                    <div className="p-2 bg-violet-100 rounded-lg">
                                        <FileText className="w-6 h-6 text-violet-600" />
                                    </div>
                                    Detalle de Carga: {modalDetalle.nombreArchivo}
                                </h2>
                                <button
                                    onClick={() => {
                                        setModalDetalle(null);
                                        setDetalleData(null);
                                    }}
                                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6 text-red-600" />
                                </button>
                            </div>

                            {/* Resumen de la carga */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-700 mb-1">Total Procesados</p>
                                    <p className="text-2xl font-bold text-blue-800">
                                        {(detalleData.total_items || 0) + (detalleData.total_errores || 0)}
                                    </p>
                                </div>
                                <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                                    <p className="text-sm text-green-700 mb-1">Registros Correctos</p>
                                    <p className="text-2xl font-bold text-green-800">{detalleData.total_items || 0}</p>
                                </div>
                                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                                    <p className="text-sm text-red-700 mb-1">Registros con Errores</p>
                                    <p className="text-2xl font-bold text-red-800">{detalleData.total_errores || 0}</p>
                                </div>
                            </div>

                            {/* Tabla de pacientes importados */}
                            {detalleData.items && detalleData.items.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                                        Pacientes Importados Correctamente ({detalleData.items.length})
                                    </h3>
                                    <div className="overflow-x-auto max-h-64">
                                        <table className="w-full text-sm">
                                            <thead className="bg-slate-50 sticky top-0">
                                                <tr className="border-b border-slate-200">
                                                    <th className="text-left py-2 px-3 font-semibold text-slate-700">Registro</th>
                                                    <th className="text-left py-2 px-3 font-semibold text-slate-700">DNI</th>
                                                    <th className="text-left py-2 px-3 font-semibold text-slate-700">Paciente</th>
                                                    <th className="text-left py-2 px-3 font-semibold text-slate-700">Sexo</th>
                                                    <th className="text-left py-2 px-3 font-semibold text-slate-700">Teléfono</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {detalleData.items.map((p, idx) => (
                                                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                                                        <td className="py-2 px-3">{p.registro}</td>
                                                        <td className="py-2 px-3">{p.numero_documento}</td>
                                                        <td className="py-2 px-3 font-medium">{p.paciente}</td>
                                                        <td className="py-2 px-3">{p.sexo}</td>
                                                        <td className="py-2 px-3">{p.telefono || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Tabla de errores */}
                            {detalleData.errores && detalleData.errores.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                                        <XCircle className="w-5 h-5 text-red-600" />
                                        Registros con Errores ({detalleData.errores.length})
                                    </h3>
                                    <div className="overflow-x-auto max-h-64">
                                        <table className="w-full text-sm">
                                            <thead className="bg-red-50 sticky top-0">
                                                <tr className="border-b border-red-200">
                                                    <th className="text-left py-2 px-3 font-semibold text-red-800">Registro</th>
                                                    <th className="text-left py-2 px-3 font-semibold text-red-800">Código Error</th>
                                                    <th className="text-left py-2 px-3 font-semibold text-red-800">Mensaje</th>
                                                    <th className="text-left py-2 px-3 font-semibold text-red-800">Columnas Afectadas</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {detalleData.errores.map((err, idx) => (
                                                    <tr key={idx} className="border-b border-red-100 hover:bg-red-50">
                                                        <td className="py-2 px-3">{err.registro}</td>
                                                        <td className="py-2 px-3">
                                                            <span className="px-2 py-1 bg-red-200 text-red-900 rounded text-xs font-mono">
                                                                {err.codigo_error}
                                                            </span>
                                                        </td>
                                                        <td className="py-2 px-3 text-red-700">{err.detalle_error}</td>
                                                        <td className="py-2 px-3">{err.columnas_error || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
