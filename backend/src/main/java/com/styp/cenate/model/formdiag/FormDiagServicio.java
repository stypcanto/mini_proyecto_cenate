package com.styp.cenate.model.formdiag;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Servicios de telesalud del formulario de diagnóstico
 * Tabla: form_diag_servicio
 */
@Entity
@Table(name = "form_diag_servicio")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormDiagServicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_form_servicio")
    private Integer idFormServicio;

    @Column(name = "id_formulario", nullable = false)
    private Integer idFormulario;

    @Column(name = "id_servicio", nullable = false)
    private Integer idServicio;

    @Column(name = "disponible")
    private Boolean disponible;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    // Relación para obtener descripción del servicio
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_servicio", insertable = false, updatable = false)
    private FormDiagCatServicioTelesalud servicio;
}
