package com.styp.cenate.model.formdiag;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Catálogo de estados de equipo
 * Tabla: form_diag_cat_estado_equipo
 */
@Entity
@Table(name = "form_diag_cat_estado_equipo")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormDiagCatEstadoEquipo {

    @Id
    @Column(name = "id_estado_equipo")
    private Integer idEstadoEquipo;

    @Column(name = "codigo", length = 20)
    private String codigo;

    @Column(name = "nombre", length = 50)
    private String nombre;
}
