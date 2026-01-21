package com.styp.cenate.dto.teleekgs;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO para agrupar ECGs por asegurado
 *
 * Representa a un asegurado con TODAS sus ECGs agrupadas
 * Utilizado para mostrar una fila por asegurado en el dashboard
 * con un indicador del número total de ECGs
 *
 * @author Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-21
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AseguradoConECGsDTO {

    /**
     * Número de documento del asegurado
     */
    @JsonProperty("num_doc_paciente")
    private String numDocPaciente;

    /**
     * Nombres del asegurado
     */
    @JsonProperty("nombres_paciente")
    private String nombresPaciente;

    /**
     * Apellidos del asegurado
     */
    @JsonProperty("apellidos_paciente")
    private String apellidosPaciente;

    /**
     * Nombre completo (nombres + apellidos)
     */
    @JsonProperty("paciente_nombre_completo")
    private String pacienteNombreCompleto;

    /**
     * IPRESS que envió (del primer ECG)
     */
    @JsonProperty("nombre_ipress")
    private String nombreIpress;

    /**
     * Código IPRESS (del primer ECG)
     */
    @JsonProperty("codigo_ipress")
    private String codigoIpress;

    /**
     * Teléfono principal del paciente
     */
    @JsonProperty("telefono_principal")
    private String telefonoPrincipal;

    /**
     * Edad del paciente
     */
    @JsonProperty("edad_paciente")
    private Integer edadPaciente;

    /**
     * Género del paciente
     */
    @JsonProperty("genero_paciente")
    private String generoPaciente;

    /**
     * Número total de ECGs para este asegurado
     */
    @JsonProperty("total_ecgs")
    private Long totalEcgs;

    /**
     * Fecha del primer ECG enviado
     */
    @JsonProperty("fecha_primer_ecg")
    private LocalDateTime fechaPrimerEcg;

    /**
     * Fecha del último ECG enviado
     */
    @JsonProperty("fecha_ultimo_ecg")
    private LocalDateTime fechaUltimoEcg;

    /**
     * Estado del primer/principal ECG
     */
    @JsonProperty("estado_principal")
    private String estadoPrincipal;

    /**
     * Estado transformado para CENATE view
     */
    @JsonProperty("estado_transformado")
    private String estadoTransformado;

    /**
     * Evaluación principal (NORMAL/ANORMAL/SIN_EVALUAR)
     */
    @JsonProperty("evaluacion_principal")
    private String evaluacionPrincipal;

    /**
     * Total de ECGs por estado
     */
    @JsonProperty("ecgs_pendientes")
    private Long ecgsPendientes;

    @JsonProperty("ecgs_observadas")
    private Long ecgsObservadas;

    @JsonProperty("ecgs_atendidas")
    private Long ecgsAtendidas;

    /**
     * Lista de todas las ECGs para este asegurado
     * (completas con todos los detalles)
     */
    @JsonProperty("imagenes")
    private List<TeleECGImagenDTO> imagenes;
}
