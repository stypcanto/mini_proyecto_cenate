package com.styp.cenate.model.view;

import jakarta.persistence.*;
import lombok.*;

/**
 * 🧭 Vista de módulos MBAC (basada en dim_modulo)
 */
@Entity
@Table(name = "dim_modulo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModuloView {

    @Id
    @Column(name = "id_modulo")
    private Long idModulo;

    @Column(name = "nombre_modulo")
    private String nombreModulo;

    private String descripcion;
    private String icono;
    private Boolean activo;
}