package com.styp.cenate.model.formdiag;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Infraestructura tecnológica del formulario de diagnóstico
 * Tabla: form_diag_infra_tec
 */
@Entity
@Table(name = "form_diag_infra_tec")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormDiagInfraTec {

    @Id
    @Column(name = "id_formulario")
    private Integer idFormulario;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "id_formulario")
    private FormDiagFormulario formulario;

    // 3.2 Infraestructura Tecnológica
    @Column(name = "p_3_2_1_hardware")
    private Boolean hardware;

    @Column(name = "p_3_2_2_software")
    private Boolean software;

    @Column(name = "p_3_2_3_redes")
    private Boolean redes;

    @Column(name = "p_3_2_4_almacenamiento")
    private Boolean almacenamiento;

    @Column(name = "p_3_2_5_servicios")
    private Boolean servicios;
}
