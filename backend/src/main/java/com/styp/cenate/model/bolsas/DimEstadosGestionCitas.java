package com.styp.cenate.model.bolsas;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

/**
 * Entidad JPA para Estados de Gestión de Citas
 * Tabla: dim_estados_gestion_citas
 *
 * Estados disponibles para solicitudes de citas:
 * - PENDIENTE_CITA: Paciente nuevo que ingresó a la bolsa
 * - CITADO: Paciente agendado para atención
 * - ATENDIDO_IPRESS: Paciente recibió atención en institución
 * - NO_CONTESTA: Paciente no responde a las llamadas
 * - NO_DESEA: Paciente rechaza la atención
 * - APAGADO: Teléfono del paciente apagado
 * - TEL_SIN_SERVICIO: Línea telefónica sin servicio
 * - NUM_NO_EXISTE: Teléfono registrado no existe
 * - SIN_VIGENCIA: Seguro del paciente no vigente
 * - HC_BLOQUEADA: Historia clínica bloqueada en sistema
 * - REPROG_FALLIDA: No se pudo reprogramar la cita
 *
 * @version v1.0.0
 * @since 2026-01-30
 */
@Entity
@Table(
    name = "dim_estados_gestion_citas",
    schema = "public",
    indexes = {
        @Index(name = "idx_estados_gestion_citas_cod", columnList = "cod_estado_cita"),
        @Index(name = "idx_estados_gestion_citas_stat", columnList = "stat_estado_cita")
    }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DimEstadosGestionCitas {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_estado_cita")
    private Long idEstado;

    @Column(name = "cod_estado_cita", nullable = false, unique = true, length = 50)
    private String codigoEstado;

    @Column(name = "desc_estado_cita", nullable = false)
    private String descripcionEstado;

    @Column(name = "stat_estado_cita", nullable = false, length = 1)
    private String statusEstado;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime fechaCreacion;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime fechaActualizacion;

    @PrePersist
    protected void onCreate() {
        if (fechaCreacion == null) {
            fechaCreacion = OffsetDateTime.now();
        }
        if (fechaActualizacion == null) {
            fechaActualizacion = OffsetDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = OffsetDateTime.now();
    }
}
