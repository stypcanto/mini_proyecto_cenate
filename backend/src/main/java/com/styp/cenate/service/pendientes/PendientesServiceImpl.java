package com.styp.cenate.service.pendientes;

import com.styp.cenate.dto.pendientes.ConsolidadoPendientesDTO;
import com.styp.cenate.dto.pendientes.DetallePendientesDTO;
import com.styp.cenate.dto.pendientes.PendientesResumenDTO;
import com.styp.cenate.model.ConsolidadoPendientesMensual;
import com.styp.cenate.model.DetallePendientesMensual;
import com.styp.cenate.repository.pendientes.ConsolidadoPendientesMensualRepository;
import com.styp.cenate.repository.pendientes.DetallePendientesMensualRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PendientesServiceImpl implements PendientesService {

    private static final String TURNO_DEFAULT = "MAÑANA";

    private final ConsolidadoPendientesMensualRepository consolidadoRepo;
    private final DetallePendientesMensualRepository detalleRepo;

    private String normalizarTurno(String turno) {
        return (turno != null && !turno.isBlank()) ? turno.toUpperCase() : TURNO_DEFAULT;
    }

    @Override
    public Page<ConsolidadoPendientesDTO> obtenerConsolidado(
            String turno,
            String servicio,
            String subactividad,
            LocalDate fechaDesde,
            LocalDate fechaHasta,
            Pageable pageable) {

        String t = normalizarTurno(turno);
        log.info("Buscando consolidado - turno={}, servicio={}, subactividad={}", t, servicio, subactividad);

        Page<ConsolidadoPendientesMensual> page = consolidadoRepo.buscarConFiltros(
                t, servicio, subactividad, fechaDesde, fechaHasta, pageable
        );

        return page.map(this::toConsolidadoDTO);
    }

    @Override
    public Page<DetallePendientesDTO> obtenerDetalle(
            String turno,
            String servicio,
            String subactividad,
            String busqueda,
            LocalDate fechaDesde,
            LocalDate fechaHasta,
            Pageable pageable) {

        String t = normalizarTurno(turno);
        log.info("Buscando detalle - turno={}, servicio={}, subactividad={}, busqueda={}", t, servicio, subactividad, busqueda);

        Page<DetallePendientesMensual> page = detalleRepo.buscarConFiltros(
                t, servicio, subactividad, busqueda, fechaDesde, fechaHasta, pageable
        );

        return page.map(this::toDetalleDTO);
    }

    @Override
    public List<DetallePendientesDTO> obtenerDetallePorMedico(String dniMedico, String turno) {
        String t = normalizarTurno(turno);
        log.info("Buscando detalle por médico - dniMedico={}, turno={}", dniMedico, t);
        return detalleRepo.findByDniMedicoAndTurno(dniMedico, t)
                .stream()
                .map(this::toDetalleDTO)
                .collect(Collectors.toList());
    }

    @Override
    public PendientesResumenDTO obtenerKpis(String turno) {
        String t = normalizarTurno(turno);
        log.info("Calculando KPIs globales - turno={}", t);

        Long totalMedicos   = consolidadoRepo.countDistinctMedicos(t);
        Long totalPacientes = detalleRepo.countDistinctPacientes(t);
        Long totalAbandonos = consolidadoRepo.sumTotalAbandonos(t);

        List<Object[]> rawSubactividad = consolidadoRepo.resumenPorSubactividad(t);
        List<PendientesResumenDTO.SubactividadResumenDTO> porSubactividad = rawSubactividad.stream()
                .map(row -> PendientesResumenDTO.SubactividadResumenDTO.builder()
                        .subactividad(row[0] != null ? row[0].toString() : "")
                        .medicos(row[1] != null ? ((Number) row[1]).longValue() : 0L)
                        .abandonos(row[2] != null ? ((Number) row[2]).longValue() : 0L)
                        .build())
                .collect(Collectors.toList());

        Pageable top10 = PageRequest.of(0, 10);
        List<Object[]> rawServicios = consolidadoRepo.resumenPorServicio(t, top10);
        List<PendientesResumenDTO.ServicioResumenDTO> topServicios = rawServicios.stream()
                .map(row -> PendientesResumenDTO.ServicioResumenDTO.builder()
                        .servicio(row[0] != null ? row[0].toString() : "")
                        .medicos(row[1] != null ? ((Number) row[1]).longValue() : 0L)
                        .abandonos(row[2] != null ? ((Number) row[2]).longValue() : 0L)
                        .build())
                .collect(Collectors.toList());

        return PendientesResumenDTO.builder()
                .totalMedicos(totalMedicos != null ? totalMedicos : 0L)
                .totalPacientes(totalPacientes != null ? totalPacientes : 0L)
                .totalAbandonos(totalAbandonos != null ? totalAbandonos : 0L)
                .porSubactividad(porSubactividad)
                .topServiciosPorAbandonos(topServicios)
                .build();
    }

    @Override
    public List<Map<String, Object>> obtenerCalendario(String turno) {
        String t = normalizarTurno(turno);
        log.info("📅 Calculando conteos por fecha - turno={}", t);
        return detalleRepo.countPorFecha(t).stream().map(row -> {
            Map<String, Object> m = new HashMap<>();
            m.put("fecha", row[0] != null ? row[0].toString() : "");
            m.put("count", row[1] != null ? ((Number) row[1]).longValue() : 0L);
            return m;
        }).collect(Collectors.toList());
    }

    // ── Mappers ──────────────────────────────────────────────────────────────

    private ConsolidadoPendientesDTO toConsolidadoDTO(ConsolidadoPendientesMensual e) {
        return ConsolidadoPendientesDTO.builder()
                .idConsPend(e.getIdConsPend())
                .dniMedico(e.getDniMedico())
                .profesional(e.getProfesional())
                .fechaCita(e.getFechaCita())
                .subactividad(e.getSubactividad())
                .servicio(e.getServicio())
                .abandono(e.getAbandono())
                .build();
    }

    private DetallePendientesDTO toDetalleDTO(DetallePendientesMensual e) {
        return DetallePendientesDTO.builder()
                .idDetPend(e.getIdDetPend())
                .dniMedico(e.getDniMedico())
                .profesional(e.getProfesional())
                .fechaCita(e.getFechaCita())
                .subactividad(e.getSubactividad())
                .servicio(e.getServicio())
                .docPaciente(e.getDocPaciente())
                .paciente(e.getPaciente())
                .abandono(e.getAbandono())
                .horaCita(e.getHoraCita())
                .build();
    }
}
