package com.styp.cenate.mapper;

import com.styp.cenate.dto.bolsas.SolicitudBolsaDTO;
import com.styp.cenate.model.bolsas.SolicitudBolsa;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper para conversión entre SolicitudBolsa (Entity) y SolicitudBolsaDTO
 * Mapea 27 campos necesarios (v2.1.0 LIMPIO)
 *
 * @version v2.1.0 (Limpieza agresiva: solo 27 campos utilizados)
 * @since 2026-01-27
 */
public class SolicitudBolsaMapper {

    private static final DateTimeFormatter FECHA_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");

    /**
     * Convierte una entidad SolicitudBolsa a su DTO correspondiente
     * Solo mapea los 27 campos necesarios (v2.1.0 limpio)
     */
    public static SolicitudBolsaDTO toDTO(SolicitudBolsa entity) {
        if (entity == null) {
            return null;
        }

        return SolicitudBolsaDTO.builder()
                // ===== CORE OPERATIVO (9) =====
                .idSolicitud(entity.getIdSolicitud())
                .numeroSolicitud(entity.getNumeroSolicitud())
                .pacienteDni(entity.getPacienteDni())
                .pacienteId(entity.getPacienteId())
                .pacienteNombre(entity.getPacienteNombre())
                .idTipoBolsa(entity.getIdTipoBolsa())
                .idServicio(entity.getIdServicio())
                .codigoAdscripcion(entity.getCodigoAdscripcion())
                .estadoGestionCitasId(entity.getEstadoGestionCitasId())
                // ===== CAMPOS EXCEL v1.8.0 (8) =====
                .tipoDocumento(entity.getTipoDocumento())
                .pacienteSexo(entity.getPacienteSexo())
                .fechaNacimiento(entity.getFechaNacimiento())
                .pacienteTelefono(entity.getPacienteTelefono())
                .pacienteEmail(entity.getPacienteEmail())
                .codigoIpressAdscripcion(entity.getCodigoIpressAdscripcion())
                .tipoCita(entity.getTipoCita())
                .fechaPreferidaNoAtendida(entity.getFechaPreferidaNoAtendida())
                // ===== AUDITORÍA Y TIMESTAMPS (4) =====
                .fechaSolicitud(entity.getFechaSolicitud())
                .fechaActualizacion(entity.getFechaActualizacion())
                .activo(entity.getActivo())
                .estado(entity.getEstado())
                // ===== IPRESS (1) =====
                .idIpress(entity.getIdIpress())
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
