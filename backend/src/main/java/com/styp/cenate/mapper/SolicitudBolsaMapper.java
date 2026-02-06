package com.styp.cenate.mapper;

import com.styp.cenate.dto.bolsas.SolicitudBolsaDTO;
import com.styp.cenate.model.bolsas.SolicitudBolsa;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Mapper para conversión entre SolicitudBolsa (Entity) y SolicitudBolsaDTO
 * Mapea 32 campos necesarios (v3.3.1 con auditoría de cambios de estado)
 *
 * @version v3.3.1 (Agregar auditoría de cambios de estado: fecha_cambio_estado, usuario_cambio_estado_id)
 * @since 2026-02-01
 */
public class SolicitudBolsaMapper {

    private static final DateTimeFormatter FECHA_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");

    /**
     * Convierte una entidad SolicitudBolsa a su DTO correspondiente
     * Mapea 32 campos necesarios (v3.3.1 con auditoría de cambios de estado)
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
                .idBolsa(entity.getIdBolsa())
                .idServicio(entity.getIdServicio())
                .codigoAdscripcion(entity.getCodigoAdscripcion())
                .estadoGestionCitasId(entity.getEstadoGestionCitasId())
                // ===== DESCRIPCIÓN ESTADO DE GESTIÓN CITAS (v3.3.1) =====
                .codEstadoCita(entity.getEstadoGestionCitas() != null ? entity.getEstadoGestionCitas().getCodigoEstado() : null)
                .descEstadoCita(entity.getEstadoGestionCitas() != null ? entity.getEstadoGestionCitas().getDescripcionEstado() : null)
                // ===== ESPECIALIDAD (1) - NEW v1.46.5 =====
                .especialidad(entity.getEspecialidad())
                // ===== CAMPOS EXCEL v1.8.0 (9 ahora) =====
                .tipoDocumento(entity.getTipoDocumento())
                .pacienteSexo(entity.getPacienteSexo())
                .fechaNacimiento(entity.getFechaNacimiento())
                .pacienteTelefono(entity.getPacienteTelefono())
                .pacienteTelefonoAlterno(entity.getPacienteTelefonoAlterno())
                .pacienteEmail(entity.getPacienteEmail())
                .codigoIpressAdscripcion(entity.getCodigoIpressAdscripcion())
                .tipoCita(entity.getTipoCita())
                .fechaPreferidaNoAtendida(entity.getFechaPreferidaNoAtendida())
                // ===== ASIGNACIÓN GESTORA (2) - NEW v2.4.0 =====
                .responsableGestoraId(entity.getResponsableGestoraId())
                .fechaAsignacion(entity.getFechaAsignacion())
                // ===== AUDITORÍA Y TIMESTAMPS (6) - v3.3.1: +2 campos cambio estado =====
                .fechaSolicitud(entity.getFechaSolicitud())
                .fechaActualizacion(entity.getFechaActualizacion())
                .fechaCambioEstado(entity.getFechaCambioEstado())
                .usuarioCambioEstadoId(entity.getUsuarioCambioEstadoId())
                .nombreUsuarioCambioEstado(entity.getUsuarioCambioEstado() != null ? entity.getUsuarioCambioEstado().getNameUser() : null)
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
     * Genera múltiples números de solicitud candidatos para evitar colisiones.
     * Útil para pre-validación antes de guardar en BD.
     *
     * @param cantidad número de candidatos a generar
     * @return lista de números de solicitud únicos (sin duplicados en la misma lista)
     */
    public static List<String> generarNumerosExclusivos(int cantidad) {
        Set<String> generados = new HashSet<>();
        String fecha = LocalDate.now().format(FECHA_FORMATTER);

        // Intentar generar 'cantidad' números únicos (máximo 100 intentos para evitar bucle infinito)
        int intentos = 0;
        int maxIntentos = 100;

        while (generados.size() < cantidad && intentos < maxIntentos) {
            int aleatorio = (int) (Math.random() * 100000);
            String numeroAleatorio = String.format("%05d", aleatorio);
            String numero = "BOLSA-" + fecha + "-" + numeroAleatorio;
            generados.add(numero);
            intentos++;
        }

        return new ArrayList<>(generados);
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
