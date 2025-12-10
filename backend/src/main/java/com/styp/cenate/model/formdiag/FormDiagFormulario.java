package com.styp.cenate.model.formdiag;

import com.styp.cenate.model.Ipress;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entidad principal del formulario de diagnóstico situacional de Telesalud
 * Tabla: form_diag_formulario
 */
@Entity
@Table(name = "form_diag_formulario")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormDiagFormulario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_formulario")
    private Integer idFormulario;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_ipress", nullable = false)
    private Ipress ipress;

    @Column(name = "anio")
    private Integer anio;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_envio")
    private LocalDateTime fechaEnvio;

    @Column(name = "estado", length = 20, nullable = false)
    private String estado; // EN_PROCESO, ENVIADO, APROBADO, RECHAZADO

    @Column(name = "usuario_registro", length = 100)
    private String usuarioRegistro;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @PrePersist
    protected void onCreate() {
        if (fechaCreacion == null) {
            fechaCreacion = LocalDateTime.now();
        }
        if (estado == null) {
            estado = "EN_PROCESO";
        }
    }

    // Relaciones OneToOne con las secciones del formulario
    @OneToOne(mappedBy = "formulario", cascade = CascadeType.ALL, orphanRemoval = true)
    private FormDiagDatosGenerales datosGenerales;

    @OneToOne(mappedBy = "formulario", cascade = CascadeType.ALL, orphanRemoval = true)
    private FormDiagRecursosHumanos recursosHumanos;

    @OneToOne(mappedBy = "formulario", cascade = CascadeType.ALL, orphanRemoval = true)
    private FormDiagInfraFis infraestructuraFisica;

    @OneToOne(mappedBy = "formulario", cascade = CascadeType.ALL, orphanRemoval = true)
    private FormDiagInfraTec infraestructuraTecnologica;

    @OneToOne(mappedBy = "formulario", cascade = CascadeType.ALL, orphanRemoval = true)
    private FormDiagConectividadSist conectividadSistemas;
}
