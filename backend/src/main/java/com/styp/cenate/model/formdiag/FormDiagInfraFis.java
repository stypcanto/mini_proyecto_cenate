package com.styp.cenate.model.formdiag;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Infraestructura física del formulario de diagnóstico
 * Tabla: form_diag_infra_fis
 */
@Entity
@Table(name = "form_diag_infra_fis")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormDiagInfraFis {

    @Id
    @Column(name = "id_formulario")
    private Integer idFormulario;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "id_formulario")
    private FormDiagFormulario formulario;

    // 3.1 Infraestructura Física
    @Column(name = "p_3_1_1_espacio_fisico")
    private Boolean espacioFisico;

    @Column(name = "p_3_1_2_privacidad")
    private Boolean privacidad;

    @Column(name = "p_3_1_3_escritorio")
    private Boolean escritorio;

    @Column(name = "p_3_1_4_sillas")
    private Boolean sillas;

    @Column(name = "p_3_1_5_estantes")
    private Boolean estantes;

    @Column(name = "p_3_1_6_archivero")
    private Boolean archivero;

    @Column(name = "p_3_1_7_iluminacion")
    private Boolean iluminacion;

    @Column(name = "p_3_1_8_ventilacion")
    private Boolean ventilacion;

    @Column(name = "p_3_1_9_aire_acond")
    private Boolean aireAcondicionado;

    @Column(name = "numero_ambientes")
    private Integer numeroAmbientes;
}
