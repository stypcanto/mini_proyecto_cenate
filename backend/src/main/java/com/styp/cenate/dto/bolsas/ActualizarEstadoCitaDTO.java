package com.styp.cenate.dto.bolsas;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * DTO para actualizar estado de solicitud + detalles de cita
 * v1.0.0 - Soporte para guardar fecha, hora y médico junto con el estado
 *
 * @since 2026-02-03
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActualizarEstadoCitaDTO {

    /**
     * Código del nuevo estado de la solicitud
     * Obligatorio: PENDIENTE, CITADO, ATENDIDO_IPRESS, NO_CONTESTA, NO_DESEA,
     *             APAGADO, TEL_SIN_SERVICIO, NUM_NO_EXISTE, SIN_VIGENCIA,
     *             HC_BLOQUEADA, REPROG_FALLIDA
     */
    private String nuevoEstadoCodigo;

    /**
     * Fecha de la cita agendada
     * Opcional: Se guarda si se proporciona
     * Formato: YYYY-MM-DD (LocalDate)
     * Se mapea a: fecha_atencion
     */
    private LocalDate fechaAtencion;

    /**
     * Hora de la cita agendada
     * Opcional: Se guarda si se proporciona
     * Formato: HH:mm (LocalTime)
     * Se mapea a: hora_atencion
     */
    private LocalTime horaAtencion;

    /**
     * ID del médico/personal asignado a la cita
     * Opcional: Se guarda si se proporciona
     * Referencia a: dim_personal_cnt.id_pers
     * Se mapea a: id_personal
     */
    private Long idPersonal;

    /**
     * Anotaciones o notas sobre la cita
     * Opcional: Campo adicional para observaciones
     */
    private String notas;
}
