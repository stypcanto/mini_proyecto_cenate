package com.styp.cenate.model.bolsas;

import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * 📋 Solicitud de Bolsas General
 * Tabla: dim_solicitud_bolsas_general
 * Almacena datos de pacientes cargados desde Excel con referencia al historial de carga
 * v1.0.0
 */
@Entity
@Table(
    name = "dim_solicitud_bolsas_general",
    schema = "public",
    indexes = {
        @Index(name = "idx_solicitud_bolsas_id_carga", columnList = "id_carga"),
        @Index(name = "idx_solicitud_bolsas_dni", columnList = "dni"),
        @Index(name = "idx_solicitud_bolsas_ipress", columnList = "cod_ipress_adscripcion"),
        @Index(name = "idx_solicitud_bolsas_fecha_registro", columnList = "fecha_registro")
    }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DimSolicitudBolsasGeneral {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "id_carga", nullable = false)
    private Long idCarga;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_carga", insertable = false, updatable = false)
    private HistorialCargaBolsas historialCargaBolsas;

    @Column(name = "id_bolsa")
    private Long idBolsa;

    @Column(name = "id_servicio")
    private Long idServicio;

    @Column(name = "fecha_preferida_no_atendida", nullable = false)
    private LocalDate fechaPreferidaNoAtendida;

    @Column(name = "tipo_documento", nullable = false, length = 20)
    private String tipoDocumento;

    @Column(name = "dni", nullable = false, length = 20)
    private String dni;

    @Column(name = "asegurado", nullable = false, length = 255)
    private String asegurado;

    @Column(name = "sexo", length = 1)
    private String sexo;

    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;

    @Column(name = "telefono_principal", length = 20)
    private String telefonoPrincipal;

    @Column(name = "telefono_alterno", length = 20)
    private String telefonoAlterno;

    @Column(name = "correo", length = 255)
    private String correo;

    @Column(name = "cod_ipress_adscripcion", length = 20)
    private String codIpressAdscripcion;

    @Column(name = "ipress_atencion", length = 20)
    private String ipressAtencion;

    @Column(name = "tipo_cita", length = 100)
    private String tipoCita;

    @Column(
        name = "fecha_registro",
        nullable = false,
        columnDefinition = "TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP"
    )
    @Builder.Default
    private OffsetDateTime fechaRegistro = OffsetDateTime.now();

}
