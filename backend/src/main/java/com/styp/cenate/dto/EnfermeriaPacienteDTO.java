package com.styp.cenate.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO para listar pacientes atendidos por enfermería
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnfermeriaPacienteDTO {

    private String pkAsegurado;
    private String numDoc;
    private String apellidosNombres;
    private Integer edad;
    private String sexo;
    private String telefono;

    // Información de la última atención
    private Long ultimaAtencionId;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime ultimaFechaAtencion;

    private String ultimaTipoAtencion;
    private String ultimaDiagnosticoPrincipal;

    // Contadores
    private Long totalAtenciones;

    // Estado clínico
    private Boolean requiereTelemonitoreo;
    private String ipress;
}
