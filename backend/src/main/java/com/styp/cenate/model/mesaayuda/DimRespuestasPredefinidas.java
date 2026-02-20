package com.styp.cenate.model.mesaayuda;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entidad JPA para respuestas predefinidas de Mesa de Ayuda
 * Tabla: dim_respuestas_predefinidas_mesa_ayuda
 *
 * Contiene las respuestas predefinidas para que el personal
 * de Mesa de Ayuda responda tickets rápidamente.
 * Solo la opción "Otros" (es_otros=true) habilita texto libre.
 *
 * @author Styp Canto Rondón
 * @version v1.65.10 (2026-02-19)
 */
@Entity
@Table(
    name = "dim_respuestas_predefinidas_mesa_ayuda",
    schema = "public",
    indexes = {
        @Index(name = "idx_resp_pred_activo", columnList = "activo"),
        @Index(name = "idx_resp_pred_orden",  columnList = "orden")
    }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DimRespuestasPredefinidas {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100, unique = true)
    private String codigo;

    @Column(nullable = false, length = 500)
    private String descripcion;

    /**
     * Si TRUE, al seleccionar esta opción se habilita un campo de texto libre
     */
    @Column(name = "es_otros", nullable = false)
    private Boolean esOtros;

    @Column(nullable = false)
    private Boolean activo;

    @Column(nullable = false)
    private Integer orden;

    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @PrePersist
    protected void onCreate() {
        if (fechaCreacion == null) fechaCreacion = LocalDateTime.now();
        if (activo == null) activo = true;
        if (esOtros == null) esOtros = false;
        if (orden == null) orden = 0;
    }
}
