package com.styp.cenate.dto.bolsas;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * DTO de respuesta para trazabilidad del ciclo de vida de una solicitud de bolsa.
 * Devuelve un timeline con todos los eventos: ingreso, asignación, cita, atención, anulación, recitas.
 *
 * @version v1.75.0
 */
@Data
@Builder
public class TrazabilidadBolsaResponseDTO {

    private Long   idSolicitud;
    private String numeroSolicitud;
    private String pacienteDni;
    private String pacienteNombre;
    private String estadoActual;
    private String descripcionEstadoActual;

    private List<EventoTrazabilidadDTO> timeline;

    @Data
    @Builder
    public static class EventoTrazabilidadDTO {

        /** Tipo de evento: INGRESO | ASIGNACION_MEDICO | CITA_AGENDADA | CAMBIO_ESTADO | ATENCION | ANULACION | RECITA */
        private String tipo;

        /** Fecha/hora del evento (UTC-5 Perú) */
        private OffsetDateTime fecha;

        /** Descripción legible del evento */
        private String descripcion;

        /** Nombre completo del profesional involucrado (si aplica) */
        private String medico;

        /** Descripción del estado resultante (si aplica) */
        private String estado;

        /** Información adicional: motivo anulación, hora cita, especialidad, etc. */
        private String detalle;

        /** Color para el frontend: blue | green | red | orange | purple | gray */
        private String color;
    }
}
