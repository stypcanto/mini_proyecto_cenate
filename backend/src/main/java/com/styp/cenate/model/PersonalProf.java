package com.styp.cenate.model;

import com.styp.cenate.model.id.PersonalProfId;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 🔹 Entidad que representa la tabla dim_personal_prof
 * Relaciona a una persona (PersonalCnt) con una profesión y especialidad,
 * incluyendo su RNE y estado de actividad.
 */
@Entity
@Table(name = "dim_personal_prof")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonalProf {

    @EmbeddedId
    private PersonalProfId id; // 🔗 PK compuesta: id_pers + id_prof

    @Column(name = "rne_prof", length = 50)
    private String rneProf;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idPers")
    @JoinColumn(name = "id_pers")
    private PersonalCnt personal;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idProf")
    @JoinColumn(name = "id_prof")
    private Profesion profesion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_esp")
    private Especialidad especialidad;

    @Column(name = "stat_pers_prof", length = 1)
    @Builder.Default
    private String estado = "A"; // A = Activo, I = Inactivo

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
