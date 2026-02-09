package com.styp.cenate.service.coordinador;

import com.styp.cenate.dto.coordinador.EstadisticaMedicoDTO;
import com.styp.cenate.dto.coordinador.EvolucionTemporalDTO;
import com.styp.cenate.dto.coordinador.KpisAreaDTO;
import com.styp.cenate.model.PersonalCnt;
import com.styp.cenate.model.Usuario;
import com.styp.cenate.model.bolsas.SolicitudBolsa;
import com.styp.cenate.repository.PersonalCntRepository;
import com.styp.cenate.repository.UsuarioRepository;
import com.styp.cenate.repository.bolsas.SolicitudBolsaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Implementación del servicio para coordinador médico
 * Maneja operaciones de supervisión y gestión de médicos de un área
 *
 * @version v1.63.0
 * @since 2026-02-08
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CoordinadorMedicoServiceImpl implements ICoordinadorMedicoService {

    private final SolicitudBolsaRepository solicitudBolsaRepository;
    private final PersonalCntRepository personalCntRepository;
    private final UsuarioRepository usuarioRepository;

    @Override
    @Transactional(readOnly = true)
    public String obtenerAreaDelCoordinadorActual() {
        String username = SecurityContextHolder.getContext()
            .getAuthentication().getName();

        Usuario usuario = usuarioRepository.findByNameUserWithFullDetails(username)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + username));

        PersonalCnt personalCnt = usuario.getPersonalCnt();
        if (personalCnt == null || personalCnt.getAreaTrabajo() == null) {
            throw new RuntimeException("Coordinador sin área de trabajo asignada");
        }

        log.info("Coordinador {} accediendo a área: {}", username, personalCnt.getAreaTrabajo());
        return personalCnt.getAreaTrabajo();
    }

    @Override
    @Transactional(readOnly = true)
    public List<EstadisticaMedicoDTO> obtenerEstadisticasMedicos(
            OffsetDateTime fechaDesde,
            OffsetDateTime fechaHasta) {

        String areaTrabajo = obtenerAreaDelCoordinadorActual();

        List<Map<String, Object>> results = solicitudBolsaRepository
            .obtenerEstadisticasMedicosPorArea(areaTrabajo, fechaDesde, fechaHasta);

        log.debug("Obtenidas {} estadísticas para área: {}", results.size(), areaTrabajo);

        return results.stream()
            .map(this::mapToEstadisticaMedicoDTO)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public KpisAreaDTO obtenerKpisArea(OffsetDateTime fechaDesde, OffsetDateTime fechaHasta) {
        String areaTrabajo = obtenerAreaDelCoordinadorActual();

        Map<String, Object> kpis = solicitudBolsaRepository
            .obtenerKpisPorArea(areaTrabajo, fechaDesde, fechaHasta);

        log.debug("Obtenidos KPIs para área: {}", areaTrabajo);

        return mapToKpisAreaDTO(kpis);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EvolucionTemporalDTO> obtenerEvolucionTemporal(
            OffsetDateTime fechaDesde,
            OffsetDateTime fechaHasta) {

        String areaTrabajo = obtenerAreaDelCoordinadorActual();

        List<Map<String, Object>> results = solicitudBolsaRepository
            .obtenerEvolucionTemporalPorArea(areaTrabajo, fechaDesde, fechaHasta);

        log.debug("Obtenida evolución temporal para área: {}", areaTrabajo);

        return results.stream()
            .map(this::mapToEvolucionTemporalDTO)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void reasignarPaciente(Long idSolicitud, Long nuevoMedicoId) {
        String areaTrabajo = obtenerAreaDelCoordinadorActual();

        // Validar que el nuevo médico pertenece al área
        PersonalCnt nuevoMedico = personalCntRepository.findById(nuevoMedicoId)
            .orElseThrow(() -> new RuntimeException("Médico no encontrado: " + nuevoMedicoId));

        if (!areaTrabajo.equals(nuevoMedico.getAreaTrabajo())) {
            throw new RuntimeException(
                String.format("El médico %s no pertenece al área %s",
                    nuevoMedico.getNombreCompleto(), areaTrabajo)
            );
        }

        SolicitudBolsa solicitud = solicitudBolsaRepository.findById(idSolicitud)
            .orElseThrow(() -> new RuntimeException("Solicitud no encontrada: " + idSolicitud));

        Long medicoAnterior = solicitud.getIdPersonal();
        solicitud.setIdPersonal(nuevoMedicoId);
        solicitud.setFechaAsignacion(OffsetDateTime.now());
        solicitudBolsaRepository.save(solicitud);

        log.info("Reasignación: Solicitud {} de médico {} a médico {} en área {}",
            idSolicitud, medicoAnterior, nuevoMedicoId, areaTrabajo);
    }

    // ========================================================================
    // Métodos de mapeo privados
    // ========================================================================

    private EstadisticaMedicoDTO mapToEstadisticaMedicoDTO(Map<String, Object> map) {
        return EstadisticaMedicoDTO.builder()
            .idPers(castToLong(map.get("idPers")))
            .nombreMedico((String) map.get("nombreMedico"))
            .email((String) map.get("email"))
            .totalAsignados(castToInt(map.get("totalAsignados")))
            .totalAtendidos(castToInt(map.get("totalAtendidos")))
            .totalPendientes(castToInt(map.get("totalPendientes")))
            .totalDeserciones(castToInt(map.get("totalDeserciones")))
            .totalCronicos(castToInt(map.get("totalCronicos")))
            .totalRecitas(castToInt(map.get("totalRecitas")))
            .totalInterconsultas(castToInt(map.get("totalInterconsultas")))
            .horasPromedioAtencion(castToDouble(map.get("horasPromedioAtencion")))
            .porcentajeAtencion(castToDouble(map.get("porcentajeAtencion")))
            .tasaDesercion(castToDouble(map.get("tasaDesercion")))
            .build();
    }

    private KpisAreaDTO mapToKpisAreaDTO(Map<String, Object> map) {
        return KpisAreaDTO.builder()
            .totalPacientes(castToInt(map.get("totalPacientes")))
            .totalAtendidos(castToInt(map.get("totalAtendidos")))
            .totalPendientes(castToInt(map.get("totalPendientes")))
            .totalDeserciones(castToInt(map.get("totalDeserciones")))
            .totalCronicos(castToInt(map.get("totalCronicos")))
            .totalRecitas(castToInt(map.get("totalRecitas")))
            .totalInterconsultas(castToInt(map.get("totalInterconsultas")))
            .totalMedicosActivos(castToInt(map.get("totalMedicosActivos")))
            .horasPromedio(castToDouble(map.get("horasPromedio")))
            .tasaCompletacion(castToDouble(map.get("tasaCompletacion")))
            .tasaDesercion(castToDouble(map.get("tasaDesercion")))
            .build();
    }

    private EvolucionTemporalDTO mapToEvolucionTemporalDTO(Map<String, Object> map) {
        Object fechaObj = map.get("fecha");
        LocalDate fecha = null;

        if (fechaObj instanceof LocalDate) {
            fecha = (LocalDate) fechaObj;
        } else if (fechaObj instanceof String) {
            fecha = LocalDate.parse((String) fechaObj);
        }

        return EvolucionTemporalDTO.builder()
            .fecha(fecha)
            .totalAtenciones(castToInt(map.get("totalAtenciones")))
            .atendidos(castToInt(map.get("atendidos")))
            .pendientes(castToInt(map.get("pendientes")))
            .deserciones(castToInt(map.get("deserciones")))
            .build();
    }

    // ========================================================================
    // Utilidades de casting
    // ========================================================================

    private Long castToLong(Object value) {
        if (value == null) return null;
        if (value instanceof Long) return (Long) value;
        if (value instanceof Integer) return ((Integer) value).longValue();
        if (value instanceof String) return Long.parseLong((String) value);
        return null;
    }

    private Integer castToInt(Object value) {
        if (value == null) return 0;
        if (value instanceof Integer) return (Integer) value;
        if (value instanceof Long) return ((Long) value).intValue();
        if (value instanceof String) return Integer.parseInt((String) value);
        return 0;
    }

    private Double castToDouble(Object value) {
        if (value == null) return 0.0;
        if (value instanceof Double) return (Double) value;
        if (value instanceof Float) return ((Float) value).doubleValue();
        if (value instanceof BigDecimal) return ((java.math.BigDecimal) value).doubleValue();
        if (value instanceof String) return Double.parseDouble((String) value);
        return 0.0;
    }
}
