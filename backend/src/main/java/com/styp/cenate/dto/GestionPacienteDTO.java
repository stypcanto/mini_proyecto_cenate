package com.styp.cenate.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.io.IOException;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

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

    // ✅ Serializador personalizado para OffsetDateTime (mantiene offset local sin normalizar a UTC)
    public static class OffsetDateTimeSerializer extends JsonSerializer<OffsetDateTime> {
        private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");

        @Override
        public void serialize(OffsetDateTime value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
            if (value == null) {
                gen.writeNull();
            } else {
                gen.writeString(FORMATTER.format(value));
            }
        }
    }

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
    private String telefonoAlterno;
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
    // ✅ v1.47.0: Usar serializador personalizado para mantener offset local (-05:00) sin normalizar a UTC
    @JsonProperty("fechaAsignacion")
    @JsonSerialize(using = OffsetDateTimeSerializer.class)
    private OffsetDateTime fechaAsignacion;

    // Fecha de atención médica (cuando se marca como Atendido o Deserción)
    @JsonProperty("fechaAtencion")
    @JsonSerialize(using = OffsetDateTimeSerializer.class)
    private OffsetDateTime fechaAtencion;

    // ✅ v1.50.0: Enfermedades crónicas del paciente (desde asegurado_enfermedad_cronica)
    private String[] enfermedadCronica;

    // ✅ v1.63.0: Datos clínicos de Bolsa 107
    private Long idBolsa;  // Identificador de tipo de bolsa (107, Dengue, etc.)
    private String tiempoInicioSintomas;  // "< 24 hrs", "24 - 72 hrs", "> 72 hrs" o null
    private Boolean consentimientoInformado;  // true/false/null

    // ✅ v1.76.0: Datos de ECG
    @JsonProperty("fechaTomaEKG")
    private LocalDate fechaTomaEKG;  // Fecha en que se tomó el ECG (del registro más reciente)

    @JsonProperty("esUrgente")
    private Boolean esUrgente;  // true = paciente urgente, false = normal

    // ✅ v1.76.0: Especialidad del médico asignado (para filtrar columna por especialidad)
    @JsonProperty("especialidadMedico")
    private String especialidadMedico;  // Ej: "Cardiología", "Medicina General", etc.

    // ✅ v1.104.0: Motivo de llamada de bolsa (desde dim_solicitud_bolsa.motivo_llamada_bolsa)
    @JsonProperty("motivoLlamadoBolsa")
    private String motivoLlamadoBolsa;  // Razón/motivo de la llamada o atención

    // 🏥 v1.105.0: IPRESS de Atención (diferente a la IPRESS de adscripción del asegurado)
    // Proviene de dim_solicitud_bolsa.id_ipress_atencion → dim_ipress.desc_ipress
    @JsonProperty("ipressAtencion")
    private String ipressAtencion;

    // 🏷️ CENACRON (enriquecido via JOIN con paciente_estrategia)
    @JsonProperty("esCenacron")
    private Boolean esCenacron;

    // 📋 TIPO DE CITA y ESPECIALIDAD (desde dim_solicitud_bolsa)
    @JsonProperty("tipoCita")
    private String tipoCita;  // TELECONSULTA, INTERCONSULTA, RECITA

    @JsonProperty("especialidad")
    private String especialidad;  // Para INTERCONSULTA: "MEDICINA GENERAL (SIN LABORATORIOS)"

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
