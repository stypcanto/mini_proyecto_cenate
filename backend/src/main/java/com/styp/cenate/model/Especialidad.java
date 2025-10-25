package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.OffsetDateTime;

/**
 * 🩺 Entidad que representa las especialidades médicas o profesionales.
 * Tabla: dim_especialidad
 * Relaciona Profesión y PersonalCnt.
 */
@Entity
@Table(name = "dim_especialidad")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"profesion", "personalCnt"})
public class Especialidad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_esp")
    private Long idEsp;

    @Column(name = "desc_esp", nullable = false)
    private String descripcion;

    @Column(name = "stat_esp", nullable = false, length = 1)
    @Builder.Default
    private String estado = "A"; // A=Activo, I=Inactivo

    @CreationTimestamp
    @Column(name = "created_at", updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime updatedAt;

    // 🔗 Profesión asociada (obligatoria)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_prof", nullable = false)
    private Profesion profesion;

    // 🔗 Personal CNT asociado (opcional)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pers")
    private PersonalCnt personalCnt;

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }
}