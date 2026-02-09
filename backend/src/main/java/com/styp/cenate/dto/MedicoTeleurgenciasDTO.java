package com.styp.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO para representar un médico en el área de Teleurgencias
 * Usado por el coordinador para supervisar al equipo
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicoTeleurgenciasDTO {
    private Long idPersonal;
    private String nombreCompleto;
    private String tipoDocumento;  // DNI, CE, etc.
    private String numeroDocumento;  // Número del documento
    private String username;
    private String estado;  // ACTIVO, INACTIVO
    private Integer pacientesAsignados;
    private Integer completadas;
    private Integer pendientes;
    private Integer desertadas;
    private Double porcentajeDesercion;
    private String ultimaAtencion;
    private List<AtencionMedicoDTO> atenciones;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AtencionMedicoDTO {
        private Long idSolicitud;
        private String paciente;
        private String hora;
        private String estado;  // ATENDIDO, PENDIENTE, DESERCION
        private String duracion;  // Para atendidas
        private String tiempoEspera;  // Para pendientes
        private Boolean urgente;  // Si espera > 45 minutos
    }
}
