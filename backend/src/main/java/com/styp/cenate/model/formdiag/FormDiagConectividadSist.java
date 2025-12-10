package com.styp.cenate.model.formdiag;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Conectividad y sistemas del formulario de diagnóstico
 * Tabla: form_diag_conectividad_sist
 */
@Entity
@Table(name = "form_diag_conectividad_sist")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormDiagConectividadSist {

    @Id
    @Column(name = "id_formulario")
    private Integer idFormulario;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "id_formulario")
    private FormDiagFormulario formulario;

    // 5.1 Conectividad
    @Column(name = "p_5_1_1_acceso_internet")
    private Boolean accesoInternet;

    @Column(name = "p_5_1_2_conexion_estable")
    private Boolean conexionEstable;

    @Column(name = "p_5_1_3_sistema_energia")
    private Boolean sistemaEnergia;

    @Column(name = "p_5_1_4_puntos_red")
    private Boolean puntosRed;

    @Column(name = "p_5_1_5_red_wifi")
    private Boolean redWifi;

    @Column(name = "tipo_conexion", length = 100)
    private String tipoConexion;

    @Column(name = "proveedor_internet", length = 100)
    private String proveedorInternet;

    @Column(name = "velocidad_contratada")
    private BigDecimal velocidadContratada;

    @Column(name = "velocidad_real")
    private BigDecimal velocidadReal;

    @Column(name = "puntos_red_disponibles")
    private Integer puntosRedDisponibles;

    // 5.2 Sistemas de información
    @Column(name = "p_5_2_1_essi")
    private Boolean essi;

    @Column(name = "p_5_2_2_pacs")
    private Boolean pacs;

    @Column(name = "p_5_2_3_anatpat")
    private Boolean anatpat;

    @Column(name = "p_5_2_4_videoconf")
    private Boolean videoconferencia;

    @Column(name = "p_5_2_5_citas_linea")
    private Boolean citasLinea;

    @Column(name = "p_5_2_6_interoperable_desc", columnDefinition = "TEXT")
    private String otroSistemaInteroperable;

    // 5.3 Seguridad de la información
    @Column(name = "p_5_3_1_confidencialidad")
    private Boolean confidencialidad;

    @Column(name = "p_5_3_2_integridad")
    private Boolean integridad;

    @Column(name = "p_5_3_3_disponibilidad")
    private Boolean disponibilidad;

    @Column(name = "p_5_3_4_planes_cont")
    private Boolean planesContingencia;

    @Column(name = "p_5_3_5_backup")
    private Boolean backup;

    @Column(name = "p_5_3_6_consentimiento")
    private Boolean consentimiento;

    @Column(name = "p_5_3_7_ley_29733")
    private Boolean ley29733;
}
