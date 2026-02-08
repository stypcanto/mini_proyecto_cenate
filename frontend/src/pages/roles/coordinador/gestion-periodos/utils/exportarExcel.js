import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Exporta solicitudes a un archivo Excel
 * @param {Array} solicitudes - Lista de solicitudes a exportar
 * @param {String} nombreArchivo - Nombre del archivo (sin extensión)
 * @param {Object} periodoMap - Mapa de períodos para obtener descripciones
 */
export const exportarSolicitudesAExcel = (solicitudes, nombreArchivo = 'Solicitudes', periodoMap = new Map()) => {
  if (!solicitudes || solicitudes.length === 0) {
    alert('No hay datos para exportar');
    return;
  }

  // Preparar datos para Excel
  const datosExcel = solicitudes.map((solicitud) => ({
    'ID': solicitud.idSolicitud,
    'IPRESS': solicitud.nombreIpress,
    'Código IPRESS': solicitud.codIpress || '-',
    'Período': periodoMap.get(Number(solicitud.idPeriodo)) || `Periodo ${solicitud.idPeriodo}`,
    'Estado': solicitud.estado,
    'Fecha Envío': solicitud.fechaEnvio ? format(new Date(solicitud.fechaEnvio), 'dd/MM/yyyy HH:mm:ss', { locale: es }) : '-',
  }));

  // Crear workbook
  const ws = XLSX.utils.json_to_sheet(datosExcel);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Solicitudes');

  // Ajustar ancho de columnas
  const columnWidths = [
    { wch: 8 },  // ID
    { wch: 35 }, // IPRESS
    { wch: 15 }, // Código IPRESS
    { wch: 25 }, // Período
    { wch: 12 }, // Estado
    { wch: 20 }, // Fecha Envío
  ];
  ws['!cols'] = columnWidths;

  // Formato de encabezados
  const headerStyle = {
    font: { bold: true, color: 'FFFFFF' },
    fill: { fgColor: { rgb: '0A5BA9' } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  };

  // Aplicar estilos a los encabezados
  for (let i = 0; i < datosExcel[0] ? Object.keys(datosExcel[0]).length : 0; i++) {
    const cell = ws[XLSX.utils.encode_col(i) + '1'];
    if (cell) {
      cell.s = headerStyle;
    }
  }

  // Descargar archivo
  const timestamp = format(new Date(), 'yyyy-MM-dd_HHmmss');
  XLSX.writeFile(wb, `${nombreArchivo}_${timestamp}.xlsx`);
};

/**
 * Exporta solicitudes con detalle completo (incluyendo turno si está disponible)
 * @param {Array} solicitudes - Lista de solicitudes
 * @param {String} nombreArchivo - Nombre del archivo
 * @param {Object} periodoMap - Mapa de períodos
 * @param {Object} detalleMap - Mapa con detalles adicionales de solicitudes
 */
export const exportarSolicitudesConDetalleAExcel = (solicitudes, nombreArchivo = 'Solicitudes_Detalle', periodoMap = new Map(), detalleMap = {}) => {
  if (!solicitudes || solicitudes.length === 0) {
    alert('No hay datos para exportar');
    return;
  }

  const datosExcel = solicitudes.map((solicitud) => {
    const detalle = detalleMap[solicitud.idSolicitud] || {};
    return {
      'ID': solicitud.idSolicitud,
      'IPRESS': solicitud.nombreIpress,
      'Código IPRESS': solicitud.codIpress || '-',
      'Período': periodoMap.get(Number(solicitud.idPeriodo)) || `Periodo ${solicitud.idPeriodo}`,
      'Estado': solicitud.estado,
      'Fecha Envío': solicitud.fechaEnvio ? format(new Date(solicitud.fechaEnvio), 'dd/MM/yyyy HH:mm:ss', { locale: es }) : '-',
      'Cantidad de Turnos': detalle.cantidadTurnos || '-',
      'Especialidad Solicitada': detalle.especialidadSolicitada || '-',
      'Fecha Inicio': detalle.fechaInicio ? format(new Date(detalle.fechaInicio), 'dd/MM/yyyy', { locale: es }) : '-',
      'Fecha Fin': detalle.fechaFin ? format(new Date(detalle.fechaFin), 'dd/MM/yyyy', { locale: es }) : '-',
    };
  });

  const ws = XLSX.utils.json_to_sheet(datosExcel);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Solicitudes');

  const columnWidths = [
    { wch: 8 },  // ID
    { wch: 35 }, // IPRESS
    { wch: 15 }, // Código IPRESS
    { wch: 25 }, // Período
    { wch: 12 }, // Estado
    { wch: 20 }, // Fecha Envío
    { wch: 12 }, // Cantidad de Turnos
    { wch: 25 }, // Especialidad
    { wch: 15 }, // Fecha Inicio
    { wch: 15 }, // Fecha Fin
  ];
  ws['!cols'] = columnWidths;

  const timestamp = format(new Date(), 'yyyy-MM-dd_HHmmss');
  XLSX.writeFile(wb, `${nombreArchivo}_${timestamp}.xlsx`);
};

/**
 * Exporta una solicitud con sus especialidades en múltiples hojas
 * @param {Object} solicitud - Objeto de solicitud con detalles
 * @param {String} nombreArchivo - Nombre del archivo
 * @param {Object} periodoMap - Mapa de períodos
 */
export const exportarSolicitudCompleta = (solicitud, nombreArchivo = 'Reporte_Solicitud', periodoMap = new Map()) => {
  if (!solicitud) {
    alert('No hay datos para exportar');
    return;
  }

  const wb = XLSX.utils.book_new();

  // HOJA 1: Información General de la Solicitud
  const datosGenerales = [{
    'Campo': 'ID Solicitud',
    'Valor': solicitud.idSolicitud || '-'
  }, {
    'Campo': 'IPRESS',
    'Valor': solicitud.nombreIpress || '-'
  }, {
    'Campo': 'Código IPRESS',
    'Valor': solicitud.codIpress || '-'
  }, {
    'Campo': 'Período',
    'Valor': periodoMap.get(Number(solicitud.idPeriodo)) || `Periodo ${solicitud.idPeriodo}`
  }, {
    'Campo': 'Estado',
    'Valor': solicitud.estado || '-'
  }, {
    'Campo': 'Fecha Envío',
    'Valor': solicitud.fechaEnvio ? format(new Date(solicitud.fechaEnvio), 'dd/MM/yyyy HH:mm:ss', { locale: es }) : '-'
  }];

  const wsGeneral = XLSX.utils.json_to_sheet(datosGenerales);
  wsGeneral['!cols'] = [{ wch: 25 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, wsGeneral, 'General');

  // HOJA 2: Especialidades Solicitadas
  if (Array.isArray(solicitud.detalles) && solicitud.detalles.length > 0) {
    const datosEspecialidades = solicitud.detalles.map((detalle, idx) => ({
      'Nº': idx + 1,
      'Especialidad': detalle.nombreEspecialidad || detalle.nombreServicio || '-',
      'Código': detalle.codigoServicio || detalle.codServicio || '-',
      'Cantidad Turnos': detalle.cantidadTurnos || '-',
      'Fecha Inicio': detalle.fechaInicio ? format(new Date(detalle.fechaInicio), 'dd/MM/yyyy', { locale: es }) : '-',
      'Fecha Fin': detalle.fechaFin ? format(new Date(detalle.fechaFin), 'dd/MM/yyyy', { locale: es }) : '-',
      'Estado': detalle.estado || 'PENDIENTE',
      'Observación': detalle.observacion || '-'
    }));

    const wsEspecialidades = XLSX.utils.json_to_sheet(datosEspecialidades);
    wsEspecialidades['!cols'] = [
      { wch: 5 },
      { wch: 30 },
      { wch: 12 },
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 30 }
    ];
    XLSX.utils.book_append_sheet(wb, wsEspecialidades, 'Especialidades');
  }

  const timestamp = format(new Date(), 'yyyy-MM-dd_HHmmss');
  XLSX.writeFile(wb, `${nombreArchivo}_${timestamp}.xlsx`);
};
