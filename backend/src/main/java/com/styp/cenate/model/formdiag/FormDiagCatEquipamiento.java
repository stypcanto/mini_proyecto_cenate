package com.styp.cenate.model.formdiag;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Catálogo de equipamiento
 * Tabla: form_diag_cat_equipamiento
 */
@Entity
@Table(name = "form_diag_cat_equipamiento")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormDiagCatEquipamiento {

    @Id
    @Column(name = "id_equipamiento")
    private Integer idEquipamiento;

    @Column(name = "codigo", length = 20)
    private String codigo;

    @Column(name = "descripcion", length = 200)
    private String descripcion;

    @Column(name = "tipo", length = 10)
    private String tipo; // INF (informático), BIO (biomédico)
}
