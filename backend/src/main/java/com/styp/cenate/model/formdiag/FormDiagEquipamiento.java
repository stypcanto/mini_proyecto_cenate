package com.styp.cenate.model.formdiag;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Equipamiento del formulario de diagnóstico
 * Tabla: form_diag_equipamiento
 */
@Entity
@Table(name = "form_diag_equipamiento")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormDiagEquipamiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_form_equip")
    private Integer idFormEquip;

    @Column(name = "id_formulario", nullable = false)
    private Integer idFormulario;

    @Column(name = "id_equipamiento", nullable = false)
    private Integer idEquipamiento;

    @Column(name = "disponible")
    private Boolean disponible;

    @Column(name = "cantidad")
    private Integer cantidad;

    @Column(name = "id_estado_equipo")
    private Integer idEstadoEquipo;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    // Relación para obtener descripción del equipamiento
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_equipamiento", insertable = false, updatable = false)
    private FormDiagCatEquipamiento equipamiento;

    // Relación para obtener descripción del estado
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_estado_equipo", insertable = false, updatable = false)
    private FormDiagCatEstadoEquipo estadoEquipo;
}
