package com.styp.cenate.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * DTO para crear una nueva atención clínica (escritura)
 *
 * @author Claude Code + Styp Canto Rondón
 * @version 2.0.0
 * @since 2026-01-03
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AtencionClinicaCreateDTO {

    // ========== DATOS DE ATENCIÓN (OBLIGATORIOS) ==========

    @NotBlank(message = "El PK del asegurado es obligatorio")
    private String pkAsegurado;

    private OffsetDateTime fechaAtencion;

    @NotNull(message = "El ID de IPRESS es obligatorio")
    private Long idIpress;

    @NotNull(message = "El tipo de atención es obligatorio")
    private Long idTipoAtencion;

    // ========== DATOS OPCIONALES ==========

    private Long idEspecialidad;
    private Long idServicio;
    private Long idEstrategia;

    // ========== DATOS CLÍNICOS ==========

    @Size(max = 5000, message = "El motivo de consulta no puede exceder 5000 caracteres")
    private String motivoConsulta;

    @Size(max = 5000, message = "Los antecedentes no pueden exceder 5000 caracteres")
    private String antecedentes;

    @Size(max = 5000, message = "El diagnóstico no puede exceder 5000 caracteres")
    private String diagnostico;

    @Size(max = 5000, message = "Los resultados clínicos no pueden exceder 5000 caracteres")
    private String resultadosClinicos;

    @Size(max = 5000, message = "Las observaciones no pueden exceder 5000 caracteres")
    private String observacionesGenerales;

    @Size(max = 5000, message = "Los datos de seguimiento no pueden exceder 5000 caracteres")
    private String datosSeguimiento;

    // ========== SIGNOS VITALES ==========

    @Size(max = 20, message = "Presión arterial no puede exceder 20 caracteres")
    @Pattern(regexp = "^\\d{2,3}/\\d{2,3}$", message = "Formato de presión arterial inválido (ej: 120/80)")
    private String presionArterial;

    @DecimalMin(value = "30.0", message = "La temperatura debe ser al menos 30°C")
    @DecimalMax(value = "45.0", message = "La temperatura no puede exceder 45°C")
    private BigDecimal temperatura;

    @DecimalMin(value = "0.1", message = "El peso debe ser mayor a 0")
    @DecimalMax(value = "300.0", message = "El peso no puede exceder 300 kg")
    private BigDecimal pesoKg;

    @DecimalMin(value = "0.1", message = "La talla debe ser mayor a 0")
    @DecimalMax(value = "250.0", message = "La talla no puede exceder 250 cm")
    private BigDecimal tallaCm;

    @Min(value = 0, message = "La saturación de O2 debe ser al menos 0%")
    @Max(value = 100, message = "La saturación de O2 no puede exceder 100%")
    private Integer saturacionO2;

    @Min(value = 30, message = "La frecuencia cardíaca debe ser al menos 30 lpm")
    @Max(value = 250, message = "La frecuencia cardíaca no puede exceder 250 lpm")
    private Integer frecuenciaCardiaca;

    @Min(value = 8, message = "La frecuencia respiratoria debe ser al menos 8 rpm")
    @Max(value = 60, message = "La frecuencia respiratoria no puede exceder 60 rpm")
    private Integer frecuenciaRespiratoria;

    // ========== INTERCONSULTA ==========

    @NotNull(message = "Debe indicar si tiene orden de interconsulta")
    @Builder.Default
    private Boolean tieneOrdenInterconsulta = false;

    private Long idEspecialidadInterconsulta;

    @Pattern(regexp = "^(PRESENCIAL|VIRTUAL)$", message = "La modalidad debe ser PRESENCIAL o VIRTUAL")
    private String modalidadInterconsulta;

    // ========== TELEMONITOREO ==========

    @NotNull(message = "Debe indicar si requiere telemonitoreo")
    @Builder.Default
    private Boolean requiereTelemonitoreo = false;

    // ========== VALIDACIONES PERSONALIZADAS ==========

    /**
     * Valida que si tiene interconsulta, tenga especialidad y modalidad
     */
    @AssertTrue(message = "Si tiene interconsulta, debe especificar especialidad y modalidad")
    public boolean isInterconsultaValida() {
        if (Boolean.TRUE.equals(tieneOrdenInterconsulta)) {
            return idEspecialidadInterconsulta != null && modalidadInterconsulta != null;
        }
        return true;
    }
}
