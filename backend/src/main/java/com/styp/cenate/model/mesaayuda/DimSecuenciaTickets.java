package com.styp.cenate.model.mesaayuda;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entidad JPA para secuencia de numeración de tickets
 * Tabla: dim_secuencia_tickets
 *
 * Mantiene el contador de tickets por año para generar números únicos
 * con formato XXX-YYYY (ej: 001-2026, 002-2026, etc)
 *
 * Estrategia:
 * - Un registro por año
 * - Campo contador incrementa cada vez que se crea un ticket
 * - Permite búsqueda y trazabilidad mediante número único
 *
 * @author Styp Canto Rondón
 * @version v1.64.1 (2026-02-18)
 * @since 2026-02-18
 */
@Entity
@Table(
    name = "dim_secuencia_tickets",
    schema = "public",
    indexes = {
        @Index(name = "idx_secuencia_tickets_anio", columnList = "anio")
    }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DimSecuenciaTickets {

    /**
     * ID único del registro de secuencia
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Año para el que se contabiliza la secuencia
     * Único por año para evitar conflictos
     */
    @Column(nullable = false, unique = true)
    private Integer anio;

    /**
     * Contador actual para ese año
     * Se incrementa cada vez que se genera un nuevo ticket
     */
    @Column(nullable = false)
    private Integer contador;

    /**
     * Timestamp de creación del registro
     */
    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    /**
     * Timestamp de última actualización del contador
     */
    @Column(nullable = false)
    private LocalDateTime fechaActualizacion;

    @PrePersist
    protected void onCreate() {
        if (fechaCreacion == null) {
            fechaCreacion = LocalDateTime.now();
        }
        if (fechaActualizacion == null) {
            fechaActualizacion = LocalDateTime.now();
        }
        if (contador == null) {
            contador = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }
}
