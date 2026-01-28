package com.styp.cenate.dto.bolsas;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.Map;

/**
 * DTO para respuestas de errores de importación
 * Mapea datos de audit_errores_importacion_bolsa (v2.1.0)
 *
 * @version v1.0.0
 * @since 2026-01-28
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditErrorImportacionDTO {

    @JsonProperty("id_error")
    private Long idError;

    @JsonProperty("id_carga_historial")
    private Long idCargaHistorial;

    @JsonProperty("numero_fila")
    private Integer numeroFila;

    @JsonProperty("dni_paciente")
    private String pacienteDni;

    @JsonProperty("nombre_paciente")
    private String nombrePaciente;

    @JsonProperty("especialidad")
    private String especialidad;

    @JsonProperty("ipress")
    private String ipress;

    @JsonProperty("tipo_error")
    private String tipoError; // DUPLICADO|VALIDACION|CONSTRAINT|OTRO

    @JsonProperty("descripcion_error")
    private String descripcionError;

    @JsonProperty("datos_excel_json")
    private Map<String, Object> datosExcelJson;

    @JsonProperty("fecha_creacion")
    private OffsetDateTime fechaCreacion;
}
