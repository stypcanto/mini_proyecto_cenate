package com.styp.cenate.service.sgdt;

import com.styp.cenate.dto.enfermeria.RescatarPacienteDto;
import com.styp.cenate.dto.sgdt.MedicoSimpleDto;
import com.styp.cenate.dto.sgdt.MedicoStatsDto;
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
 * Servicio para la vista "Total Pacientes TeleCe" — SGDT Medicina Especializada.
 * Reutiliza las queries de SolicitudBolsaRepository filtradas por especialidades
 * que NO son 'medicina general' ni 'enfermeria'.
 *
 * @version v1.85.36
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SgdtService {

    private final SolicitudBolsaRepository solicitudBolsaRepository;
    private final PersonalCntRepository personalCntRepository;

    /**
     * Estadísticas de pacientes de Medicina Especializada agrupadas por médico.
     */
    @Transactional(readOnly = true)
    public List<MedicoStatsDto> obtenerEstadisticasPorMedico(String fecha, String turno) {
        log.info("📊 SGDT estadisticas/por-medico - fecha: {}, turno: {}", fecha, turno);
        List<Object[]> rows = solicitudBolsaRepository.estadisticasPorMedicoSgdt(fecha, turno);
        return rows.stream().map(r -> MedicoStatsDto.builder()
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
     * Pacientes de Medicina Especializada asignados a un médico específico.
     */
    @Transactional(readOnly = true)
    public List<RescatarPacienteDto> obtenerPacientesPorMedico(Long idPersonal, String fecha, String turno) {
        log.info("📋 SGDT pacientes/por-medico - idPersonal: {}, fecha: {}, turno: {}", idPersonal, fecha, turno);
        List<Object[]> rows = solicitudBolsaRepository.pacientesPorMedicoSgdt(idPersonal, fecha, turno);
        String nombreMedico = personalCntRepository.findById(idPersonal)
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
                .idPersonal(idPersonal)
                .nombreEnfermera(nombreMedico)
                .horaCita(r[6] != null ? r[6].toString() : null)
                .build())
                .collect(Collectors.toList());
    }

    /**
     * Lista médicos activos con pacientes en Medicina Especializada.
     */
    @Transactional(readOnly = true)
    public List<MedicoSimpleDto> listarMedicos() {
        log.info("📋 SGDT medicos - listar activos con especialidades");
        List<Object[]> rows = solicitudBolsaRepository.estadisticasPorMedicoSgdt(null, null);
        return rows.stream().map(r -> {
            Long id = r[0] != null ? ((Number) r[0]).longValue() : null;
            String nombre = r[1] != null ? r[1].toString() : "";
            return MedicoSimpleDto.builder()
                    .idPersonal(id)
                    .nombreCompleto(nombre)
                    .build();
        }).collect(Collectors.toList());
    }

    /**
     * Búsqueda global de pacientes de Medicina Especializada por nombre o DNI.
     */
    @Transactional(readOnly = true)
    public List<RescatarPacienteDto> buscarPacienteGlobal(String q) {
        String patron = "%" + q.trim() + "%";
        log.info("🔍 SGDT buscarPacienteGlobal - q: {}", q);
        List<Object[]> rows = solicitudBolsaRepository.buscarPacienteGlobalSgdt(patron);
        return rows.stream().map(r -> RescatarPacienteDto.builder()
                .idSolicitud(r[0] != null ? ((Number) r[0]).longValue() : null)
                .pacienteNombre(r[1] != null ? r[1].toString() : "")
                .pacienteDni(r[2] != null ? r[2].toString() : "")
                .condicionMedica(r[3] != null ? r[3].toString() : "")
                .fechaAtencion(r[4] != null ? ((java.sql.Date) r[4]).toLocalDate() : null)
                .idPersonal(r[5] != null ? ((Number) r[5]).longValue() : null)
                .nombreEnfermera(r[6] != null ? r[6].toString() : "")
                .build())
                .collect(Collectors.toList());
    }

    /**
     * Fechas disponibles con total de pacientes de Medicina Especializada.
     */
    @Transactional(readOnly = true)
    public Map<String, Long> obtenerFechasDisponibles() {
        List<Object[]> rows = solicitudBolsaRepository.fechasConPacientesSgdt();
        Map<String, Long> resultado = new LinkedHashMap<>();
        for (Object[] r : rows) {
            String fecha = r[0] != null ? r[0].toString() : null;
            Long total   = r[1] != null ? ((Number) r[1]).longValue() : 0L;
            if (fecha != null) resultado.put(fecha, total);
        }
        return resultado;
    }

    /**
     * Fechas disponibles para un médico específico.
     */
    @Transactional(readOnly = true)
    public Map<String, Long> obtenerFechasPorMedico(Long idPersonal) {
        List<Object[]> rows = solicitudBolsaRepository.fechasConPacientesPorMedicoSgdt(idPersonal);
        Map<String, Long> resultado = new LinkedHashMap<>();
        for (Object[] r : rows) {
            String fecha = r[0] != null ? r[0].toString() : null;
            Long total   = r[1] != null ? ((Number) r[1]).longValue() : 0L;
            if (fecha != null) resultado.put(fecha, total);
        }
        return resultado;
    }

    /**
     * Reasignación masiva de pacientes (solicitudes) a otro médico.
     */
    @Transactional
    public int reasignarPacientesMasivo(List<Long> ids, Long idPersonal,
                                         java.time.LocalDate fechaAtencion,
                                         java.time.LocalTime horaAtencion) {
        log.info("🔄 SGDT reasignar-masivo - {} ids → medico {} fecha={} hora={}",
                 ids.size(), idPersonal, fechaAtencion, horaAtencion);
        return solicitudBolsaRepository.reasignarPacientesMasivo(ids, idPersonal, fechaAtencion, horaAtencion);
    }
}
