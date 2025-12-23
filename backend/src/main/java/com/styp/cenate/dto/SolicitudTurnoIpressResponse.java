package com.styp.cenate.dto;

import lombok.*;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * DTO de respuesta para solicitud de turnos de IPRESS.
 * Incluye datos auto-detectados del usuario (Red, IPRESS, contacto).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SolicitudTurnoIpressResponse {

    private Long idSolicitud;
    private Long idPeriodo;
    private String periodoDescripcion;
    private String estado;
    private OffsetDateTime fechaEnvio;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    // Datos del usuario (auto-detectados)
    private Long idPers;
    private String dniUsuario;
    private String nombreCompleto;
    private String emailContacto;
    private String telefonoContacto;

    // Datos de IPRESS (auto-detectados)
    private Long idIpress;
    private String codIpress;
    private String nombreIpress;

    // Datos de Red (auto-detectados)
    private Long idRed;
    private String nombreRed;

    // Detalles de turnos
    private List<DetalleSolicitudTurnoResponse> detalles;

    // Totales calculados
    private Integer totalTurnosSolicitados;
    private Integer totalEspecialidades;

    // Metodos de conveniencia
    public boolean isEnviado() {
        return "ENVIADO".equalsIgnoreCase(estado);
    }

    public boolean isRevisado() {
        return "REVISADO".equalsIgnoreCase(estado);
    }

    public boolean isBorrador() {
        return "BORRADOR".equalsIgnoreCase(estado);
    }
}
