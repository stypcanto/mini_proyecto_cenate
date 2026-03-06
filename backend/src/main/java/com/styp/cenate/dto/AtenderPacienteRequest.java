package com.styp.cenate.dto;

import lombok.*;
import jakarta.validation.constraints.*;
import java.util.List;

/**
 * ✅ v1.47.0: DTO para registrar atención médica (Recita + Interconsulta + Crónico)
 * ✅ v1.76.0: Campos Ficha de Enfermería
 * ✅ v1.77.0: Presión Arterial y Glucosa; retirado otraPatologia y tratamiento
 * ✅ v1.84.0: interconsultaItems con idMotivo para FK id_motivo_interconsulta
 * ✅ v1.86.0: Campos para crear solicitud_cita cuando recita es SI
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class AtenderPacienteRequest {

    // Recita (Opcional)
    private Boolean tieneRecita;
    private Integer recitaDias; // 3, 7, 15, 30, 60, 90

    // ✅ v1.86.0: Campos para crear solicitud_cita si recita es SI
    private String fecha_atencion;        // YYYY-MM-DD
    private String hora_atencion;         // HH:mm
    private Long id_personal;             // idPers del médico/personal
    private String condicion_medica;      // "Pendiente"
    private Integer estado_gestion_citas_id; // 1 (Citado)

    // Interconsulta (Opcional)
    private Boolean tieneInterconsulta;
    private String interconsultaEspecialidad;

    // ✅ v1.84.0: Lista estructurada de interconsultas con idMotivo
    private List<InterconsultaItemDTO> interconsultaItems;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InterconsultaItemDTO {
        private String especialidad;
        private Long idMotivo;       // FK → dim_motivo_interconsulta.id_motivo
        private String motivo;       // descripción texto (informativo)
    }

    // Enfermedades crónicas (Opcional)
    private Boolean esCronico;
    private List<String> enfermedades;
    private String otroDetalle;

    // ✅ v1.76.0 / v1.77.0: Campos Ficha de Enfermería (solo para rol ENFERMERIA)
    private String controlEnfermeria;  // Dispositivos CSV: "SABE UTILIZAR TENSIOMETRO, ..."
    private String imc;                // Categoría IMC: DELGADEZ, NORMAL, SOBREPESO, OBESIDAD I-II
    private String imcValor;           // Valor numérico IMC: "24.5"
    private String pesoKg;             // Peso en kg: "75.5"
    private String tallaMt;            // Talla en metros: "1.65"
    private String adherencia;         // Adherencia: ALTA, MEDIA, BAJA
    private String nivelRiesgo;        // Nivel de riesgo: BAJO, MEDIO, ALTO
    private String controlado;         // Paciente controlado: SÍ, NO
    private String observaciones;      // Observaciones libres de enfermería
    private String presionArterial;    // Presión arterial: "120/80" (sistólica/diastólica mmHg)
    private String glucosa;            // Glucosa en ayunas: "95" (mg/dL)
    private String videosApoyo;        // ✅ v1.85.2: Videos de apoyo seleccionados (CSV): "1, 2, 5"
}
