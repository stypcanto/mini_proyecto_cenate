package com.styp.cenate.service.formdiag.impl;

import com.styp.cenate.dto.formdiag.FormDiagEstadisticasDTO;
import com.styp.cenate.service.formdiag.FormDiagExcelService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Implementación del servicio para generar reportes Excel
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FormDiagExcelServiceImpl implements FormDiagExcelService {

    private final FormDiagServiceImpl formDiagService;

    private static final String TITULO_EXCEL = "Reporte Estadístico - Formulario de Diagnóstico Situacional";
    private static final DateTimeFormatter FECHA_FORMATO = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    // Colores
    private static final short COLOR_HEADER = 26; // Azul oscuro
    private static final short COLOR_FOOTER = 45; // Azul claro
    private static final short COLOR_SUCCESS = 10; // Verde
    private static final short COLOR_WARNING = 13; // Naranja

    @Override
    public byte[] generarReporteExcel(Integer idFormulario) {
        try {
            log.info("Generando Excel para formulario: {}", idFormulario);
            FormDiagEstadisticasDTO estadisticas = formDiagService.obtenerEstadisticasDetalladas(idFormulario);
            return generarReporteExcelDesdeEstadisticas(estadisticas);
        } catch (Exception e) {
            log.error("Error generando Excel: {}", e.getMessage(), e);
            throw new RuntimeException("Error generando Excel: " + e.getMessage(), e);
        }
    }

    @Override
    public byte[] generarReporteExcelDesdeEstadisticas(FormDiagEstadisticasDTO estadisticas) {
        try (Workbook workbook = new XSSFWorkbook()) {

            // Crear hojas
            crearHojaDashboard(workbook, estadisticas);
            crearHojaReporte1_RecursosHumanos(workbook, estadisticas);
            crearHojaReporte2_InfraestructuraFisica(workbook, estadisticas);
            crearHojaReporte3_InfraestructuraTecnologica(workbook, estadisticas);
            crearHojaReporte4_Conectividad(workbook, estadisticas);
            crearHojaReporte5_Equipamiento(workbook, estadisticas);
            crearHojaReporte6_Servicios(workbook, estadisticas);
            crearHojaReporte7_Necesidades(workbook, estadisticas);

            // Convertir a bytes
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();

        } catch (IOException e) {
            log.error("Error al escribir Excel: {}", e.getMessage(), e);
            throw new RuntimeException("Error al generar Excel", e);
        }
    }

    private void crearHojaDashboard(Workbook workbook, FormDiagEstadisticasDTO stats) {
        Sheet sheet = workbook.createSheet("Dashboard");
        sheet.setColumnWidth(0, 4000);
        sheet.setColumnWidth(1, 3000);
        sheet.setColumnWidth(2, 3000);
        sheet.setColumnWidth(3, 3000);

        int rowNum = 0;

        // ===== TÍTULO =====
        Row titleRow = sheet.createRow(rowNum++);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue(TITULO_EXCEL);
        CellStyle titleStyle = crearEstiloCelda(workbook, true, 14, COLOR_HEADER);
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 3));

        rowNum++; // Espacio

        // ===== INFORMACIÓN GENERAL =====
        Row infoRow = sheet.createRow(rowNum++);
        infoRow.createCell(0).setCellValue("Información General");
        CellStyle headerStyle = crearEstiloCelda(workbook, true, 12, COLOR_HEADER);
        infoRow.getCell(0).setCellStyle(headerStyle);

        // Datos de IPRESS
        agregarFilaInfo(sheet, rowNum++, "IPRESS:", stats.getNombreIpress());
        agregarFilaInfo(sheet, rowNum++, "Red Asistencial:", stats.getNombreRed());
        agregarFilaInfo(sheet, rowNum++, "Macrorregión:", stats.getNombreMacroregion());
        agregarFilaInfo(sheet, rowNum++, "Año:", stats.getAnio().toString());
        agregarFilaInfo(sheet, rowNum++, "Estado:", stats.getEstado());
        if (stats.getFechaEnvio() != null) {
            agregarFilaInfo(sheet, rowNum++, "Fecha de Envío:", stats.getFechaEnvio().format(FECHA_FORMATO));
        }

        rowNum++; // Espacio

        // ===== RESUMEN DE RESPUESTAS =====
        Row resRow = sheet.createRow(rowNum++);
        resRow.createCell(0).setCellValue("Resumen de Respuestas");
        resRow.getCell(0).setCellStyle(headerStyle);

        Row totalRow = sheet.createRow(rowNum++);
        totalRow.createCell(0).setCellValue("Total de Preguntas");
        totalRow.createCell(1).setCellValue(stats.getTotalPreguntas());

        Row siRow = sheet.createRow(rowNum++);
        siRow.createCell(0).setCellValue("Respuestas 'Sí'");
        siRow.createCell(1).setCellValue(stats.getPreguntasSi());

        Row noRow = sheet.createRow(rowNum++);
        noRow.createCell(0).setCellValue("Respuestas 'No'");
        noRow.createCell(1).setCellValue(stats.getPreguntasNo());

        Row porcRow = sheet.createRow(rowNum++);
        porcRow.createCell(0).setCellValue("Porcentaje de 'Sí'");
        porcRow.createCell(1).setCellValue(stats.getPorcentajeSi());
        porcRow.getCell(1).setCellStyle(crearEstiloPorcentaje(workbook));

        rowNum++; // Espacio

        // ===== TABLA RESUMEN POR SECCIÓN =====
        Row tableHeaderRow = sheet.createRow(rowNum++);
        CellStyle tableHeaderStyle = crearEstiloCelda(workbook, true, 11, COLOR_HEADER);

        String[] headers = {"Sección", "Preguntas", "% Sí", "% Cumplimiento"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = tableHeaderRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(tableHeaderStyle);
        }

        // Datos por sección
        agregarFilaResumenSeccion(sheet, rowNum++, "Infraestructura Física",
            stats.getInfraFisica().getTotalPreguntas(),
            stats.getInfraFisica().getRespuestasSi(),
            stats.getInfraFisica().getPorcentajeCumplimiento(),
            workbook);

        agregarFilaResumenSeccion(sheet, rowNum++, "Infraestructura Tecnológica",
            stats.getInfraTec().getTotalPreguntas(),
            stats.getInfraTec().getRespuestasSi(),
            stats.getInfraTec().getPorcentajeCumplimiento(),
            workbook);

        agregarFilaResumenSeccion(sheet, rowNum++, "Recursos Humanos",
            stats.getRrhh().getTotalPreguntas(),
            stats.getRrhh().getRespuestasSi(),
            stats.getRrhh().getPorcentajeSi(),
            workbook);

        agregarFilaResumenSeccion(sheet, rowNum++, "Equipamiento",
            stats.getEquipamientoResumen().getTotalEquipos(),
            stats.getEquipamientoResumen().getEquiposDisponibles(),
            stats.getEquipamientoResumen().getPorcentajeDisponibilidad(),
            workbook);

        agregarFilaResumenSeccion(sheet, rowNum++, "Servicios Telesalud",
            stats.getServicioResumen().getTotalServicios(),
            stats.getServicioResumen().getServiciosDisponibles(),
            stats.getServicioResumen().getPorcentajeDisponibilidad(),
            workbook);

        agregarFilaResumenSeccion(sheet, rowNum++, "Necesidades Identificadas",
            stats.getNecesidadResumen().getTotalNecesidades(),
            0,
            0.0,
            workbook);
    }

    private void crearHojaReporte1_RecursosHumanos(Workbook workbook, FormDiagEstadisticasDTO stats) {
        Sheet sheet = workbook.createSheet("Recursos Humanos");
        sheet.setColumnWidth(0, 4000);
        sheet.setColumnWidth(1, 3000);

        int rowNum = 0;

        // Título
        Row titleRow = sheet.createRow(rowNum++);
        titleRow.createCell(0).setCellValue("Recursos Humanos - Detalle");
        titleRow.getCell(0).setCellStyle(crearEstiloCelda(workbook, true, 12, COLOR_HEADER));

        rowNum++; // Espacio

        // Resumen
        agregarFilaInfo(sheet, rowNum++, "Total Preguntas:", stats.getRrhh().getTotalPreguntas().toString());
        agregarFilaInfo(sheet, rowNum++, "Respuestas Sí:", stats.getRrhh().getRespuestasSi().toString());
        agregarFilaInfo(sheet, rowNum++, "Respuestas No:", stats.getRrhh().getRespuestasNo().toString());
        agregarFilaInfo(sheet, rowNum++, "Porcentaje Sí:", String.format("%.1f%%", stats.getRrhh().getPorcentajeSi()));

        rowNum++; // Espacio

        // Coordinador
        agregarFilaInfo(sheet, rowNum++, "Coordinador Designado:", stats.getRrhh().getTieneCoordinador() ? "Sí" : "No");
        if (stats.getRrhh().getTieneCoordinador()) {
            agregarFilaInfo(sheet, rowNum++, "  Nombre:", stats.getRrhh().getCoordinadorNombre());
            agregarFilaInfo(sheet, rowNum++, "  Correo:", stats.getRrhh().getCoordinadorCorreo());
        }

        rowNum++; // Espacio

        // Capacitaciones
        agregarFilaInfo(sheet, rowNum++, "Capacitación en TIC:", stats.getRrhh().getTieneCapacitacionTic() ? "Sí" : "No");
        agregarFilaInfo(sheet, rowNum++, "Conoce Normativa:", stats.getRrhh().getConoceNormativa() ? "Sí" : "No");
        agregarFilaInfo(sheet, rowNum++, "Capacitaciones/Año:", stats.getRrhh().getCapacitacionesAnio().toString());
        if (stats.getRrhh().getNecesidadesCapacitacion() != null && !stats.getRrhh().getNecesidadesCapacitacion().isEmpty()) {
            agregarFilaInfo(sheet, rowNum++, "Necesidades:", stats.getRrhh().getNecesidadesCapacitacion());
        }

        rowNum++; // Espacio

        // Personal de Apoyo
        if (stats.getRrhh().getPersonalApoyoDetalle() != null && !stats.getRrhh().getPersonalApoyoDetalle().isEmpty()) {
            Row apoyoHeader = sheet.createRow(rowNum++);
            apoyoHeader.createCell(0).setCellValue("Personal de Apoyo Disponible");
            apoyoHeader.getCell(0).setCellStyle(crearEstiloCelda(workbook, true, 11, COLOR_FOOTER));

            for (FormDiagEstadisticasDTO.PersonalApoyoStats apoyo : stats.getRrhh().getPersonalApoyoDetalle()) {
                agregarFilaInfo(sheet, rowNum++, "  " + apoyo.getCategoria() + ":", apoyo.getCantidad().toString());
            }
        }
    }

    private void crearHojaReporte2_InfraestructuraFisica(Workbook workbook, FormDiagEstadisticasDTO stats) {
        Sheet sheet = workbook.createSheet("Infraestructura Física");
        sheet.setColumnWidth(0, 5000);
        sheet.setColumnWidth(1, 3000);

        int rowNum = 0;

        // Título
        Row titleRow = sheet.createRow(rowNum++);
        titleRow.createCell(0).setCellValue("Infraestructura Física - Detalle");
        titleRow.getCell(0).setCellStyle(crearEstiloCelda(workbook, true, 12, COLOR_HEADER));

        rowNum++; // Espacio

        // Resumen
        agregarFilaInfo(sheet, rowNum++, "Total Preguntas:", stats.getInfraFisica().getTotalPreguntas().toString());
        agregarFilaInfo(sheet, rowNum++, "Respuestas Sí:", stats.getInfraFisica().getRespuestasSi().toString());
        agregarFilaInfo(sheet, rowNum++, "Porcentaje Cumplimiento:",
            String.format("%.1f%%", stats.getInfraFisica().getPorcentajeCumplimiento()));

        rowNum++; // Espacio

        // Detalles de preguntas
        Row detailHeader = sheet.createRow(rowNum++);
        detailHeader.createCell(0).setCellValue("Aspecto");
        detailHeader.createCell(1).setCellValue("Disponible");
        CellStyle headerStyle = crearEstiloCelda(workbook, true, 11, COLOR_HEADER);
        detailHeader.getCell(0).setCellStyle(headerStyle);
        detailHeader.getCell(1).setCellStyle(headerStyle);

        if (stats.getInfraFisica().getDetalles() != null) {
            for (Map.Entry<String, Boolean> entry : stats.getInfraFisica().getDetalles().entrySet()) {
                Row detailRow = sheet.createRow(rowNum++);
                detailRow.createCell(0).setCellValue(entry.getKey());
                detailRow.createCell(1).setCellValue(entry.getValue() ? "Sí" : "No");
            }
        }
    }

    private void crearHojaReporte3_InfraestructuraTecnologica(Workbook workbook, FormDiagEstadisticasDTO stats) {
        Sheet sheet = workbook.createSheet("Infraestructura Tecnológica");
        sheet.setColumnWidth(0, 5000);
        sheet.setColumnWidth(1, 3000);

        int rowNum = 0;

        // Título
        Row titleRow = sheet.createRow(rowNum++);
        titleRow.createCell(0).setCellValue("Infraestructura Tecnológica - Detalle");
        titleRow.getCell(0).setCellStyle(crearEstiloCelda(workbook, true, 12, COLOR_HEADER));

        rowNum++; // Espacio

        // Resumen
        agregarFilaInfo(sheet, rowNum++, "Total Preguntas:", stats.getInfraTec().getTotalPreguntas().toString());
        agregarFilaInfo(sheet, rowNum++, "Respuestas Sí:", stats.getInfraTec().getRespuestasSi().toString());
        agregarFilaInfo(sheet, rowNum++, "Porcentaje Cumplimiento:",
            String.format("%.1f%%", stats.getInfraTec().getPorcentajeCumplimiento()));

        rowNum++; // Espacio

        // Detalles
        Row detailHeader = sheet.createRow(rowNum++);
        detailHeader.createCell(0).setCellValue("Componente");
        detailHeader.createCell(1).setCellValue("Estado");
        CellStyle headerStyle = crearEstiloCelda(workbook, true, 11, COLOR_HEADER);
        detailHeader.getCell(0).setCellStyle(headerStyle);
        detailHeader.getCell(1).setCellStyle(headerStyle);

        if (stats.getInfraTec().getDetalles() != null) {
            for (Map.Entry<String, Boolean> entry : stats.getInfraTec().getDetalles().entrySet()) {
                Row detailRow = sheet.createRow(rowNum++);
                detailRow.createCell(0).setCellValue(entry.getKey());
                detailRow.createCell(1).setCellValue(entry.getValue() ? "Disponible" : "No disponible");
            }
        }
    }

    private void crearHojaReporte4_Conectividad(Workbook workbook, FormDiagEstadisticasDTO stats) {
        Sheet sheet = workbook.createSheet("Conectividad");
        sheet.setColumnWidth(0, 4000);
        sheet.setColumnWidth(1, 3000);

        int rowNum = 0;

        // Título
        Row titleRow = sheet.createRow(rowNum++);
        titleRow.createCell(0).setCellValue("Conectividad - Detalle");
        titleRow.getCell(0).setCellStyle(crearEstiloCelda(workbook, true, 12, COLOR_HEADER));

        rowNum++; // Espacio

        // Internet
        agregarFilaInfo(sheet, rowNum++, "Acceso a Internet:", stats.getConectividad().getTieneInternet() ? "Sí" : "No");
        agregarFilaInfo(sheet, rowNum++, "Conexión Estable:", stats.getConectividad().getEsEstable() ? "Sí" : "No");
        agregarFilaInfo(sheet, rowNum++, "Tipo de Conexión:", stats.getConectividad().getTipoConexion() != null ? stats.getConectividad().getTipoConexion() : "N/A");
        agregarFilaInfo(sheet, rowNum++, "Proveedor:", stats.getConectividad().getProveedor() != null ? stats.getConectividad().getProveedor() : "N/A");
        agregarFilaInfo(sheet, rowNum++, "Velocidad Contratada (Mbps):", stats.getConectividad().getVelocidadContratada().toString());
        agregarFilaInfo(sheet, rowNum++, "Velocidad Real (Mbps):", stats.getConectividad().getVelocidadReal().toString());

        rowNum++; // Espacio

        // Infraestructura
        agregarFilaInfo(sheet, rowNum++, "Puntos de Red:", stats.getConectividad().getNumPuntosRed().toString());
        agregarFilaInfo(sheet, rowNum++, "WiFi Disponible:", stats.getConectividad().getTieneWifi() ? "Sí" : "No");
        agregarFilaInfo(sheet, rowNum++, "Energía Alternativa:", stats.getConectividad().getTieneEnergyAlt() ? "Sí" : "No");

        rowNum++; // Espacio

        // Sistemas
        Row sistemaHeader = sheet.createRow(rowNum++);
        sistemaHeader.createCell(0).setCellValue("Sistemas Disponibles");
        sistemaHeader.getCell(0).setCellStyle(crearEstiloCelda(workbook, true, 11, COLOR_HEADER));

        if (stats.getConectividad().getSistemas() != null) {
            for (FormDiagEstadisticasDTO.SistemaDisponible sistema : stats.getConectividad().getSistemas()) {
                agregarFilaInfo(sheet, rowNum++, "  " + sistema.getNombre() + ":", sistema.getDisponible() ? "Sí" : "No");
            }
        }
    }

    private void crearHojaReporte5_Equipamiento(Workbook workbook, FormDiagEstadisticasDTO stats) {
        Sheet sheet = workbook.createSheet("Equipamiento");
        sheet.setColumnWidth(0, 3000);
        sheet.setColumnWidth(1, 2500);
        sheet.setColumnWidth(2, 2000);
        sheet.setColumnWidth(3, 2000);
        sheet.setColumnWidth(4, 3000);

        int rowNum = 0;

        // Título
        Row titleRow = sheet.createRow(rowNum++);
        titleRow.createCell(0).setCellValue("Equipamiento - Detalle");
        titleRow.getCell(0).setCellStyle(crearEstiloCelda(workbook, true, 12, COLOR_HEADER));

        rowNum++; // Espacio

        // Resumen
        agregarFilaInfo(sheet, rowNum++, "Total Equipos:", stats.getEquipamientoResumen().getTotalEquipos().toString());
        agregarFilaInfo(sheet, rowNum++, "Disponibles:", stats.getEquipamientoResumen().getEquiposDisponibles().toString());
        agregarFilaInfo(sheet, rowNum++, "No Disponibles:", stats.getEquipamientoResumen().getEquiposNoDisponibles().toString());
        agregarFilaInfo(sheet, rowNum++, "Porcentaje Disponibilidad:",
            String.format("%.1f%%", stats.getEquipamientoResumen().getPorcentajeDisponibilidad()));

        rowNum += 2; // Espacio

        // Tabla de equipos
        Row tableHeader = sheet.createRow(rowNum++);
        String[] headers = {"Equipo", "Tipo", "Disponible", "Cantidad", "Estado"};
        CellStyle headerStyle = crearEstiloCelda(workbook, true, 11, COLOR_HEADER);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = tableHeader.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Equipamiento Informático
        List<FormDiagEstadisticasDTO.EquipamientoStats> allEquipos = new ArrayList<>();
        if (stats.getEquipamientoInformatico() != null) {
            allEquipos.addAll(stats.getEquipamientoInformatico());
        }
        if (stats.getEquipamientoBiomedico() != null) {
            allEquipos.addAll(stats.getEquipamientoBiomedico());
        }

        for (FormDiagEstadisticasDTO.EquipamientoStats equipo : allEquipos) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(equipo.getNombreEquipamiento());
            row.createCell(1).setCellValue(equipo.getTipoEquipamiento() != null ? equipo.getTipoEquipamiento() : "");
            row.createCell(2).setCellValue(equipo.getDisponible() ? "Sí" : "No");
            row.createCell(3).setCellValue(equipo.getCantidad());
            row.createCell(4).setCellValue(equipo.getEstado() != null ? equipo.getEstado() : "");
        }
    }

    private void crearHojaReporte6_Servicios(Workbook workbook, FormDiagEstadisticasDTO stats) {
        Sheet sheet = workbook.createSheet("Servicios Telesalud");
        sheet.setColumnWidth(0, 4000);
        sheet.setColumnWidth(1, 2000);

        int rowNum = 0;

        // Título
        Row titleRow = sheet.createRow(rowNum++);
        titleRow.createCell(0).setCellValue("Servicios de Telesalud - Detalle");
        titleRow.getCell(0).setCellStyle(crearEstiloCelda(workbook, true, 12, COLOR_HEADER));

        rowNum++; // Espacio

        // Resumen
        agregarFilaInfo(sheet, rowNum++, "Total Servicios:", stats.getServicioResumen().getTotalServicios().toString());
        agregarFilaInfo(sheet, rowNum++, "Disponibles:", stats.getServicioResumen().getServiciosDisponibles().toString());
        agregarFilaInfo(sheet, rowNum++, "No Disponibles:", stats.getServicioResumen().getServiciosNoDisponibles().toString());
        agregarFilaInfo(sheet, rowNum++, "Porcentaje Disponibilidad:",
            String.format("%.1f%%", stats.getServicioResumen().getPorcentajeDisponibilidad()));

        rowNum++; // Espacio

        // Tabla de servicios
        Row tableHeader = sheet.createRow(rowNum++);
        tableHeader.createCell(0).setCellValue("Servicio");
        tableHeader.createCell(1).setCellValue("Disponible");
        CellStyle headerStyle = crearEstiloCelda(workbook, true, 11, COLOR_HEADER);
        tableHeader.getCell(0).setCellStyle(headerStyle);
        tableHeader.getCell(1).setCellStyle(headerStyle);

        if (stats.getServicios() != null) {
            for (FormDiagEstadisticasDTO.ServicioStats servicio : stats.getServicios()) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(servicio.getNombreServicio());
                row.createCell(1).setCellValue(servicio.getDisponible() ? "Sí" : "No");
            }
        }
    }

    private void crearHojaReporte7_Necesidades(Workbook workbook, FormDiagEstadisticasDTO stats) {
        Sheet sheet = workbook.createSheet("Necesidades");
        sheet.setColumnWidth(0, 4000);
        sheet.setColumnWidth(1, 3000);
        sheet.setColumnWidth(2, 2500);
        sheet.setColumnWidth(3, 2000);

        int rowNum = 0;

        // Título
        Row titleRow = sheet.createRow(rowNum++);
        titleRow.createCell(0).setCellValue("Necesidades Identificadas - Detalle");
        titleRow.getCell(0).setCellStyle(crearEstiloCelda(workbook, true, 12, COLOR_HEADER));

        rowNum++; // Espacio

        // Resumen
        agregarFilaInfo(sheet, rowNum++, "Total Necesidades:", stats.getNecesidadResumen().getTotalNecesidades().toString());
        agregarFilaInfo(sheet, rowNum++, "Prioridad Alta:", stats.getNecesidadResumen().getNecesidadesAlta().toString());
        agregarFilaInfo(sheet, rowNum++, "Prioridad Media:", stats.getNecesidadResumen().getNecesidadesMedia().toString());
        agregarFilaInfo(sheet, rowNum++, "Prioridad Baja:", stats.getNecesidadResumen().getNecesidadesBaja().toString());

        rowNum++; // Espacio

        // Tabla de necesidades
        Row tableHeader = sheet.createRow(rowNum++);
        String[] headers = {"Descripción", "Categoría", "Cantidad Requerida", "Prioridad"};
        CellStyle headerStyle = crearEstiloCelda(workbook, true, 11, COLOR_HEADER);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = tableHeader.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        if (stats.getNecesidades() != null) {
            for (FormDiagEstadisticasDTO.NecesidadStats necesidad : stats.getNecesidades()) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(necesidad.getDescripcion());
                row.createCell(1).setCellValue(necesidad.getCategoria());
                row.createCell(2).setCellValue(necesidad.getCantidadRequerida());
                row.createCell(3).setCellValue(necesidad.getPrioridad());
            }
        }
    }

    // ==================== MÉTODOS AUXILIARES ====================

    private void agregarFilaInfo(Sheet sheet, int rowNum, String label, String valor) {
        Row row = sheet.createRow(rowNum);
        Cell labelCell = row.createCell(0);
        Cell valorCell = row.createCell(1);
        labelCell.setCellValue(label);
        valorCell.setCellValue(valor);
    }

    private void agregarFilaResumenSeccion(Sheet sheet, int rowNum, String seccion, Integer preguntas,
                                           Integer respuestasSi, Double porcentaje, Workbook workbook) {
        Row row = sheet.createRow(rowNum);
        row.createCell(0).setCellValue(seccion);
        row.createCell(1).setCellValue(preguntas);
        row.createCell(2).setCellValue(respuestasSi);

        Cell porcCell = row.createCell(3);
        porcCell.setCellValue(porcentaje);
        porcCell.setCellStyle(crearEstiloPorcentaje(workbook));
    }

    private CellStyle crearEstiloCelda(Workbook workbook, boolean bold, int fontSize, short bgColor) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(bold);
        font.setFontHeightInPoints((short) fontSize);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(bgColor);
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    private CellStyle crearEstiloPorcentaje(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setDataFormat(workbook.createDataFormat().getFormat("0.0\"%\""));
        return style;
    }
}
