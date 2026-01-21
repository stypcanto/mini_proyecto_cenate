package com.styp.cenate.model.solicitudturnoipress;

import java.time.LocalDate;
import java.time.OffsetDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.styp.cenate.enumd.BloqueTurno;
import com.styp.cenate.model.DetalleSolicitudTurno;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "detalle_solicitud_turno_fecha", schema = "public",
       uniqueConstraints = @UniqueConstraint(name = "uq_detalle_fecha_bloque", columnNames = {"id_detalle", "fecha", "bloque"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "detalle")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class DetalleSolicitudTurnoFecha {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "id_detalle_fecha")
    private Long idDetalleFecha;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_detalle", nullable = false)
    private DetalleSolicitudTurno detalle;

    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @Enumerated(EnumType.STRING)
    @Column(name = "bloque", nullable = false, length = 10)
    private BloqueTurno bloque;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;
}
