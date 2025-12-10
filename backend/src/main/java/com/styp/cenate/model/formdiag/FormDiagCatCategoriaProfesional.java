package com.styp.cenate.model.formdiag;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Catálogo de categorías profesionales
 * Tabla: form_diag_cat_categoria_profesional
 */
@Entity
@Table(name = "form_diag_cat_categoria_profesional")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormDiagCatCategoriaProfesional {

    @Id
    @Column(name = "id")
    private Integer id;

    @Column(name = "nombre", length = 100)
    private String nombre;
}
