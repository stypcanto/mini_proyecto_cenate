package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 📋 Entidad para Estados de Gestión de Citas
 * v1.33.0 - Gestión centralizada de estados de citas de pacientes
 *
 * Mapea tabla: public.dim_estados_gestion_citas
 *
 * Estados iniciales (10):
 * - CITADO: Paciente agendado para atención
 * - ATENDIDO_IPRESS: Atendido por IPRESS
 * - NO_CONTESTA: Paciente no responde
 * - SIN_VIGENCIA: Sin vigencia de Seguro
 * - APAGADO: Teléfono apagado
 * - NO_DESEA: Paciente rechaza atención
 * - REPROG_FALLIDA: Reprogramación fallida
 * - NUM_NO_EXISTE: Número no existe
 * - HC_BLOQUEADA: Historia clínica bloqueada
 * - TEL_SIN_SERVICIO: Teléfono sin servicio
 */
@Entity
@Table(name = "dim_estados_gestion_citas", schema = "public")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EstadoGestionCita {

    /**
     * Identificador único del estado de cita
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_estado_cita")
    private Long idEstadoCita;

    /**
     * Código único del estado (ej: CITADO, NO_CONTESTA)
     */
    @Column(name = "cod_estado_cita", nullable = false, unique = true)
    private String codEstadoCita;

    /**
     * Descripción detallada del estado de la cita
     */
    @Column(name = "desc_estado_cita", nullable = false)
    private String descEstadoCita;

    /**
     * Estado del registro: 'A' = Activo, 'I' = Inactivo
     */
    @Column(name = "stat_estado_cita", nullable = false)
    private String statEstadoCita;

    /**
     * Fecha de creación del registro (auto-generada)
     */
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    /**
     * Fecha de última actualización (auto-actualizada)
     */
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
