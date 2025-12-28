package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidad: Solicitud mensual de turnos de telemedicina
 * Las IPRESS externas solicitan turnos por especialidad cada mes
 */
@Entity
@Table(name = "solicitud_turnos_mensual", schema = "public")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"detalles"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class SolicitudTurnosMensual {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "id_solicitud")
    private Long idSolicitud;

    @Column(name = "periodo", nullable = false, length = 6)
    private String periodo; // YYYYMM (ej: "202602" = Febrero 2026)

    @Column(name = "id_ipress", nullable = false)
    private Long idIpress;

    @Column(name = "estado", length = 20)
    @Builder.Default
    private String estado = "BORRADOR"; // BORRADOR, ENVIADO, APROBADO, RECHAZADO

    @Column(name = "fecha_envio")
    private LocalDateTime fechaEnvio;

    @Column(name = "observaciones_generales", columnDefinition = "TEXT")
    private String observacionesGenerales;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "solicitud", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SolicitudTurnosDetalle> detalles = new ArrayList<>();

    // Helpers
    public void addDetalle(SolicitudTurnosDetalle detalle) {
        detalles.add(detalle);
        detalle.setSolicitud(this);
    }

    public void removeDetalle(SolicitudTurnosDetalle detalle) {
        detalles.remove(detalle);
        detalle.setSolicitud(null);
    }
}
