package com.styp.cenate.model.formdiag;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Necesidades de capacitación del formulario de diagnóstico
 * Tabla: form_diag_nec_capacitacion
 */
@Entity
@Table(name = "form_diag_nec_capacitacion")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormDiagNecCapacitacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_nec_capacitacion")
    private Integer idNecCapacitacion;

    @Column(name = "id_formulario", nullable = false)
    private Integer idFormulario;

    @Column(name = "tema_capacitacion", length = 300)
    private String temaCapacitacion;

    @Column(name = "poblacion_objetivo", length = 200)
    private String poblacionObjetivo;

    @Column(name = "num_participantes")
    private Integer numParticipantes;

    @Column(name = "id_prioridad")
    private Integer idPrioridad;

    // Relación para obtener descripción de la prioridad
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_prioridad", insertable = false, updatable = false)
    private FormDiagCatPrioridad prioridad;
}
