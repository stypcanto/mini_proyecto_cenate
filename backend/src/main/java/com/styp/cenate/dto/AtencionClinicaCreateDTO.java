package com.styp.cenate.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * DTO para crear una nueva atención clínica
 *
 * @author Claude Code + Styp Canto Rondón
 * @version 2.0.0
 * @since 2026-01-03
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtencionClinicaCreateDTO {

    // Datos de Atención
    @NotBlank(message = "El ID del asegurado es obligatorio")
    @Size(max = 50, message = "El ID del asegurado no puede exceder 50 caracteres")
    private String pkAsegurado;

    @NotNull(message = "La fecha de atención es obligatoria")
    private OffsetDateTime fechaAtencion;

    @NotNull(message = "El ID de IPRESS es obligatorio")
    @Positive(message = "El ID de IPRESS debe ser un número positivo")
    private Long idIpress;

    @Positive(message = "El ID de especialidad debe ser un número positivo")
    private Long idEspecialidad;

    @Positive(message = "El ID de servicio debe ser un número positivo")
    private Long idServicio;

    // Datos Clínicos
    @Size(max = 5000, message = "El motivo de consulta no puede exceder 5000 caracteres")
    private String motivoConsulta;

    @Size(max = 5000, message = "Los antecedentes no pueden exceder 5000 caracteres")
    private String antecedentes;

    @Size(max = 5000, message = "El diagnóstico no puede exceder 5000 caracteres")
    private String diagnostico;

    @Size(max = 20, message = "El código CIE-10 no puede exceder 20 caracteres")
    private String cie10Codigo;

    @Size(max = 5000, message = "La recomendación del especialista no puede exceder 5000 caracteres")
    private String recomendacionEspecialista;

    @Size(max = 5000, message = "Los resultados clínicos no pueden exceder 5000 caracteres")
    private String resultadosClinicos;

    @Size(max = 5000, message = "Las observaciones generales no pueden exceder 5000 caracteres")
    private String observacionesGenerales;

    @Size(max = 5000, message = "Los datos de seguimiento no pueden exceder 5000 caracteres")
    private String datosSeguimiento;

    // Signos Vitales
    @Size(max = 20, message = "La presión arterial no puede exceder 20 caracteres")
    private String presionArterial;

    @DecimalMin(value = "30.0", message = "La temperatura debe ser mayor o igual a 30.0°C")
    @DecimalMax(value = "45.0", message = "La temperatura debe ser menor o igual a 45.0°C")
    private BigDecimal temperatura;

    @DecimalMin(value = "0.01", message = "El peso debe ser mayor a 0")
    @DecimalMax(value = "300.00", message = "El peso no puede exceder 300 kg")
    private BigDecimal pesoKg;

    @DecimalMin(value = "0.01", message = "La talla debe ser mayor a 0")
    @DecimalMax(value = "250.00", message = "La talla no puede exceder 250 cm")
    private BigDecimal tallaCm;

    @DecimalMin(value = "0.01", message = "El IMC debe ser mayor a 0")
    @DecimalMax(value = "70.00", message = "El IMC no puede exceder 70")
    private BigDecimal imc;

    @Min(value = 0, message = "La saturación de O2 debe ser mayor o igual a 0")
    @Max(value = 100, message = "La saturación de O2 no puede exceder 100%")
    private Integer saturacionO2;

    @Min(value = 30, message = "La frecuencia cardíaca debe ser mayor o igual a 30")
    @Max(value = 250, message = "La frecuencia cardíaca no puede exceder 250 ppm")
    private Integer frecuenciaCardiaca;

    @Min(value = 8, message = "La frecuencia respiratoria debe ser mayor o igual a 8")
    @Max(value = 60, message = "La frecuencia respiratoria no puede exceder 60 rpm")
    private Integer frecuenciaRespiratoria;

    // Etiquetas de Trazabilidad
    @Positive(message = "El ID de estrategia debe ser un número positivo")
    private Long idEstrategia;

    @NotNull(message = "El ID de tipo de atención es obligatorio")
    @Positive(message = "El ID de tipo de atención debe ser un número positivo")
    private Long idTipoAtencion;

    // Interconsulta
    private Boolean tieneOrdenInterconsulta;

    @Positive(message = "El ID de especialidad para interconsulta debe ser un número positivo")
    private Long idEspecialidadInterconsulta;

    @Pattern(regexp = "^(PRESENCIAL|VIRTUAL)$", message = "La modalidad debe ser 'PRESENCIAL' o 'VIRTUAL'")
    private String modalidadInterconsulta;

    // Telemonitoreo
    private Boolean requiereTelemonitoreo;

    /**
     * Validación personalizada: Si tiene orden de interconsulta,
     * debe tener especialidad y modalidad
     */
    @AssertTrue(message = "Si tiene orden de interconsulta, debe especificar especialidad y modalidad")
    private boolean isInterconsultaValida() {
        if (Boolean.TRUE.equals(tieneOrdenInterconsulta)) {
            return idEspecialidadInterconsulta != null && modalidadInterconsulta != null;
        }
        return true;
    }
}
