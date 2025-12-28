package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Entidad: Detalle de solicitud de turnos por especialidad
 * Cada registro representa la cantidad de turnos solicitados para una especialidad específica
 */
@Entity
@Table(name = "solicitud_turnos_detalle", schema = "public")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"solicitud"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class SolicitudTurnosDetalle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "id_detalle")
    private Long idDetalle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_solicitud", nullable = false)
    private SolicitudTurnosMensual solicitud;

    @Column(name = "id_servicio", nullable = false)
    private Integer idServicio;

    @Column(name = "cantidad_turnos", nullable = false)
    @Builder.Default
    private Integer cantidadTurnos = 0;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "horario_preferido", length = 20)
    private String horarioPreferido; // MAÑANA, TARDE, NOCHE, CUALQUIERA

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
