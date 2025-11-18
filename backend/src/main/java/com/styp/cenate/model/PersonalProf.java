package com.styp.cenate.model;

import com.styp.cenate.model.id.PersonalProfId;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

/**
 * 🔹 Entidad que representa la tabla dim_personal_prof.
 * Relaciona a una persona (PersonalCnt) con una profesión y especialidad,
 * incluyendo su RNE y estado de actividad.
 */
@Entity
@Table(name = "dim_personal_prof", schema = "public")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
//@ToString(exclude = {"personal", "profesion", "especialidad"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class PersonalProf {

    // ==========================================================
    // 🔗 Clave primaria compuesta
    // ==========================================================
    @EmbeddedId
    @EqualsAndHashCode.Include
    private PersonalProfId id; // PK compuesta: id_pers + id_prof

    // ==========================================================
    // 🧾 Datos complementarios
    // ==========================================================
    @Column(name = "rne_prof", length = 50)
    private String rneProf;

    @Column(name = "desc_prof_otro", columnDefinition = "TEXT")
    private String descProfOtro;  // Descripción cuando selecciona "OTRO"

    @Builder.Default
    @Column(name = "stat_pers_prof", length = 1, nullable = false)
    private String estado = "A"; // A = Activo, I = Inactivo

    // ==========================================================
    // 🔗 Relaciones
    // ==========================================================

    /** Relación con el personal (muchos a uno) */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("idPers")
    @JoinColumn(name = "id_pers", nullable = false)
    private PersonalCnt personal;

    /** Relación con la profesión (muchos a uno) */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("idProf")
    @JoinColumn(name = "id_prof", nullable = false)
    private Profesion profesion;

    /** Relación con la especialidad/servicio ESSI (opcional) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_servicio")
    private DimServicioEssi servicioEssi;

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
    // 🧩 Métodos utilitarios
    // ==========================================================
    public boolean isActivo() {
        return "A".equalsIgnoreCase(estado);
    }

    public String getDescripcionCompleta() {
//        String prof = (profesion != null) ? profesion.getDescProf() : "—";
//        String esp = (especialidad != null) ? especialidad.getDescEsp() : "";
//        return esp.isBlank() ? prof : prof + " / " + esp;
    	return "";
    }
}
