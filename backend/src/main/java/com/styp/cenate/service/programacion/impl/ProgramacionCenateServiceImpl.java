package com.styp.cenate.service.programacion.impl;

import com.styp.cenate.dto.ProgramacionCenateResumenDTO;
import com.styp.cenate.dto.ProgramacionCenateResumenDTO.*;
import com.styp.cenate.model.PeriodoSolicitudTurno;
import com.styp.cenate.model.SolicitudTurnoIpress;
import com.styp.cenate.repository.DetalleSolicitudTurnoRepository;
import com.styp.cenate.repository.PeriodoSolicitudTurnoRepository;
import com.styp.cenate.repository.SolicitudTurnoIpressRepository;
import com.styp.cenate.service.programacion.ProgramacionCenateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementacion del servicio de Programacion CENATE.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ProgramacionCenateServiceImpl implements ProgramacionCenateService {

    private final PeriodoSolicitudTurnoRepository periodoRepository;
    private final SolicitudTurnoIpressRepository solicitudRepository;
    private final DetalleSolicitudTurnoRepository detalleRepository;

    @Override
    public List<ProgramacionCenateResumenDTO> obtenerResumenGeneral() {
        log.info("Obteniendo resumen general de programacion");

        List<PeriodoSolicitudTurno> periodos = periodoRepository.findAllByOrderByPeriodoDesc();

        return periodos.stream()
                .map(this::crearResumenBasico)
                .collect(Collectors.toList());
    }

    @Override
    public ProgramacionCenateResumenDTO obtenerResumenPorPeriodo(Long idPeriodo) {
        log.info("Obteniendo resumen del periodo: {}", idPeriodo);

        PeriodoSolicitudTurno periodo = periodoRepository.findById(idPeriodo)
                .orElseThrow(() -> new RuntimeException("Periodo no encontrado con ID: " + idPeriodo));

        ProgramacionCenateResumenDTO resumen = crearResumenBasico(periodo);

        // Agregar estadisticas detalladas
        resumen.setTotalTurnosSolicitados(detalleRepository.sumTotalTurnosByPeriodo(idPeriodo));
        resumen.setEspecialidadesSolicitadas(detalleRepository.countEspecialidadesDistintasByPeriodo(idPeriodo));

        // Resumen por especialidad
        List<ResumenEspecialidad> resumenEspecialidades = new ArrayList<>();
        List<Object[]> turnosPorEspecialidad = detalleRepository.sumTurnosByEspecialidadAndPeriodo(idPeriodo);
        for (Object[] row : turnosPorEspecialidad) {
            resumenEspecialidades.add(ResumenEspecialidad.builder()
                    .idServicio((Long) row[0])
                    .nombreEspecialidad((String) row[1])
                    .totalTurnos(((Number) row[2]).longValue())
                    .build());
        }
        resumen.setResumenPorEspecialidad(resumenEspecialidades);

        // Resumen por Red
        List<ResumenRed> resumenRedes = new ArrayList<>();
        List<Object[]> turnosPorRed = detalleRepository.sumTurnosByRedAndPeriodo(idPeriodo);
        for (Object[] row : turnosPorRed) {
            resumenRedes.add(ResumenRed.builder()
                    .idRed((Long) row[0])
                    .nombreRed((String) row[1])
                    .totalTurnos(((Number) row[2]).longValue())
                    .build());
        }
        resumen.setResumenPorRed(resumenRedes);

        // Resumen por IPRESS
        List<ResumenIpress> resumenIpress = new ArrayList<>();
        List<SolicitudTurnoIpress> solicitudes = solicitudRepository.findByPeriodoWithIpress(idPeriodo);
        for (SolicitudTurnoIpress sol : solicitudes) {
            if (sol.getPersonal() != null && sol.getPersonal().getIpress() != null) {
                var ipress = sol.getPersonal().getIpress();
                // Calcular total turnos de esta solicitud
                long totalTurnos = sol.getDetalles().stream()
                        .mapToLong(d -> d.getTurnosSolicitados() != null ? d.getTurnosSolicitados() : 0)
                        .sum();

                resumenIpress.add(ResumenIpress.builder()
                        .idIpress(ipress.getIdIpress())
                        .codIpress(ipress.getCodIpress())
                        .nombreIpress(ipress.getDescIpress())
                        .nombreRed(ipress.getRed() != null ? ipress.getRed().getDescripcion() : null)
                        .totalTurnos(totalTurnos)
                        .estado(sol.getEstado())
                        .build());
            }
        }
        resumen.setResumenPorIpress(resumenIpress);

        return resumen;
    }

    @Override
    public String exportarCsv(Long idPeriodo) {
        log.info("Exportando datos del periodo {} a CSV", idPeriodo);

        ProgramacionCenateResumenDTO resumen = obtenerResumenPorPeriodo(idPeriodo);

        StringBuilder csv = new StringBuilder();

        // Encabezado
        csv.append("RESUMEN DE SOLICITUDES DE TURNOS - PERIODO ").append(resumen.getPeriodo()).append("\n");
        csv.append("Descripcion:,").append(resumen.getDescripcion()).append("\n");
        csv.append("Estado:,").append(resumen.getEstado()).append("\n");
        csv.append("Total Solicitudes:,").append(resumen.getTotalSolicitudes()).append("\n");
        csv.append("Solicitudes Enviadas:,").append(resumen.getSolicitudesEnviadas()).append("\n");
        csv.append("IPRESS Respondieron:,").append(resumen.getIpressRespondieron()).append("\n");
        csv.append("Total Turnos Solicitados:,").append(resumen.getTotalTurnosSolicitados()).append("\n");
        csv.append("\n");

        // Detalle por Especialidad
        csv.append("DETALLE POR ESPECIALIDAD\n");
        csv.append("ID Servicio,Especialidad,Total Turnos\n");
        if (resumen.getResumenPorEspecialidad() != null) {
            for (ResumenEspecialidad esp : resumen.getResumenPorEspecialidad()) {
                csv.append(esp.getIdServicio()).append(",");
                csv.append("\"").append(esp.getNombreEspecialidad()).append("\",");
                csv.append(esp.getTotalTurnos()).append("\n");
            }
        }
        csv.append("\n");

        // Detalle por Red
        csv.append("DETALLE POR RED\n");
        csv.append("ID Red,Red,Total Turnos\n");
        if (resumen.getResumenPorRed() != null) {
            for (ResumenRed red : resumen.getResumenPorRed()) {
                csv.append(red.getIdRed()).append(",");
                csv.append("\"").append(red.getNombreRed()).append("\",");
                csv.append(red.getTotalTurnos()).append("\n");
            }
        }
        csv.append("\n");

        // Detalle por IPRESS
        csv.append("DETALLE POR IPRESS\n");
        csv.append("ID IPRESS,Codigo,IPRESS,Red,Total Turnos,Estado\n");
        if (resumen.getResumenPorIpress() != null) {
            for (ResumenIpress ipr : resumen.getResumenPorIpress()) {
                csv.append(ipr.getIdIpress()).append(",");
                csv.append(ipr.getCodIpress()).append(",");
                csv.append("\"").append(ipr.getNombreIpress()).append("\",");
                csv.append("\"").append(ipr.getNombreRed() != null ? ipr.getNombreRed() : "").append("\",");
                csv.append(ipr.getTotalTurnos()).append(",");
                csv.append(ipr.getEstado()).append("\n");
            }
        }

        return csv.toString();
    }

    // ========================================
    // Metodos privados auxiliares
    // ========================================

    private ProgramacionCenateResumenDTO crearResumenBasico(PeriodoSolicitudTurno periodo) {
        Long idPeriodo = periodo.getIdPeriodo();

        return ProgramacionCenateResumenDTO.builder()
                .idPeriodo(idPeriodo)
                .periodo(periodo.getPeriodo())
                .descripcion(periodo.getDescripcion())
                .estado(periodo.getEstado())
                .totalSolicitudes(periodoRepository.countSolicitudesByPeriodo(idPeriodo))
                .solicitudesEnviadas(periodoRepository.countSolicitudesEnviadasByPeriodo(idPeriodo))
                .ipressRespondieron(solicitudRepository.countIpressDistintasByPeriodo(idPeriodo))
                .build();
    }
}
