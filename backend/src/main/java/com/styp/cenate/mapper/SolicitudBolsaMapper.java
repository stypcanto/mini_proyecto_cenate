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
                .aseguradoId(entity.getAseguradoId())
                .pacienteDni(entity.getPacienteDni())
                .pacienteNombre(entity.getPacienteNombre())
                .pacienteTelefono(entity.getPacienteTelefono())
                .pacienteEmail(entity.getPacienteEmail())
                .especialidad(entity.getEspecialidad())
                .idBolsa(entity.getBolsa() != null ? entity.getBolsa().getIdBolsa() : null)
                .nombreBolsa(entity.getBolsa() != null ? entity.getBolsa().getNombreBolsa() : null)
                .estado(entity.getEstado())
                .razonRechazo(entity.getRazonRechazo())
                .notasAprobacion(entity.getNotasAprobacion())
                .solicitanteId(entity.getSolicitanteId())
                .solicitanteNombre(entity.getSolicitanteNombre())
                .responsableAprobacionId(entity.getResponsableAprobacionId())
                .responsableAprobacionNombre(entity.getResponsableAprobacionNombre())
                .responsableGestoraId(entity.getResponsableGestoraId())
                .responsableGestoraNombre(entity.getResponsableGestoraNombre())
                .fechaAsignacion(entity.getFechaAsignacion())
                .estadoGestionCitasId(entity.getEstadoGestionCitasId())
                .recordatorioEnviado(entity.getRecordatorioEnviado())
                .fechaSolicitud(entity.getFechaSolicitud())
                .fechaAprobacion(entity.getFechaAprobacion())
                .fechaActualizacion(entity.getFechaActualizacion())
                .activo(entity.getActivo())
                .diasDesdeCreacion(entity.getDiasDesdeCreacion())
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
                .aseguradoId(dto.getAseguradoId())
                .pacienteDni(dto.getPacienteDni())
                .pacienteNombre(dto.getPacienteNombre())
                .pacienteTelefono(dto.getPacienteTelefono())
                .pacienteEmail(dto.getPacienteEmail())
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
        entity.setAseguradoId(dto.getAseguradoId());
        entity.setPacienteDni(dto.getPacienteDni());
        entity.setPacienteNombre(dto.getPacienteNombre());
        entity.setPacienteTelefono(dto.getPacienteTelefono());
        entity.setPacienteEmail(dto.getPacienteEmail());
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
