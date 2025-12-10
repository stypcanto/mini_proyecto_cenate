package com.styp.cenate.model.formdiag;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Datos generales del formulario de diagnóstico
 * Tabla: form_diag_datos_generales
 */
@Entity
@Table(name = "form_diag_datos_generales")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormDiagDatosGenerales {

    @Id
    @Column(name = "id_formulario")
    private Integer idFormulario;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "id_formulario")
    private FormDiagFormulario formulario;

    // Datos del Director de la IPRESS
    @Column(name = "director_nombre", length = 200)
    private String directorNombre;

    @Column(name = "director_correo", length = 150)
    private String directorCorreo;

    @Column(name = "director_telefono", length = 20)
    private String directorTelefono;

    // Datos del Responsable/Coordinador de Telesalud
    @Column(name = "resp_telesalud_nombre", length = 200)
    private String respTelesaludNombre;

    @Column(name = "resp_telesalud_correo", length = 150)
    private String respTelesaludCorreo;

    @Column(name = "resp_telesalud_telefono", length = 20)
    private String respTelesaludTelefono;

    // Datos adicionales
    @Column(name = "poblacion_adscrita")
    private Integer poblacionAdscrita;

    @Column(name = "promedio_atenciones_mensuales")
    private BigDecimal promedioAtencionesMensuales;
}
