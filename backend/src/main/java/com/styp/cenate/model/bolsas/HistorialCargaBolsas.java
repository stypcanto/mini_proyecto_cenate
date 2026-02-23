package com.styp.cenate.model.bolsas;

import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * 📥 Historial de cargas Excel - Módulo BOLSAS DE PACIENTES
 * Tabla: dim_historial_carga_bolsas (INDEPENDIENTE del módulo 107)
 * v1.13.4
 */
@Entity
@Table(
    name = "dim_historial_carga_bolsas",
    schema = "public",
    indexes = {
        @Index(name = "idx_historial_bolsas_fecha", columnList = "fecha_reporte DESC"),
        @Index(name = "idx_historial_bolsas_usuario", columnList = "usuario_carga"),
        @Index(name = "idx_historial_bolsas_estado", columnList = "estado_carga")
    }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HistorialCargaBolsas {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_carga")
    private Long idCarga;

    @Column(name = "nombre_archivo", nullable = false, length = 255)
    private String nombreArchivo;

    @Column(name = "hash_archivo", unique = true, length = 64, nullable = false)
    private String hashArchivo;

    @Column(name = "usuario_carga", length = 100)
    private String usuarioCarga;

    @Column(name = "id_user")
    private Long idUser;

    @Column(name = "estado_carga", length = 20)
    @Builder.Default
    private String estadoCarga = "RECIBIDO";

    @Column(name = "fecha_reporte", nullable = false)
    private LocalDate fechaReporte;

    @Column(name = "total_filas")
    @Builder.Default
    private Integer totalFilas = 0;

    @Column(name = "filas_ok")
    @Builder.Default
    private Integer filasOk = 0;

    @Column(name = "filas_error")
    @Builder.Default
    private Integer filasError = 0;

    @Column(name = "fecha_creacion", columnDefinition = "TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP")
    @Builder.Default
    private OffsetDateTime fechaCreacion = OffsetDateTime.now();

    @Column(name = "fecha_actualizacion", columnDefinition = "TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP")
    @Builder.Default
    private OffsetDateTime fechaActualizacion = OffsetDateTime.now();
}
