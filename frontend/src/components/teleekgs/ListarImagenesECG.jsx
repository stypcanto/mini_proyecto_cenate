// ========================================================================
// 📋 ListarImagenesECG.jsx – Componente para Listar y Filtrar ECGs
// ✅ VERSIÓN 1.1.0 - CENATE 2026
// Funcionalidades: READ, UPDATE (Procesar/Rechazar), DELETE (Eliminar)
// ========================================================================

import React, { useState, useEffect } from "react";
import {
  Search, Filter, Download, Eye, Trash2, CheckCircle, XCircle,
  Clock, Link2, MoreVertical, Loader, ChevronLeft, ChevronRight,
  AlertTriangle, Image as ImageIcon
} from "lucide-react";
import toast from "react-hot-toast";
import teleekgService from "../../services/teleekgService";
import DetallesImagenECG from "./DetallesImagenECG";
import CarrouselECGModal from "./CarrouselECGModal";
import ConfirmDialog from "../modals/ConfirmDialog";

export default function ListarImagenesECG({ onSuccess }) {
  const [imagenes, setImagenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filtros
  const [numDoc, setNumDoc] = useState("");
  const [estado, setEstado] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Modal de detalles
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);

  // v3.0.0: Modal de carrusel para múltiples imágenes (PADOMI)
  const [carouselAbierto, setCarouselAbierto] = useState(false);
  const [imagenesCarousel, setImagenesCarousel] = useState([]);
  const [pacienteCarousel, setPacienteCarousel] = useState(null);

  // Estados para acciones
  const [accionando, setAccionando] = useState(false);
  const [imagenEnAccion, setImagenEnAccion] = useState(null);

  // Estados para confirmación de eliminación
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [imagenParaEliminar, setImagenParaEliminar] = useState(null);

  // v3.0.0: Nuevos estados para CENATE (ENVIADA transformada a PENDIENTE)
  const estados = [
    { value: "", label: "Todos los estados" },
    { value: "PENDIENTE", label: "⏳ Pendiente (Enviada)" },
    { value: "OBSERVADA", label: "👁️ Observada" },
    { value: "ATENDIDA", label: "✅ Atendida" }
  ];

  useEffect(() => {
    cargarImagenes();
  }, [page, numDoc, estado, fechaDesde, fechaHasta]);

  const cargarImagenes = async () => {
    try {
      setLoading(true);
      const response = await teleekgService.listarImagenes({
        numDoc: numDoc || undefined,
        estado: estado || undefined,
        fechaDesde: fechaDesde || undefined,
        fechaHasta: fechaHasta || undefined,
        page,
        size
      });

      setImagenes(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      console.error("Error al cargar imágenes:", error);
      toast.error("Error al cargar las imágenes");
    } finally {
      setLoading(false);
    }
  };

  // v3.0.0: Obtener todas las imágenes de un paciente para carrusel
  const obtenerImagenesPaciente = async (numDoc) => {
    try {
      const response = await teleekgService.listarImagenes({ numDoc, page: 0, size: 100 });
      return response.content || [];
    } catch (error) {
      console.error("Error al cargar imágenes del paciente:", error);
      return [];
    }
  };

  // v3.0.0: Abrir carrusel con todas las imágenes del paciente
  const abrirCarousel = async (imagen) => {
    try {
      // Obtener todas las imágenes del paciente
      const todasImagenes = await obtenerImagenesPaciente(imagen.numDocPaciente);

      // Cargar previews de todas las imágenes
      const imagenesConPreview = await Promise.all(
        todasImagenes.map(async (img) => {
          try {
            const preview = await teleekgService.verPreview(img.idImagen);
            return { ...img, ...preview };
          } catch (error) {
            console.error(`Error al cargar preview para ${img.idImagen}:`, error);
            return img;
          }
        })
      );

      setPacienteCarousel({
        numDoc: imagen.numDocPaciente,
        nombres: imagen.nombresPaciente,
        apellidos: imagen.apellidosPaciente,
      });
      setImagenesCarousel(imagenesConPreview);
      setCarouselAbierto(true);

      // Badge con cantidad de imágenes
      if (imagenesConPreview.length > 1) {
        toast.success(`📸 Carrusel: ${imagenesConPreview.length} imágenes`);
      }
    } catch (error) {
      console.error("Error al abrir carrusel:", error);
      toast.error("Error al cargar el carrusel de imágenes");
    }
  };

  const handleDescargar = async (id, nombre) => {
    try {
      toast.loading("Descargando imagen...");
      await teleekgService.descargarImagen(id);
      toast.dismiss();
      toast.success("Imagen descargada correctamente");
    } catch (error) {
      console.error("Error al descargar:", error);
      toast.error("Error al descargar la imagen");
    }
  };

  // v3.0.0: Colores para nuevos estados
  const getColorEstado = (imagen) => {
    const estado = imagen.estadoTransformado || imagen.estado;
    switch (estado) {
      case "PENDIENTE":
      case "ENVIADA":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "OBSERVADA":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "ATENDIDA":
        return "bg-green-100 text-green-800 border-green-300";
      case "RECHAZADA":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  // v3.0.0: Iconos para nuevos estados
  const getIconoEstado = (imagen) => {
    const estado = imagen.estadoTransformado || imagen.estado;
    switch (estado) {
      case "PENDIENTE":
      case "ENVIADA":
        return <Clock className="w-4 h-4" />;
      case "OBSERVADA":
        return <AlertTriangle className="w-4 h-4" />;
      case "ATENDIDA":
        return <CheckCircle className="w-4 h-4" />;
      case "RECHAZADA":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const handleLimpiarFiltros = () => {
    setNumDoc("");
    setEstado("");
    setFechaDesde("");
    setFechaHasta("");
    setPage(0);
  };

  // Procesar/Aceptar ECG
  const handleProcesar = async (idImagen) => {
    const observaciones = prompt("Ingresa observaciones (opcional):");
    if (observaciones === null) return;

    try {
      setAccionando(true);
      setImagenEnAccion(idImagen);
      await teleekgService.procesarImagen(idImagen, observaciones);
      toast.success("✅ ECG procesada correctamente");
      cargarImagenes();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error:", error);
      toast.error("❌ Error al procesar ECG");
    } finally {
      setAccionando(false);
      setImagenEnAccion(null);
    }
  };

  // Rechazar ECG
  const handleRechazar = async (idImagen) => {
    const motivo = prompt("Ingresa el motivo del rechazo:");
    if (motivo === null || !motivo.trim()) return;

    try {
      setAccionando(true);
      setImagenEnAccion(idImagen);
      await teleekgService.rechazarImagen(idImagen, motivo);
      toast.success("✅ ECG rechazada correctamente");
      cargarImagenes();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error:", error);
      toast.error("❌ Error al rechazar ECG");
    } finally {
      setAccionando(false);
      setImagenEnAccion(null);
    }
  };

  // Mostrar dialogo de confirmación para eliminar
  const handleEliminar = (idImagen) => {
    setImagenParaEliminar(idImagen);
    setConfirmDialogOpen(true);
  };

  // Confirmar eliminación de ECG
  const confirmarEliminar = async () => {
    if (!imagenParaEliminar) return;

    try {
      setAccionando(true);
      setImagenEnAccion(imagenParaEliminar);
      await teleekgService.eliminarImagen(imagenParaEliminar);
      toast.success("✅ ECG eliminada correctamente");
      cargarImagenes();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error:", error);
      toast.error("❌ Error al eliminar ECG");
    } finally {
      setAccionando(false);
      setImagenEnAccion(null);
      setConfirmDialogOpen(false);
      setImagenParaEliminar(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Panel de Filtros */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            Filtros
          </h2>
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            {mostrarFiltros ? "Ocultar" : "Mostrar"}
            <ChevronRight className={`w-4 h-4 transition ${mostrarFiltros ? "rotate-90" : ""}`} />
          </button>
        </div>

        {mostrarFiltros && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DNI del Paciente
                </label>
                <input
                  type="text"
                  maxLength="8"
                  placeholder="12345678"
                  value={numDoc}
                  onChange={(e) => {
                    setNumDoc(e.target.value.replace(/\D/g, ""));
                    setPage(0);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={estado}
                  onChange={(e) => {
                    setEstado(e.target.value);
                    setPage(0);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {estados.map((est) => (
                    <option key={est.value} value={est.value}>
                      {est.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Desde
                </label>
                <input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => {
                    setFechaDesde(e.target.value);
                    setPage(0);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hasta
                </label>
                <input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => {
                    setFechaHasta(e.target.value);
                    setPage(0);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              onClick={handleLimpiarFiltros}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Tabla de Imágenes */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <p className="text-sm text-gray-600">
            Mostrando {imagenes.length} de {totalElements} registros
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : imagenes.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No hay imágenes disponibles</p>
            <p className="text-sm text-gray-500">Intenta ajustar los filtros</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">DNI</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Paciente</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Estado</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Vigencia</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Tamaño</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Fecha</th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {imagenes.map((imagen) => (
                  <tr key={imagen.idImagen} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-mono font-medium">{imagen.numDocPaciente}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{imagen.nombresPaciente}</p>
                        <p className="text-sm text-gray-500">{imagen.apellidosPaciente}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {/* v3.0.0: Mostrar estado transformado si está disponible */}
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-semibold ${getColorEstado(imagen)}`}>
                        {getIconoEstado(imagen)}
                        {imagen.estadoTransformado || imagen.estado}
                      </span>
                      {/* Mostrar observaciones si existen */}
                      {imagen.observaciones && (
                        <div className="text-xs text-gray-600 mt-1 p-1 bg-gray-50 rounded">
                          <p className="font-medium">💬 {imagen.observaciones}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium ${
                        imagen.vigencia === "VENCIDA"
                          ? "text-red-600"
                          : imagen.vigencia === "PRÓX_A_VENCER"
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}>
                        {imagen.vigencia} ({imagen.diasRestantes}d)
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {(imagen.tamanioBytes / 1024 / 1024).toFixed(2)}MB
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(imagen.fechaEnvio).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-1 flex-wrap">
                        {/* v3.0.0: Ver en carrusel (si hay múltiples) o detalles */}
                        <button
                          onClick={() => abrirCarousel(imagen)}
                          disabled={accionando && imagenEnAccion === imagen.idImagen}
                          className="p-2 hover:bg-blue-100 rounded text-blue-600 transition disabled:opacity-50"
                          title="Ver en carrusel (PADOMI)"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Descargar */}
                        <button
                          onClick={() => handleDescargar(imagen.idImagen, imagen.nombreArchivo)}
                          disabled={accionando && imagenEnAccion === imagen.idImagen}
                          className="p-2 hover:bg-green-100 rounded text-green-600 transition disabled:opacity-50"
                          title="Descargar"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {/* v3.0.0: Procesar (si está pendiente/enviada) */}
                        {(imagen.estadoTransformado === "PENDIENTE" || imagen.estado === "PENDIENTE" || imagen.estado === "ENVIADA") && (
                          <button
                            onClick={() => handleProcesar(imagen.idImagen)}
                            disabled={accionando && imagenEnAccion === imagen.idImagen}
                            className="p-2 hover:bg-green-100 rounded text-green-600 transition disabled:opacity-50"
                            title="Aceptar/Procesar"
                          >
                            {accionando && imagenEnAccion === imagen.idImagen ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                        )}

                        {/* v3.0.0: Rechazar (si está pendiente/enviada) */}
                        {(imagen.estadoTransformado === "PENDIENTE" || imagen.estado === "PENDIENTE" || imagen.estado === "ENVIADA") && (
                          <button
                            onClick={() => handleRechazar(imagen.idImagen)}
                            disabled={accionando && imagenEnAccion === imagen.idImagen}
                            className="p-2 hover:bg-red-100 rounded text-red-600 transition disabled:opacity-50"
                            title="Rechazar"
                          >
                            {accionando && imagenEnAccion === imagen.idImagen ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                          </button>
                        )}

                        {/* Eliminar */}
                        <button
                          onClick={() => handleEliminar(imagen.idImagen)}
                          disabled={accionando && imagenEnAccion === imagen.idImagen}
                          className="p-2 hover:bg-red-100 rounded text-red-600 transition disabled:opacity-50"
                          title="Eliminar"
                        >
                          {accionando && imagenEnAccion === imagen.idImagen ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>
            <span className="text-sm text-gray-600">
              Página {page + 1} de {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* v3.0.0: Modal de Carrusel (PADOMI - múltiples imágenes) */}
      {carouselAbierto && imagenesCarousel.length > 0 && (
        <CarrouselECGModal
          imagenes={imagenesCarousel}
          paciente={pacienteCarousel}
          onClose={() => {
            setCarouselAbierto(false);
            setImagenesCarousel([]);
            setPacienteCarousel(null);
          }}
          onDescargar={(imagen) => {
            handleDescargar(imagen.idImagen, imagen.nombreArchivo);
          }}
        />
      )}

      {/* Modal de Detalles */}
      {imagenSeleccionada && (
        <DetallesImagenECG
          imagen={imagenSeleccionada}
          onClose={() => setImagenSeleccionada(null)}
          onSuccess={() => {
            setImagenSeleccionada(null);
            cargarImagenes();
            if (onSuccess) onSuccess();
          }}
        />
      )}

      {/* Dialogo Confirmación Eliminación */}
      <ConfirmDialog
        isOpen={confirmDialogOpen}
        onClose={() => {
          setConfirmDialogOpen(false);
          setImagenParaEliminar(null);
        }}
        onConfirm={confirmarEliminar}
        title="Eliminar ECG"
        message="¿Estás seguro de que deseas eliminar este ECG? Esta acción no se puede deshacer."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
}
