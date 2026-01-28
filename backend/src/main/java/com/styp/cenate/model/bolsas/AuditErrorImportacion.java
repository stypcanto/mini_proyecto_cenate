package com.styp.cenate.model.bolsas;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.Map;

/**
 * ✅ NUEVO v1.20.0: Entidad para auditoría de errores de importación
 * Almacena todos los errores detectados durante la carga de Excel
 */
@Entity
@Table(name = "audit_errores_importacion_bolsa", indexes = {
    @Index(name = "idx_errores_historial", columnList = "id_carga_historial"),
    @Index(name = "idx_errores_tipo", columnList = "tipo_error"),
    @Index(name = "idx_errores_dni", columnList = "dni_paciente"),
    @Index(name = "idx_errores_fecha", columnList = "fecha_creacion")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditErrorImportacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_error")
    private Long idError;

    @Column(name = "id_carga_historial")
    private Long idCargaHistorial;

    @Column(name = "numero_fila", nullable = false)
    private Integer numeroFila;

    @Column(name = "dni_paciente", length = 20)
    private String dniPaciente;

    @Column(name = "nombre_paciente", length = 255)
    private String nombrePaciente;

    @Column(name = "especialidad", length = 255)
    private String especialidad;

    @Column(name = "ipress", length = 20)
    private String ipress;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_error", nullable = false)
    private TipoErrorImportacion tipoError;

    @Column(name = "descripcion_error", nullable = false, columnDefinition = "TEXT")
    private String descripcionError;

    @Column(name = "datos_excel_json", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> datosExcelJson;

    @Column(name = "fecha_creacion", nullable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private OffsetDateTime fechaCreacion;

    @PrePersist
    public void prePersist() {
        if (this.fechaCreacion == null) {
            this.fechaCreacion = OffsetDateTime.now();
        }
    }

    /**
     * ✅ v1.20.0: Retorna datos de Excel como mapa inmutable (auditoría forense)
     * Previene modificaciones accidentales del snapshot de datos
     */
    public Map<String, Object> getDatosExcelJsonImmutable() {
        return datosExcelJson != null ?
            Collections.unmodifiableMap(datosExcelJson) : null;
    }
}
