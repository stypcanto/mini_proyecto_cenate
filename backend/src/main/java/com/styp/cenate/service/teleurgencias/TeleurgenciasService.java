package com.styp.cenate.service.teleurgencias;

import com.styp.cenate.dto.enfermeria.EnfermeraSimpleDto;
import com.styp.cenate.dto.enfermeria.RescatarPacienteDto;
import com.styp.cenate.dto.teleurgencias.MedicoTeleurgenciasStatsDto;
import com.styp.cenate.repository.PersonalCntRepository;
import com.styp.cenate.repository.bolsas.SolicitudBolsaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Servicio para el módulo "Total Pacientes Teleurgencias".
 * Sigue el patrón de NursingService (enfermería) pero filtrando
 * por los 47 IDs de médicos de Teleurgencias.
 *
 * @version v1.79.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class TeleurgenciasService {

    private final SolicitudBolsaRepository solicitudBolsaRepository;
    private final PersonalCntRepository personalCntRepository;

    /** Lista de IDs de médicos de Teleurgencias */
    public static final List<Long> IDS_TELEURGENCIAS = List.of(
        390L, 327L, 301L, 335L, 302L, 567L, 566L, 574L, 727L, 300L, 352L,
        410L, 560L, 361L, 553L, 548L, 554L, 571L, 303L, 378L, 570L, 552L,
        379L, 555L, 573L, 415L, 549L, 299L, 557L, 305L, 308L, 561L, 341L,
        687L, 304L, 568L, 572L, 563L, 545L, 307L, 547L, 550L, 562L, 564L,
        306L, 565L, 546L,
        836L  // Suazo Flores Helmouth Keller - SGDT Teleurgencias y Teletriaje
    );

    /**
     * Estadísticas agrupadas por médico con filtros opcionales de fecha y turno.
     */
    public List<MedicoTeleurgenciasStatsDto> obtenerEstadisticasPorMedico(String fecha, String turno) {
        log.info("📊 Teleurgencias: estadísticas por médico - fecha: {}, turno: {}", fecha, turno);
        List<Object[]> rows = solicitudBolsaRepository.estadisticasPorMedicoTeleurgencias(IDS_TELEURGENCIAS, fecha, turno);
        return rows.stream().map(r -> MedicoTeleurgenciasStatsDto.builder()
                .idMedico(r[0] != null ? ((Number) r[0]).longValue() : null)
                .nombreMedico(r[1] != null ? r[1].toString() : "")
                .total(r[2] != null ? ((Number) r[2]).longValue() : 0L)
                .pendientes(r[3] != null ? ((Number) r[3]).longValue() : 0L)
                .atendidos(r[4] != null ? ((Number) r[4]).longValue() : 0L)
                .desercion(r[5] != null ? ((Number) r[5]).longValue() : 0L)
                .build())
                .collect(Collectors.toList());
    }

    /**
     * Pacientes asignados a un médico específico con filtros opcionales.
     */
    public List<RescatarPacienteDto> obtenerPacientesPorMedico(Long idMedico, String fecha, String turno) {
        log.info("📋 Teleurgencias: pacientes por médico - idMedico: {}, fecha: {}, turno: {}", idMedico, fecha, turno);
        List<Object[]> rows = solicitudBolsaRepository.pacientesPorMedicoTeleurgencias(idMedico, fecha, turno);
        String nombreMedico = personalCntRepository.findById(idMedico)
                .map(p -> String.join(" ",
                        p.getApePaterPers() != null ? p.getApePaterPers() : "",
                        p.getApeMaterPers() != null ? p.getApeMaterPers() : "",
                        p.getNomPers() != null ? p.getNomPers() : "").trim())
                .orElse(null);
        return rows.stream().map(r -> RescatarPacienteDto.builder()
                .idSolicitud(r[0] != null ? ((Number) r[0]).longValue() : null)
                .pacienteNombre(r[1] != null ? r[1].toString() : "")
                .pacienteDni(r[2] != null ? r[2].toString() : "")
                .condicionMedica(r[3] != null ? r[3].toString() : "")
                .idPersonal(idMedico)
                .nombreEnfermera(nombreMedico)
                .horaCita(r[6] != null ? r[6].toString() : null)
                .build())
                .collect(Collectors.toList());
    }

    /**
     * Búsqueda de pacientes por nombre o DNI a través de todos los médicos de Teleurgencias.
     */
    public List<RescatarPacienteDto> buscarPacientes(String q, String fecha, String turno) {
        log.info("🔍 Teleurgencias: buscar pacientes - q: {}, fecha: {}, turno: {}", q, fecha, turno);
        String qLike = "%" + (q != null ? q.trim() : "") + "%";
        List<Object[]> rows = solicitudBolsaRepository.buscarPacientesTeleurgencias(
                IDS_TELEURGENCIAS, qLike, fecha, turno);
        return rows.stream().map(r -> RescatarPacienteDto.builder()
                .idSolicitud(r[0] != null ? ((Number) r[0]).longValue() : null)
                .pacienteNombre(r[1] != null ? r[1].toString() : "")
                .pacienteDni(r[2] != null ? r[2].toString() : "")
                .condicionMedica(r[3] != null ? r[3].toString() : "")
                .idPersonal(r[5] != null ? ((Number) r[5]).longValue() : null)
                .horaCita(r[6] != null ? r[6].toString() : null)
                .nombreEnfermera(r[7] != null ? r[7].toString() : "")
                .build())
                .collect(Collectors.toList());
    }

    /**
     * Lista de médicos de Teleurgencias (para selector de reasignación).
     */
    public List<EnfermeraSimpleDto> listarMedicos() {
        log.info("📋 Teleurgencias: listar médicos");
        return personalCntRepository.findAllById(IDS_TELEURGENCIAS).stream()
                .filter(p -> "A".equalsIgnoreCase(p.getStatPers()))
                .map(p -> EnfermeraSimpleDto.builder()
                        .idPersonal(p.getIdPers())
                        .nombreCompleto(String.join(" ",
                                p.getApePaterPers() != null ? p.getApePaterPers() : "",
                                p.getApeMaterPers() != null ? p.getApeMaterPers() : "",
                                p.getNomPers() != null ? p.getNomPers() : "").trim())
                        .numDoc(p.getNumDocPers())
                        .build())
                .sorted(java.util.Comparator.comparing(EnfermeraSimpleDto::getNombreCompleto))
                .collect(Collectors.toList());
    }

    /**
     * Mapa {fecha → total} para el calendario global (todos los médicos de Teleurgencias).
     */
    public Map<String, Long> obtenerFechasDisponibles() {
        List<Object[]> rows = solicitudBolsaRepository.fechasDisponiblesTeleurgencias(IDS_TELEURGENCIAS);
        Map<String, Long> resultado = new LinkedHashMap<>();
        for (Object[] r : rows) {
            String fecha = r[0] != null ? r[0].toString() : null;
            Long total   = r[1] != null ? ((Number) r[1]).longValue() : 0L;
            if (fecha != null) resultado.put(fecha, total);
        }
        return resultado;
    }

    /**
     * Mapa {fecha → total} para el calendario del drawer (un médico específico).
     */
    public Map<String, Long> obtenerFechasPorMedico(Long idMedico) {
        List<Object[]> rows = solicitudBolsaRepository.fechasPorMedicoTeleurgencias(idMedico);
        Map<String, Long> resultado = new LinkedHashMap<>();
        for (Object[] r : rows) {
            String fecha = r[0] != null ? r[0].toString() : null;
            Long total   = r[1] != null ? ((Number) r[1]).longValue() : 0L;
            if (fecha != null) resultado.put(fecha, total);
        }
        return resultado;
    }

    /**
     * Reasignación masiva (reutiliza el mismo método que enfermería).
     */
    @Transactional
    public int reasignarMasivo(List<Long> ids, Long idPersonal,
                               java.time.LocalDate fechaAtencion,
                               java.time.LocalTime horaAtencion) {
        log.info("🔄 Teleurgencias reasignar-masivo - {} ids → médico {} fecha={} hora={}",
                ids.size(), idPersonal, fechaAtencion, horaAtencion);
        return solicitudBolsaRepository.reasignarPacientesMasivo(ids, idPersonal, fechaAtencion, horaAtencion);
    }
}
