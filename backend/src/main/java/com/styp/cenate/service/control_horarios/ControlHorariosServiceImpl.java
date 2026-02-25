package com.styp.cenate.service.control_horarios;

import com.styp.cenate.dto.control_horarios.CtrHorarioDTO;
import com.styp.cenate.dto.control_horarios.CreateCtrHorarioRequest;
import com.styp.cenate.dto.control_horarios.PeriodoDisponibleDTO;
import com.styp.cenate.model.CtrHorario;
import com.styp.cenate.repository.CtrHorarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementación de servicio para control de horarios
 * v1.79.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ControlHorariosServiceImpl implements ControlHorariosService {

    private final CtrHorarioRepository ctrHorarioRepository;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public List<PeriodoDisponibleDTO> obtenerPeriodosDisponibles(List<String> estados) {
        log.info("📋 Obteniendo períodos disponibles con estados: {}", estados);

        try {
            // Query para obtener períodos de ctr_periodo con sus estados
            String estadosSQL = estados.stream()
                    .map(e -> "'" + e + "'")
                    .collect(Collectors.joining(","));

            String sql = "SELECT DISTINCT cp.periodo, cp.id_area, da.desc_area, cp.estado, " +
                    "cp.fecha_inicio, cp.fecha_fin, " +
                    "COUNT(DISTINCT ch.id_ctr_horario) as total_horarios " +
                    "FROM public.ctr_periodo cp " +
                    "JOIN public.dim_area da ON cp.id_area = da.id_area " +
                    "LEFT JOIN public.ctr_horario ch ON cp.periodo = ch.periodo AND cp.id_area = ch.id_area " +
                    "WHERE cp.estado IN (" + estadosSQL + ") " +
                    "GROUP BY cp.periodo, cp.id_area, da.desc_area, cp.estado, cp.fecha_inicio, cp.fecha_fin " +
                    "ORDER BY cp.periodo DESC, cp.id_area";

            return jdbcTemplate.query(sql, (rs, rowNum) ->
                    PeriodoDisponibleDTO.builder()
                            .periodo(rs.getString("periodo"))
                            .idArea(rs.getLong("id_area"))
                            .descArea(rs.getString("desc_area"))
                            .estado(rs.getString("estado"))
                            .totalHorarios(rs.getInt("total_horarios"))
                            .fechaInicio(rs.getObject("fecha_inicio", java.time.LocalDate.class))
                            .fechaFin(rs.getObject("fecha_fin", java.time.LocalDate.class))
                            .build()
            );

        } catch (Exception e) {
            log.error("❌ Error obteniendo períodos disponibles: {}", e.getMessage());
            return List.of();
        }
    }

    @Override
    public List<CtrHorarioDTO> obtenerHorariosPorPeriodo(String periodo) {
        log.info("🕐 Obteniendo horarios para período: {}", periodo);

        try {
            String sql = """
                SELECT
                    ch.id_ctr_horario,
                    ch.periodo,
                    ch.id_area,
                    da.desc_area,
                    ch.id_grupo_prog,
                    ch.id_pers,
                    COALESCE(dpc.nom_pers, '') as nom_pers,
                    ch.id_reg_lab,
                    drl.desc_reg_lab,
                    ch.id_servicio,
                    COALESCE(dse.desc_servicio, '') as desc_servicio,
                    ch.turnos_totales,
                    ch.turnos_validos,
                    ch.horas_totales,
                    ch.observaciones,
                    ch.created_at,
                    ch.updated_at
                FROM public.ctr_horario ch
                LEFT JOIN public.dim_area da ON ch.id_area = da.id_area
                LEFT JOIN public.dim_personal_cnt dpc ON ch.id_pers = dpc.id_pers
                LEFT JOIN public.dim_regimen_laboral drl ON ch.id_reg_lab = drl.id_reg_lab
                LEFT JOIN public.dim_servicio_essi dse ON ch.id_servicio = dse.id_servicio
                WHERE ch.periodo = ?
                ORDER BY dpc.nom_pers
            """;

            return jdbcTemplate.query(sql, new Object[]{periodo}, (rs, rowNum) ->
                    CtrHorarioDTO.builder()
                            .idCtrHorario(rs.getLong("id_ctr_horario"))
                            .periodo(rs.getString("periodo"))
                            .idArea(rs.getLong("id_area"))
                            .descArea(rs.getString("desc_area"))
                            .idGrupoProg(rs.getLong("id_grupo_prog"))
                            .idPers(rs.getLong("id_pers"))
                            .nomPers(rs.getString("nom_pers"))
                            .idRegLab(rs.getLong("id_reg_lab"))
                            .descRegLab(rs.getString("desc_reg_lab"))
                            .idServicio(rs.getLong("id_servicio"))
                            .descServicio(rs.getString("desc_servicio"))
                            .turnosTotales(rs.getInt("turnos_totales"))
                            .turnosValidos(rs.getInt("turnos_validos"))
                            .horasTotales(rs.getBigDecimal("horas_totales"))
                            .observaciones(rs.getString("observaciones"))
                            .createdAt(rs.getTimestamp("created_at").toLocalDateTime())
                            .updatedAt(rs.getTimestamp("updated_at").toLocalDateTime())
                            .build()
            );

        } catch (Exception e) {
            log.error("❌ Error obteniendo horarios para período {}: {}", periodo, e.getMessage());
            return List.of();
        }
    }

    @Override
    @Transactional
    public CtrHorarioDTO crearSolicitud(CreateCtrHorarioRequest request) {
        log.info("➕ Creando nueva solicitud de horario para periodo: {}, médico: {}", request.getPeriodo(), request.getIdPers());

        try {
            // Usar SQL INSERT directo para crear el registro
            String sql = """
                INSERT INTO public.ctr_horario (
                    periodo, id_area, id_grupo_prog, id_pers, id_reg_lab, id_servicio,
                    turnos_totales, turnos_validos, horas_totales, observaciones, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                RETURNING id_ctr_horario
            """;

            String insertSql = """
                INSERT INTO public.ctr_horario (
                    periodo, id_area, id_grupo_prog, id_pers, id_reg_lab, id_servicio,
                    turnos_totales, turnos_validos, horas_totales, observaciones, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """;

            // Para PostgreSQL sin RETURNING, ejecutar insert separado
            jdbcTemplate.update(insertSql,
                    request.getPeriodo(),
                    request.getIdArea(),
                    request.getIdGrupoProg(),
                    request.getIdPers(),
                    request.getIdRegLab(),
                    request.getIdServicio(),
                    request.getTurnosTotales() != null ? request.getTurnosTotales() : 0,
                    0, // turnos_validos inicial = 0
                    request.getHorasTotales(),
                    request.getObservaciones()
            );

            // Obtener el registro creado
            return obtenerHorariosPorPeriodo(request.getPeriodo()).stream()
                    .filter(h -> h.getIdPers().equals(request.getIdPers()) && 
                               h.getPeriodo().equals(request.getPeriodo()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("No se pudo recuperar la solicitud creada"));

        } catch (Exception e) {
            log.error("❌ Error creando solicitud: {}", e.getMessage());
            throw new RuntimeException("Error al crear solicitud de horario", e);
        }
    }

    @Override
    @Transactional
    public CtrHorarioDTO actualizarSolicitud(Long idCtrHorario, CreateCtrHorarioRequest request) {
        log.info("✏️ Actualizando solicitud: {}", idCtrHorario);

        try {
            CtrHorario horario = ctrHorarioRepository.findById(idCtrHorario)
                    .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));

            horario.setTurnosTotales(request.getTurnosTotales());
            horario.setHorasTotales(request.getHorasTotales());
            horario.setObservaciones(request.getObservaciones());

            CtrHorario updated = ctrHorarioRepository.save(horario);
            log.info("✅ Solicitud actualizada: {}", idCtrHorario);

            return convertToDTO(updated);

        } catch (Exception e) {
            log.error("❌ Error actualizando solicitud: {}", e.getMessage());
            throw new RuntimeException("Error al actualizar solicitud", e);
        }
    }

    @Override
    public CtrHorarioDTO obtenerDetalle(Long idCtrHorario) {
        log.info("🔍 Obteniendo detalle de solicitud: {}", idCtrHorario);

        try {
            String sql = """
                SELECT
                    ch.id_ctr_horario,
                    ch.periodo,
                    ch.id_area,
                    da.desc_area,
                    ch.id_grupo_prog,
                    ch.id_pers,
                    dpc.nom_pers,
                    ch.id_reg_lab,
                    drl.desc_reg_lab,
                    ch.id_servicio,
                    COALESCE(dse.desc_servicio, '') as desc_servicio,
                    ch.turnos_totales,
                    ch.turnos_validos,
                    ch.horas_totales,
                    ch.observaciones,
                    ch.estado,
                    ch.created_at,
                    ch.updated_at
                FROM public.ctr_horario ch
                LEFT JOIN public.dim_area da ON ch.id_area = da.id_area
                LEFT JOIN public.dim_personal_cnt dpc ON ch.id_pers = dpc.id_pers
                LEFT JOIN public.dim_regimen_laboral drl ON ch.id_reg_lab = drl.id_reg_lab
                LEFT JOIN public.dim_servicio_essi dse ON ch.id_servicio = dse.id_servicio
                WHERE ch.id_ctr_horario = ?
            """;

            List<CtrHorarioDTO> results = jdbcTemplate.query(sql, new Object[]{idCtrHorario}, (rs, rowNum) ->
                    CtrHorarioDTO.builder()
                            .idCtrHorario(rs.getLong("id_ctr_horario"))
                            .periodo(rs.getString("periodo"))
                            .idArea(rs.getLong("id_area"))
                            .descArea(rs.getString("desc_area"))
                            .idGrupoProg(rs.getLong("id_grupo_prog"))
                            .idPers(rs.getLong("id_pers"))
                            .nomPers(rs.getString("nom_pers"))
                            .idRegLab(rs.getLong("id_reg_lab"))
                            .descRegLab(rs.getString("desc_reg_lab"))
                            .idServicio(rs.getLong("id_servicio"))
                            .descServicio(rs.getString("desc_servicio"))
                            .turnosTotales(rs.getInt("turnos_totales"))
                            .turnosValidos(rs.getInt("turnos_validos"))
                            .horasTotales(rs.getBigDecimal("horas_totales"))
                            .observaciones(rs.getString("observaciones"))
                            .createdAt(rs.getTimestamp("created_at").toLocalDateTime())
                            .updatedAt(rs.getTimestamp("updated_at").toLocalDateTime())
                            .build()
            );

            return results.isEmpty() ? null : results.get(0);

        } catch (Exception e) {
            log.error("❌ Error obteniendo detalle: {}", e.getMessage());
            return null;
        }
    }

    @Override
    @Transactional
    public void eliminarSolicitud(Long idCtrHorario) {
        log.info("🗑️ Eliminando solicitud: {}", idCtrHorario);

        try {
            ctrHorarioRepository.deleteById(idCtrHorario);
            log.info("✅ Solicitud eliminada: {}", idCtrHorario);
        } catch (Exception e) {
            log.error("❌ Error eliminando solicitud: {}", e.getMessage());
            throw new RuntimeException("Error al eliminar solicitud", e);
        }
    }

    // ================================================================
    // Métodos privados
    // ================================================================

    private CtrHorarioDTO convertToDTO(CtrHorario horario) {
        return CtrHorarioDTO.builder()
                .idCtrHorario(horario.getIdCtrHorario())
                .periodo(horario.getPeriodo())
                .idArea(horario.getArea() != null ? horario.getArea().getIdArea() : null)
                .descArea(horario.getArea() != null ? horario.getArea().getDescArea() : null)
                .idPers(horario.getPersonal() != null ? horario.getPersonal().getIdPers() : null)
                .nomPers(horario.getPersonal() != null ? horario.getPersonal().getNomPers() : null)
                .idRegLab(horario.getRegimenLaboral() != null ? horario.getRegimenLaboral().getIdRegLab() : null)
                .descRegLab(horario.getRegimenLaboral() != null ? horario.getRegimenLaboral().getDescRegLab() : null)
                .idServicio(horario.getServicio() != null ? horario.getServicio().getIdServicio() : null)
                .descServicio(horario.getServicio() != null ? horario.getServicio().getDescServicio() : null)
                .turnosTotales(horario.getTurnosTotales())
                .turnosValidos(horario.getTurnosValidos())
                .horasTotales(horario.getHorasTotales())
                .observaciones(horario.getObservaciones())
                .createdAt(horario.getCreatedAt() != null ? horario.getCreatedAt().toLocalDateTime() : null)
                .updatedAt(horario.getUpdatedAt() != null ? horario.getUpdatedAt().toLocalDateTime() : null)
                .build();
    }
}
