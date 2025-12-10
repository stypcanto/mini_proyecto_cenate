package com.styp.cenate.model.formdiag;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Recursos humanos del formulario de diagnóstico
 * Tabla: form_diag_recursos_humanos
 */
@Entity
@Table(name = "form_diag_recursos_humanos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormDiagRecursosHumanos {

    @Id
    @Column(name = "id_formulario")
    private Integer idFormulario;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "id_formulario")
    private FormDiagFormulario formulario;

    // 2.1.1 ¿Coordinador designado?
    @Column(name = "p_2_1_1_coord_designado")
    private Boolean coordDesignado;

    // Datos del coordinador (si está designado)
    @Column(name = "coord_nombre_completo", length = 200)
    private String coordNombreCompleto;

    @Column(name = "coord_correo", length = 150)
    private String coordCorreo;

    @Column(name = "coord_celular", length = 20)
    private String coordCelular;

    // 2.1.2 ¿Personal de apoyo asignado?
    @Column(name = "p_2_1_2_personal_apoyo")
    private Boolean personalApoyo;

    // 2.2 Capacitación y competencias
    @Column(name = "p_2_2_1_capacitacion_tic")
    private Boolean capacitacionTic;

    @Column(name = "p_2_2_2_conoce_normativa")
    private Boolean conoceNormativa;

    @Column(name = "p_2_2_3_alfabetizacion_digital")
    private Boolean alfabetizacionDigital;

    @Column(name = "p_2_2_4_plan_capacitacion")
    private Boolean planCapacitacion;

    @Column(name = "num_capacitaciones_ultimo_anio")
    private Integer numCapacitacionesUltimoAnio;

    @Column(name = "necesidades_capacitacion_texto", columnDefinition = "TEXT")
    private String necesidadesCapacitacionTexto;
}
