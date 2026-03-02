package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * 📋 Entidad para estados de horario.
 * Tabla: dim_horario_estado
 *
 * Estados posibles:
 * 1 - INICIADO: Horario creado
 * 2 - EN PROCESO: Horario en ejecución
 * 3 - ANULADO: Horario cancelado
 * 4 - TERMINADO: Horario finalizado
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-03-02
 */
@Entity
@Table(name = "dim_horario_estado")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class DimHorarioEstado {

    @Id
    @EqualsAndHashCode.Include
    @Column(name = "id_estado")
    private Short idEstado;

    @Column(name = "nombre_estado", nullable = false, length = 30)
    private String nombreEstado;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "activo")
    @Builder.Default
    private Boolean activo = true;
}
