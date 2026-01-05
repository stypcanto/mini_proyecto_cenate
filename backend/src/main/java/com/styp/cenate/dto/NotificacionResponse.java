// ============================================================================
// 🔔 NotificacionResponse.java – DTO de Notificación (CENATE 2025)
// ----------------------------------------------------------------------------
// Representa una notificación del sistema (cumpleaños, alertas, etc.)
// ============================================================================

package com.styp.cenate.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificacionResponse {

    /**
     * Tipo de notificación: CUMPLEANOS, ALERTA, INFO, etc.
     */
    private String tipo;

    /**
     * Título de la notificación
     */
    private String titulo;

    /**
     * Mensaje descriptivo
     */
    private String mensaje;

    /**
     * ID del personal relacionado (si aplica)
     */
    @JsonProperty("id_personal")
    private Long idPersonal;

    /**
     * Nombre completo del personal
     */
    @JsonProperty("nombre_completo")
    private String nombreCompleto;

    /**
     * Profesión (para médicos)
     */
    private String profesion;

    /**
     * Fecha relacionada (cumpleaños, fecha de evento, etc.)
     */
    private LocalDate fecha;

    /**
     * URL de la foto (si existe)
     */
    @JsonProperty("foto_url")
    private String fotoUrl;

    /**
     * Icono para mostrar (emoji o nombre de icono)
     */
    private String icono;
}
