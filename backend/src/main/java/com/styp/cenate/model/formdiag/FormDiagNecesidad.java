package com.styp.cenate.model.formdiag;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Necesidades del formulario de diagnóstico
 * Tabla: form_diag_necesidad
 */
@Entity
@Table(name = "form_diag_necesidad")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormDiagNecesidad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_form_necesidad")
    private Integer idFormNecesidad;

    @Column(name = "id_formulario", nullable = false)
    private Integer idFormulario;

    @Column(name = "id_necesidad", nullable = false)
    private Integer idNecesidad;

    @Column(name = "cantidad_requerida")
    private Integer cantidadRequerida;

    @Column(name = "id_prioridad")
    private Integer idPrioridad;

    // Relación para obtener descripción de la necesidad
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_necesidad", insertable = false, updatable = false)
    private FormDiagCatNecesidad necesidad;

    // Relación para obtener descripción de la prioridad
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_prioridad", insertable = false, updatable = false)
    private FormDiagCatPrioridad prioridad;
}
