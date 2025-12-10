package com.styp.cenate.model.formdiag;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Personal de apoyo del formulario de diagnóstico
 * Tabla: form_diag_rh_apoyo
 */
@Entity
@Table(name = "form_diag_rh_apoyo")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormDiagRhApoyo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "id_formulario", nullable = false)
    private Integer idFormulario;

    @Column(name = "id_categoria", nullable = false)
    private Integer idCategoria;

    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;
}
