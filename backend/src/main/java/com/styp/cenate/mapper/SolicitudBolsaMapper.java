package com.styp.cenate.mapper;

import com.styp.cenate.dto.bolsas.SolicitudBolsaDTO;
import com.styp.cenate.model.bolsas.SolicitudBolsa;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper para conversión entre SolicitudBolsa (Entity) y SolicitudBolsaDTO
 * Mapea todos los campos incluyendo los 10 campos de Excel v1.8.0
 *
 * @version v1.8.0 (Soporta campos Excel + v1.9.0 fechas cita/atención)
 * @since 2026-01-26
 */
public class SolicitudBolsaMapper {

    private static final DateTimeFormatter FECHA_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");

    /**
     * Convierte una entidad SolicitudBolsa a su DTO correspondiente
     */
    public static SolicitudBolsaDTO toDTO(SolicitudBolsa entity) {
        if (entity == null) {
            return null;
        }

        return SolicitudBolsaDTO.builder()
                .idSolicitud(entity.getIdSolicitud())
                .numeroSolicitud(entity.getNumeroSolicitud())
                .pacienteDni(entity.getPacienteDni())
                .pacienteId(entity.getPacienteId())
                .pacienteNombre(entity.getPacienteNombre())
                .especialidad(entity.getEspecialidad())
                // ===== CAMPOS EXCEL v1.8.0 =====
                .fechaPreferidaNoAtendida(entity.getFechaPreferidaNoAtendida())
                .tipoDocumento(entity.getTipoDocumento())
                .fechaNacimiento(entity.getFechaNacimiento())
                .pacienteSexo(entity.getPacienteSexo())
                .pacienteTelefono(entity.getPacienteTelefono())
                .pacienteEmail(entity.getPacienteEmail())
                .pacienteEdad(entity.getPacienteEdad())
                .codigoIpressAdscripcion(entity.getCodigoIpressAdscripcion())
                .tipoCita(entity.getTipoCita())
                // ===== BOLSA Y SERVICIO =====
                .idBolsa(entity.getIdBolsa())
                .codTipoBolsa(entity.getCodTipoBolsa())
                .descTipoBolsa(entity.getDescTipoBolsa())
                .nombreBolsa(entity.getDescTipoBolsa())
                .idServicio(entity.getIdServicio())
                .codServicio(entity.getCodServicio())
                .codigoAdscripcion(entity.getCodigoAdscripcion())
                .idIpress(entity.getIdIpress())
                .nombreIpress(entity.getNombreIpress())
                .redAsistencial(entity.getRedAsistencial())
                // ===== ESTADO =====
                .estado(entity.getEstado())
                .razonRechazo(entity.getRazonRechazo())
                .notasAprobacion(entity.getNotasAprobacion())
                .solicitanteId(entity.getSolicitanteId())
                .solicitanteNombre(entity.getSolicitanteNombre())
                .responsableAprobacionId(entity.getResponsableAprobacionId())
                .responsableAprobacionNombre(entity.getResponsableAprobacionNombre())
                // ===== FECHAS =====
                .fechaSolicitud(entity.getFechaSolicitud())
                .fechaAprobacion(entity.getFechaAprobacion())
                .fechaActualizacion(entity.getFechaActualizacion())
                .responsableGestoraId(entity.getResponsableGestoraId())
                .fechaAsignacion(entity.getFechaAsignacion())
                // ===== FECHAS v1.9.0 =====
                .fechaCita(entity.getFechaCita())
                .fechaAtencion(entity.getFechaAtencion())
                // ===== ESTADO CITAS =====
                .estadoGestionCitasId(entity.getEstadoGestionCitasId())
                .codEstadoCita(entity.getCodEstadoCita())
                .descEstadoCita(entity.getDescEstadoCita())
                // ===== AUDITORÍA =====
                .activo(entity.getActivo())
                .recordatorioEnviado(entity.getRecordatorioEnviado())
                .build();
    }

    /**
     * Convierte una lista de entidades SolicitudBolsa a lista de DTOs
     */
    public static List<SolicitudBolsaDTO> toDTOList(List<SolicitudBolsa> entities) {
        if (entities == null) {
            return List.of();
        }
        return entities.stream()
                .map(SolicitudBolsaMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Genera número de solicitud automático con formato: BOLSA-YYYYMMDD-XXXXX
     * Ejemplo: BOLSA-20260123-00142
     * 
     * @return número de solicitud generado
     */
    public static String generarNumeroSolicitud() {
        String fecha = LocalDate.now().format(FECHA_FORMATTER);
        int aleatorio = (int) (Math.random() * 100000);
        String numeroAleatorio = String.format("%05d", aleatorio);
        return "BOLSA-" + fecha + "-" + numeroAleatorio;
    }

    /**
     * Verifica si un número de solicitud tiene el formato válido
     * 
     * @param numeroSolicitud número a validar
     * @return true si tiene formato válido
     */
    public static boolean esNumeroSolicitudValido(String numeroSolicitud) {
        if (numeroSolicitud == null || numeroSolicitud.isBlank()) {
            return false;
        }
        // Formato: BOLSA-YYYYMMDD-XXXXX
        return numeroSolicitud.matches("^BOLSA-\\d{8}-\\d{5}$");
    }
}
