import React, { useState } from "react";
import { Eye, Download, Trash2, Calendar, User, Phone, CheckCircle, XCircle, Loader } from "lucide-react";
import CarrouselECGModal from "./CarrouselECGModal";
import teleekgService from "../../services/teleekgService";

/**
 * 📋 Tabla de EKGs por pacientes
 * ✅ v3.1.0 - Actualizado para agrupar imágenes por paciente + carrusel modal
 */
export default function ListaEKGsPacientes({
  ecgs,
  onVer,
  onDescargar,
  onEliminar,
  onProcesar,
  onRechazar,
  accionando = false,
  imagenEnAccion = null
}) {
  const [carouselAbierto, setCarouselAbierto] = useState(false);
  const [imagenesCarousel, setImagenesCarousel] = useState([]);
  const [pacienteCarousel, setPacienteCarousel] = useState(null);
  const [cargandoCarousel, setCargandoCarousel] = useState(false);
  const getEstadoBadge = (estado) => {
    // v3.0.0: Soportar nuevos estados + transformados
    const estilos = {
      // Estados transformados para usuario EXTERNO
      ENVIADA: "bg-blue-100 text-blue-800 border border-blue-300",
      RECHAZADA: "bg-red-100 text-red-800 border border-red-300",
      ATENDIDA: "bg-green-100 text-green-800 border border-green-300",
      // Estados transformados para CENATE
      PENDIENTE: "bg-yellow-100 text-yellow-800 border border-yellow-300",
      OBSERVADA: "bg-purple-100 text-purple-800 border border-purple-300",
      // Legacy (deprecated)
      PROCESADA: "bg-green-100 text-green-800 border border-green-300",
    };
    return estilos[estado] || "bg-gray-100 text-gray-800 border border-gray-300";
  };

  const obtenerEstadoMostrado = (ecg) => {
    // v3.0.0: Preferir estado transformado si está disponible
    return ecg.estadoTransformado || ecg.estado;
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleDateString("es-PE");
  };

  // v3.1.0: Agrupar imágenes por paciente (numDocPaciente)
  const agruparImagenesPorPaciente = (imagenesLista) => {
    const agrupadas = {};

    imagenesLista.forEach(imagen => {
      const key = imagen.numDocPaciente;
      if (!agrupadas[key]) {
        agrupadas[key] = {
          numDocPaciente: imagen.numDocPaciente,
          nombresPaciente: imagen.nombresPaciente,
          apellidosPaciente: imagen.apellidosPaciente,
          telefonoPrincipalPaciente: imagen.telefonoPrincipalPaciente,
          edadPaciente: imagen.edadPaciente,
          generoPaciente: imagen.generoPaciente,
          imagenes: [],
          estado: imagen.estadoTransformado || imagen.estado,
          fechaPrimera: imagen.fechaEnvio,
          tamanioTotal: 0
        };
      }
      agrupadas[key].imagenes.push(imagen);
      agrupadas[key].tamanioTotal += imagen.tamanioBytes || 0;
    });

    return Object.values(agrupadas);
  };

  // v3.1.0: Abrir carrusel con todas las imágenes del paciente (cargando previews)
  const abrirCarousel = async (pacienteAgrupado) => {
    try {
      setCargandoCarousel(true);

      // Cargar previews de todas las imágenes en paralelo
      const imagenesConPreview = await Promise.all(
        pacienteAgrupado.imagenes.map(async (imagen) => {
          try {
            const preview = await teleekgService.verPreview(imagen.idImagen);
            return {
              ...imagen,
              contenidoImagen: preview.contenidoImagen,
              tipoContenido: preview.tipoContenido
            };
          } catch (error) {
            console.error(`Error al cargar preview para ${imagen.idImagen}:`, error);
            return imagen; // Retornar sin preview si hay error
          }
        })
      );

      setPacienteCarousel({
        numDoc: pacienteAgrupado.numDocPaciente,
        nombres: pacienteAgrupado.nombresPaciente,
        apellidos: pacienteAgrupado.apellidosPaciente,
      });
      setImagenesCarousel(imagenesConPreview);
      setCarouselAbierto(true);
    } catch (error) {
      console.error("Error al abrir carrusel:", error);
    } finally {
      setCargandoCarousel(false);
    }
  };

  // ✅ v3.2.0: Procesar TODAS las imágenes del paciente
  const procesarTodas = (pacienteAgrupado) => {
    if (pacienteAgrupado.imagenes.length === 0) return;
    // Procesar la primera imagen (que mostrará el prompt de observaciones)
    // y las demás se procesarán con las mismas observaciones
    onProcesar(pacienteAgrupado.imagenes[0].idImagen);
    // Las demás sin prompt (asumiendo mismas observaciones)
    for (let i = 1; i < pacienteAgrupado.imagenes.length; i++) {
      onProcesar(pacienteAgrupado.imagenes[i].idImagen);
    }
  };

  // ✅ v3.2.0: Rechazar TODAS las imágenes del paciente
  const rechazarTodas = (pacienteAgrupado) => {
    if (pacienteAgrupado.imagenes.length === 0) return;
    // Rechazar la primera imagen (que mostrará el prompt de motivo)
    onRechazar(pacienteAgrupado.imagenes[0].idImagen);
    // Las demás sin prompt (asumiendo mismo motivo)
    for (let i = 1; i < pacienteAgrupado.imagenes.length; i++) {
      onRechazar(pacienteAgrupado.imagenes[i].idImagen);
    }
  };

  // ✅ v3.2.0: Eliminar TODAS las imágenes del paciente
  const eliminarTodas = (pacienteAgrupado) => {
    const confirmar = window.confirm(
      `¿Eliminar todos los ${pacienteAgrupado.imagenes.length} EKGs de este paciente? Esta acción no se puede deshacer.`
    );
    if (!confirmar) return;

    // Eliminar todas las imágenes
    pacienteAgrupado.imagenes.forEach((imagen) => {
      onEliminar(imagen.idImagen);
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Fecha
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              DNI
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Paciente
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Teléfono
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Edad
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Género
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Estado
            </th>
            <th className="px-6 py-4 text-center text-sm font-semibold">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {/* v3.1.0: Usar datos agrupados por paciente */}
          {agruparImagenesPorPaciente(ecgs).map((paciente) => (
            <tr
              key={paciente.numDocPaciente}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-6 py-4 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {formatearFecha(paciente.fechaPrimera)}
                </div>
              </td>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                {paciente.numDocPaciente}
              </td>
              <td className="px-6 py-4 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="font-medium">
                      {paciente.nombresPaciente} {paciente.apellidosPaciente}
                    </p>
                    <p className="text-xs text-blue-600 font-semibold">
                      📸 {paciente.imagenes.length} EKG{paciente.imagenes.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {paciente.telefonoPrincipalPaciente || "-"}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-700">
                {paciente.edadPaciente || "-"}
              </td>
              <td className="px-6 py-4 text-sm text-gray-700">
                {paciente.generoPaciente || "-"}
              </td>
              <td className="px-6 py-4 text-sm">
                <div className="space-y-1">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getEstadoBadge(paciente.estado)}`}>
                    {paciente.estado}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {/* Ver carrusel (con todas las imágenes del paciente) */}
                  <button
                    onClick={() => abrirCarousel(paciente)}
                    disabled={accionando || cargandoCarousel}
                    className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={`Ver ${paciente.imagenes.length} imagen(es) en carrusel`}
                  >
                    {cargandoCarousel ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>

                  {/* Descargar primera imagen */}
                  <button
                    onClick={() => onDescargar(paciente.imagenes[0].idImagen, paciente.imagenes[0].nombreArchivo)}
                    disabled={accionando}
                    className="p-2 hover:bg-green-100 rounded-lg transition-colors text-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Descargar primera imagen"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  {/* ✅ v3.2.0: Procesar TODAS las imágenes (solo visible en estado PENDIENTE/ENVIADA) */}
                  {(paciente.estado === "PENDIENTE" || paciente.estado === "ENVIADA") && onProcesar && (
                    <button
                      onClick={() => procesarTodas(paciente)}
                      disabled={accionando}
                      className="p-2 hover:bg-green-100 rounded-lg transition-colors text-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title={`Procesar todos los ${paciente.imagenes.length} EKGs`}
                    >
                      {accionando ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                    </button>
                  )}

                  {/* ✅ v3.2.0: Rechazar TODAS las imágenes (solo visible en estado PENDIENTE/ENVIADA) */}
                  {(paciente.estado === "PENDIENTE" || paciente.estado === "ENVIADA") && onRechazar && (
                    <button
                      onClick={() => rechazarTodas(paciente)}
                      disabled={accionando}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title={`Rechazar todos los ${paciente.imagenes.length} EKGs`}
                    >
                      {accionando ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                    </button>
                  )}

                  {/* ✅ v3.2.0: Eliminar TODAS las imágenes del registro */}
                  <button
                    onClick={() => eliminarTodas(paciente)}
                    disabled={accionando}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={`Eliminar todos los ${paciente.imagenes.length} EKGs`}
                  >
                    {accionando ? (
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

      {/* v3.1.0: Modal de Carrusel */}
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
            onDescargar(imagen.idImagen, imagen.nombreArchivo);
          }}
        />
      )}
    </div>
  );
}
