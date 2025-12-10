package com.styp.cenate.model.formdiag;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Catálogo de necesidades
 * Tabla: form_diag_cat_necesidad
 */
@Entity
@Table(name = "form_diag_cat_necesidad")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormDiagCatNecesidad {

    @Id
    @Column(name = "id_necesidad")
    private Integer idNecesidad;

    @Column(name = "codigo", length = 20)
    private String codigo;

    @Column(name = "descripcion", length = 200)
    private String descripcion;

    @Column(name = "categoria", length = 20)
    private String categoria; // INF_FIS, INF_TEC, EQUIP, CONECT
}
