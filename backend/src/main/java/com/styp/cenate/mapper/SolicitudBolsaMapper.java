package com.styp.cenate.mapper;

import com.styp.cenate.dto.bolsas.SolicitudBolsaDTO;
import com.styp.cenate.dto.bolsas.SolicitudBolsaRequestDTO;
import com.styp.cenate.model.SolicitudBolsa;

import java.util.List;

/**
 * 📋 Mapper para conversión entre SolicitudBolsa y SolicitudBolsaDTO
 */
public class SolicitudBolsaMapper {

    private SolicitudBolsaMapper() {
    }

    // ============================================================
    // ENTITY → DTO
    // ============================================================
    public static SolicitudBolsaDTO toDto(SolicitudBolsa entity) {
        if (entity == null)
            return null;

        return SolicitudBolsaDTO.builder()
                .idSolicitud(entity.getIdSolicitud())
                .numeroSolicitud(entity.getNumeroSolicitud())
                .pacienteId(entity.getPacienteId())
                .pacienteDni(entity.getPacienteDni())
                .pacienteNombre(entity.getPacienteNombre())
                .especialidad(entity.getEspecialidad())
                .idBolsa(entity.getBolsa() != null ? entity.getBolsa().getIdBolsa() : null)
                .estado(entity.getEstado())
                .razonRechazo(entity.getRazonRechazo())
                .notasAprobacion(entity.getNotasAprobacion())
                .solicitanteId(entity.getSolicitanteId())
                .solicitanteNombre(entity.getSolicitanteNombre())
                .responsableAprobacionId(entity.getResponsableAprobacionId())
                .responsableAprobacionNombre(entity.getResponsableAprobacionNombre())
                .fechaSolicitud(entity.getFechaSolicitud())
                .fechaAprobacion(entity.getFechaAprobacion())
                .fechaActualizacion(entity.getFechaActualizacion())
                .activo(entity.getActivo())
                .build();
    }

    // ============================================================
    // DTO → ENTITY (para crear)
    // ============================================================
    public static SolicitudBolsa toEntity(SolicitudBolsaRequestDTO dto) {
        if (dto == null)
            return null;

        // Generar número de solicitud único (BOLSA-YYYYMMDD-XXXXX)
        String numeroSolicitud = generarNumeroSolicitud();

        // Nota: La bolsa debe ser seteada después por el servicio
        return SolicitudBolsa.builder()
                .numeroSolicitud(numeroSolicitud)
                .pacienteId(dto.getPacienteId())
                .pacienteDni(dto.getPacienteDni())
                .pacienteNombre(dto.getPacienteNombre())
                .especialidad(dto.getEspecialidad())
                .estado("PENDIENTE")
                .solicitanteId(dto.getSolicitanteId())
                .solicitanteNombre(dto.getSolicitanteNombre())
                .activo(true)
                .build();
    }

    // ============================================================
    // ACTUALIZAR ENTITY DESDE DTO (sin perder auditoría)
    // ============================================================
    public static void updateEntity(SolicitudBolsa entity, SolicitudBolsaRequestDTO dto) {
        entity.setPacienteId(dto.getPacienteId());
        entity.setPacienteDni(dto.getPacienteDni());
        entity.setPacienteNombre(dto.getPacienteNombre());
        entity.setEspecialidad(dto.getEspecialidad());
        // Nota: No actualizamos bolsa en el mapper (debe hacerse en el servicio)
        entity.setSolicitanteId(dto.getSolicitanteId());
        entity.setSolicitanteNombre(dto.getSolicitanteNombre());
        // Auditoría NO se toca
    }

    // ============================================================
    // LISTA ENTITY → LISTA DTO
    // ============================================================
    public static List<SolicitudBolsaDTO> toDtoList(List<SolicitudBolsa> list) {
        return list.stream().map(SolicitudBolsaMapper::toDto).toList();
    }

    // ============================================================
    // HELPER
    // ============================================================
    private static String generarNumeroSolicitud() {
        // Formato: BOLSA-YYYYMMDD-XXXXX (XXXXX es un número aleatorio)
        String fecha = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));
        String aleatorio = String.valueOf((int) (Math.random() * 100000));
        return "BOLSA-" + fecha + "-" + String.format("%05d", Integer.parseInt(aleatorio));
    }
}
