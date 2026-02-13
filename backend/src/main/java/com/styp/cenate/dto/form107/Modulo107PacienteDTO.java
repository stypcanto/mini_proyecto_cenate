package com.styp.cenate.dto.form107;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.styp.cenate.model.bolsas.SolicitudBolsa;
import java.time.OffsetDateTime;

/**
 * 📋 Modulo107PacienteDTO - DTO para respuestas de API
 *
 * Expone solo los campos necesarios para el frontend.
 * NO expone detalles internos de la entidad JPA.
 *
 * Campos mapeados desde dim_solicitud_bolsa (id_bolsa = 107):
 * - Identificación: idSolicitud, numeroSolicitud
 * - Datos Paciente: pacienteDni, pacienteNombre, pacienteSexo, pacienteTelefono
 * - Operativo: especialidad, codigoAdscripcion (IPRESS), estadoGestionCitasId
 * - Asignación: fechaSolicitud, fechaAsignacion, responsableGestoraId
 *
 * @since v3.0.0 (2026-01-29)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Modulo107PacienteDTO {

    // 🔑 Identificación
    private Long idSolicitud;
    private String numeroSolicitud;

    // 👤 Datos del Paciente
    private String pacienteDni;
    private String pacienteNombre;
    private String pacienteSexo;
    private String pacienteTelefono;
    private java.time.LocalDate fechaNacimiento;

    // 📋 Datos Operativos
    private String especialidad;
    private String codigoAdscripcion;
    private String tipoCita;

    // 📊 Gestión de Citas
    private Long estadoGestionCitasId;
    private OffsetDateTime fechaSolicitud;
    private OffsetDateTime fechaAsignacion;

    // 👤 Asignación
    private Long responsableGestoraId;

    // 📞 Motivo de Llamada (v1.68.2)
    private String motivoLlamadoBolsa;

    /**
     * Convertir entidad JPA a DTO
     * Mapea campos de SolicitudBolsa a DTO
     */
    public static Modulo107PacienteDTO fromEntity(SolicitudBolsa entity) {
        if (entity == null) {
            return null;
        }

        return Modulo107PacienteDTO.builder()
                .idSolicitud(entity.getIdSolicitud())
                .numeroSolicitud(entity.getNumeroSolicitud())
                .pacienteDni(entity.getPacienteDni())
                .pacienteNombre(entity.getPacienteNombre())
                .pacienteSexo(entity.getPacienteSexo())
                .pacienteTelefono(entity.getPacienteTelefono())
                .fechaNacimiento(entity.getFechaNacimiento())
                .especialidad(entity.getEspecialidad())
                .codigoAdscripcion(entity.getCodigoAdscripcion())
                .tipoCita(entity.getTipoCita())
                .estadoGestionCitasId(entity.getEstadoGestionCitasId())
                .fechaSolicitud(entity.getFechaSolicitud())
                .fechaAsignacion(entity.getFechaAsignacion())
                .responsableGestoraId(entity.getResponsableGestoraId())
                .motivoLlamadoBolsa(entity.getMotivoLlamadoBolsa())
                .build();
    }
}
