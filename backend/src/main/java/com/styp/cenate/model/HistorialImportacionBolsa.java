package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

/**
 * 📥 Entidad que registra el historial de importaciones de Bolsas desde Excel.
 * Tabla: dim_historial_importacion_bolsa
 * v1.0.0 - Auditoría de importaciones masivas
 */
@Entity
@Table(name = "dim_historial_importacion_bolsa", schema = "public", indexes = {
    @Index(name = "idx_importacion_usuario", columnList = "usuario_id"),
    @Index(name = "idx_importacion_fecha", columnList = "fecha_importacion"),
    @Index(name = "idx_importacion_estado", columnList = "estado_importacion")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Slf4j
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class HistorialImportacionBolsa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_importacion")
    @EqualsAndHashCode.Include
    private Long idImportacion;

    @Column(name = "nombre_archivo", nullable = false, length = 255)
    private String nombreArchivo;

    @Column(name = "ruta_archivo", columnDefinition = "TEXT")
    private String rutaArchivo;

    @Column(name = "tipo_archivo", length = 50)
    private String tipoArchivo; // XLSX, XLS, CSV

    @Column(name = "tamaño_archivo")
    private Long tamañoArchivo; // en bytes

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @Column(name = "usuario_nombre", length = 255)
    private String usuarioNombre;

    @Column(name = "total_registros", nullable = false, columnDefinition = "INTEGER DEFAULT 0")
    @Builder.Default
    private Integer totalRegistros = 0;

    @Column(name = "registros_exitosos", nullable = false, columnDefinition = "INTEGER DEFAULT 0")
    @Builder.Default
    private Integer registrosExitosos = 0;

    @Column(name = "registros_fallidos", nullable = false, columnDefinition = "INTEGER DEFAULT 0")
    @Builder.Default
    private Integer registrosFallidos = 0;

    @Column(name = "estado_importacion", nullable = false, length = 20)
    @Builder.Default
    private String estadoImportacion = "EN_PROGRESO"; // EN_PROGRESO, COMPLETADA, CON_ERRORES, FALLIDA

    @Column(name = "detalles_error", columnDefinition = "TEXT")
    private String detallesError;

    @Column(name = "bolsas_importadas", nullable = false, columnDefinition = "INTEGER DEFAULT 0")
    @Builder.Default
    private Integer bolsasImportadas = 0;

    @Column(name = "solicitudes_importadas", nullable = false, columnDefinition = "INTEGER DEFAULT 0")
    @Builder.Default
    private Integer solicitudesImportadas = 0;

    @CreationTimestamp
    @Column(name = "fecha_importacion", nullable = false, updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime fechaImportacion;

    @Column(name = "fecha_finalizacion", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime fechaFinalizacion;

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;

    // ==========================================================
    // 🧩 Métodos utilitarios
    // ==========================================================

    public Integer getPorcentajeExito() {
        if (totalRegistros == null || totalRegistros == 0) return 0;
        return (int) ((registrosExitosos.doubleValue() / totalRegistros.doubleValue()) * 100);
    }

    public void marcarCompletada() {
        this.estadoImportacion = "COMPLETADA";
        this.fechaFinalizacion = OffsetDateTime.now();
        log.info("✅ Importación {} completada: {} exitosos, {} fallidos",
                 this.nombreArchivo, this.registrosExitosos, this.registrosFallidos);
    }

    public void marcarFallida(String error) {
        this.estadoImportacion = "FALLIDA";
        this.detallesError = error;
        this.fechaFinalizacion = OffsetDateTime.now();
        log.error("❌ Importación {} falló: {}", this.nombreArchivo, error);
    }

    public Long getTiempoProcesamientoMs() {
        if (fechaFinalizacion == null) {
            return java.time.temporal.ChronoUnit.MILLIS.between(fechaImportacion, OffsetDateTime.now());
        }
        return java.time.temporal.ChronoUnit.MILLIS.between(fechaImportacion, fechaFinalizacion);
    }

    public boolean isCompletada() {
        return "COMPLETADA".equalsIgnoreCase(this.estadoImportacion);
    }

    public boolean tienErrores() {
        return "CON_ERRORES".equalsIgnoreCase(this.estadoImportacion) || registrosFallidos > 0;
    }
}
