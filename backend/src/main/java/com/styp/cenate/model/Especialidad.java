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
@Table(name = "dim_especialidad", schema = "public")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
//@ToString(exclude = {"profesion", "personalCnt"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Especialidad {

    // ==========================================================
    // 🆔 Identificador principal
    // ==========================================================
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "id_esp")
    private Long idEsp;

    // ==========================================================
    // 🩺 Datos básicos
    // ==========================================================
    @Column(name = "desc_esp", nullable = false, length = 150)
    private String descEsp;

    @Builder.Default
    @Column(name = "stat_esp", nullable = false, length = 1)
    private String statEsp = "A"; // A=Activo, I=Inactivo
    
    // ID de profesión (para acceso directo sin cargar la relación)
    @Column(name = "id_prof", insertable = false, updatable = false)
    private Long idProf;
    
    // ID de personal (para relacionar especialidad con personal)
    @Column(name = "id_pers")
    private Long idPers;

    // ==========================================================
    // 🕓 Auditoría
    // ==========================================================
    @CreationTimestamp
    @Column(name = "created_at", updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime updatedAt;

    // ==========================================================
    // 🔗 Relaciones
    // ==========================================================

    /** Profesión asociada (obligatoria) */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_prof", nullable = false)
    private Profesion profesion;

    /** Personal CNT asociado (opcional) */

//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "id_pers")
//    private PersonalCnt personalCnt;

    // ==========================================================
    // 🧩 Métodos utilitarios
    // ==========================================================
    public boolean isActivo() {
        return "A".equalsIgnoreCase(statEsp);
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }
}