package com.styp.cenate.model;
import lombok.Data;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * 🧑‍⚕️ Entidad que representa al personal del CENATE.
 * Incluye información personal, profesional, laboral y de auditoría.
 */
@Entity
@Table(name = "dim_personal_cnt")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"usuario", "area", "regimenLaboral", "tipoDocumento", "profesiones", "tipos", "ocs", "firmas"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Data
public class PersonalCnt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "id_pers")
    private Long idPers;

    // ==========================================================
    // 🧍 Datos personales
    // ==========================================================
    @Column(name = "nom_pers", nullable = false, length = 100)
    private String nomPers;

    @Column(name = "ape_pater_pers", length = 100)
    private String apePaterPers;

    @Column(name = "ape_mater_pers", length = 100)
    private String apeMaterPers;

    @Column(name = "num_doc_pers", unique = true, nullable = false, length = 20)
    private String numDocPers;

    @Column(name = "fech_naci_pers")
    private LocalDate fechNaciPers;

    @Column(name = "gen_pers", length = 1)
    private String genPers; // M / F

    @Column(name = "email_pers", length = 150)
    private String emailPers;

    @Column(name = "email_corp_pers", length = 150)
    private String emailCorpPers;

    @Column(name = "movil_pers", length = 15)
    private String movilPers;

    @Column(name = "foto_pers", length = 255)
    private String fotoPers;

    @Column(name = "direc_pers", length = 255)
    private String direcPers;

    // ==========================================================
    // ⚙️ Datos laborales
    // ==========================================================
    @Column(name = "stat_pers", length = 1)
    private String statPers; // 'A' activo, 'I' inactivo

    @Column(name = "cod_plan_rem", length = 50)
    private String codPlanRem;

    @Column(name = "coleg_pers", length = 50)
    private String colegPers;

    @Column(name = "per_pers", length = 50)
    private String perPers;

    // ==========================================================
    // 📆 Auditoría
    // ==========================================================
    @CreationTimestamp
    @Column(name = "created_at", updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime updatedAt;

    // ==========================================================
    // 🔗 Relaciones principales
    // ==========================================================
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_area", nullable = false)
    private Area area;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_reg_lab")
    private RegimenLaboral regimenLaboral;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tip_doc", nullable = false)
    private TipoDocumento tipoDocumento;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", unique = true)
    private Usuario usuario;

    // ==========================================================
    // 🔗 Relaciones intermedias (1:N)
    // ==========================================================
    @Builder.Default
    @OneToMany(mappedBy = "personal", cascade = CascadeType.PERSIST, orphanRemoval = true)
    private Set<PersonalProf> profesiones = new HashSet<>();

    @Builder.Default
    @OneToMany(mappedBy = "personal", cascade = CascadeType.PERSIST, orphanRemoval = true)
    private Set<PersonalTipo> tipos = new HashSet<>();

    @Builder.Default
    @OneToMany(mappedBy = "personal", cascade = CascadeType.PERSIST, orphanRemoval = true)
    private Set<PersonalOc> ocs = new HashSet<>();

    @Builder.Default
    @OneToMany(mappedBy = "personal", cascade = CascadeType.PERSIST, orphanRemoval = true)
    private Set<PersonalFirma> firmas = new HashSet<>();

    // ==========================================================
    // 🧩 Métodos utilitarios
    // ==========================================================
    public String getNombreCompleto() {
        return String.format("%s %s %s",
                nomPers != null ? nomPers : "",
                apePaterPers != null ? apePaterPers : "",
                apeMaterPers != null ? apeMaterPers : ""
        ).trim();
    }

    public boolean isActivo() {
        return "A".equalsIgnoreCase(statPers);
    }

    public String getNombreArea() {
        return area != null ? area.getDescArea() : "—";
    }

    public String getNombreRegimen() {
        return regimenLaboral != null ? regimenLaboral.getDescRegLab() : "—";
    }

    public String getNombreTipoDocumento() {
        return tipoDocumento != null ? tipoDocumento.getDescTipDoc() : "—";
    }

    public String getFotoUrl() {
        return (fotoPers != null && !fotoPers.isBlank()) ? fotoPers : "/images/default-profile.png";
    }
}
