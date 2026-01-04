package com.styp.cenate.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO para detalle completo de un paciente con su historial de atenciones
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnfermeriaPacienteDetalleDTO {

    // Datos del paciente
    private String pkAsegurado;
    private String numDoc;
    private String apellidosNombres;
    private Integer edad;
    private String sexo;
    private String telefono;
    private String tipoPaciente;
    private String tipoSeguro;
    private String ipress;

    // Estadísticas
    private Long totalAtenciones;
    private Long atencionesEnfermeria;
    private Long atencionesMedicas;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime primeraAtencion;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime ultimaAtencion;

    // Estado
    private Boolean requiereTelemonitoreo;

    // Historial de atenciones (ordenado por fecha DESC)
    private List<AtencionClinicaResponseDTO> atenciones;
}
