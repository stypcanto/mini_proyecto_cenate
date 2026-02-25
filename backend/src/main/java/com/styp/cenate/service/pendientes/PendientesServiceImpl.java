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
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PendientesServiceImpl implements PendientesService {

    private final ConsolidadoPendientesMensualRepository consolidadoRepo;
    private final DetallePendientesMensualRepository detalleRepo;

    @Override
    public Page<ConsolidadoPendientesDTO> obtenerConsolidado(
            String servicio,
            String subactividad,
            LocalDate fechaDesde,
            LocalDate fechaHasta,
            Pageable pageable) {

        log.info("Buscando consolidado - servicio={}, subactividad={}, fechaDesde={}, fechaHasta={}",
                servicio, subactividad, fechaDesde, fechaHasta);

        Page<ConsolidadoPendientesMensual> page = consolidadoRepo.buscarConFiltros(
                servicio, subactividad, fechaDesde, fechaHasta, pageable
        );

        return page.map(this::toConsolidadoDTO);
    }

    @Override
    public Page<DetallePendientesDTO> obtenerDetalle(
            String servicio,
            String subactividad,
            String busqueda,
            LocalDate fechaDesde,
            LocalDate fechaHasta,
            Pageable pageable) {

        log.info("Buscando detalle - servicio={}, subactividad={}, busqueda={}", servicio, subactividad, busqueda);

        Page<DetallePendientesMensual> page = detalleRepo.buscarConFiltros(
                servicio, subactividad, busqueda, fechaDesde, fechaHasta, pageable
        );

        return page.map(this::toDetalleDTO);
    }

    @Override
    public List<DetallePendientesDTO> obtenerDetallePorMedico(String dniMedico) {
        log.info("Buscando detalle por médico - dniMedico={}", dniMedico);
        return detalleRepo.findByDniMedico(dniMedico)
                .stream()
                .map(this::toDetalleDTO)
                .collect(Collectors.toList());
    }

    @Override
    public PendientesResumenDTO obtenerKpis() {
        log.info("Calculando KPIs globales de pendientes mensuales");

        Long totalMedicos = consolidadoRepo.countDistinctMedicos();
        Long totalPacientes = detalleRepo.countDistinctPacientes();
        Long totalAbandonos = consolidadoRepo.sumTotalAbandonos();

        List<Object[]> rawSubactividad = consolidadoRepo.resumenPorSubactividad();
        List<PendientesResumenDTO.SubactividadResumenDTO> porSubactividad = rawSubactividad.stream()
                .map(row -> PendientesResumenDTO.SubactividadResumenDTO.builder()
                        .subactividad(row[0] != null ? row[0].toString() : "")
                        .medicos(row[1] != null ? ((Number) row[1]).longValue() : 0L)
                        .abandonos(row[2] != null ? ((Number) row[2]).longValue() : 0L)
                        .build())
                .collect(Collectors.toList());

        Pageable top10 = PageRequest.of(0, 10);
        List<Object[]> rawServicios = consolidadoRepo.resumenPorServicio(top10);
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
                .build();
    }
}
