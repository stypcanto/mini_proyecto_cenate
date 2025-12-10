package com.styp.cenate.model.formdiag;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Catálogo de prioridades
 * Tabla: form_diag_cat_prioridad
 */
@Entity
@Table(name = "form_diag_cat_prioridad")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormDiagCatPrioridad {

    @Id
    @Column(name = "id_prioridad")
    private Integer idPrioridad;

    @Column(name = "codigo", length = 20)
    private String codigo;

    @Column(name = "nombre", length = 50)
    private String nombre;
}
