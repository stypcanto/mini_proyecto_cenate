package com.styp.cenate.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.Period;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GestionPacienteDTO {

    private Long idGestion;

    // ✅ v1.46.0: ID de SolicitudBolsa para pacientes que vienen de dim_solicitud_bolsa
    private Long idSolicitudBolsa;

    // Datos del asegurado (vienen de la relación)
    @NotBlank(message = "El pk_asegurado es obligatorio")
    private String pkAsegurado;

    // Datos que vienen de la tabla asegurados (solo lectura)
    private String numDoc;
    private String apellidosNombres;
    private String sexo;
    private Integer edad;
    private String telefono;
    private String tipoPaciente;
    private String tipoSeguro;
    @JsonProperty("ipress")
    private String ipress;  // Nombre de la IPRESS

    // Datos de gestión (editables)
    @Size(max = 50, message = "La condición no puede exceder 50 caracteres")
    private String condicion;

    @Size(max = 100, message = "La gestora no puede exceder 100 caracteres")
    private String gestora;

    private String observaciones;

    @Size(max = 100, message = "El origen no puede exceder 100 caracteres")
    private String origen;

    private Boolean seleccionadoTelemedicina;

    // Permitir que Jackson serialize en ISO 8601 completo con offset
    private OffsetDateTime fechaCreacion;

    private OffsetDateTime fechaActualizacion;

    // Fecha de asignación al médico (desde dim_solicitud_bolsa)
    @JsonProperty("fechaAsignacion")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSZZZ")
    private OffsetDateTime fechaAsignacion;

    /**
     * Calcula la edad a partir de la fecha de nacimiento
     */
    public static Integer calcularEdad(LocalDate fechaNacimiento) {
        if (fechaNacimiento == null) {
            return null;
        }
        return Period.between(fechaNacimiento, LocalDate.now()).getYears();
    }
}
