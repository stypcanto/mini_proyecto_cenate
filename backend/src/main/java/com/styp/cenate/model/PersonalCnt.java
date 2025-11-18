package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.util.Optional;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * 🧑‍⚕️ Entidad que representa al personal del CENATE.
 * Incluye información personal, profesional, laboral y de auditoría.
 * Tabla: dim_personal_cnt
 */
@Entity
@Table(name = "dim_personal_cnt", schema = "public")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {
        "usuario",
        "area",
        "regimenLaboral",
        "tipoDocumento",
        "ipress",
        "profesiones",
        "tipos",
        "ocs",
        "firmas"
        //,"especialidades"
})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class PersonalCnt {

    // ==========================================================
    // 🆔 Identificador principal
    // ==========================================================
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
    // 🕓 Auditoría
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
    @JoinColumn(name = "id_area")
    private Area area;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_reg_lab")
    private RegimenLaboral regimenLaboral;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tip_doc")
    private TipoDocumento tipoDocumento;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_ipress")
    private Ipress ipress;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", unique = true)
    private Usuario usuario;

    // ==========================================================
    // 🔗 Relaciones intermedias (1:N)
    // ==========================================================
    @Builder.Default
    @OneToMany(mappedBy = "personal", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<PersonalProf> profesiones = new HashSet<>();

    @Builder.Default
    @OneToMany(mappedBy = "personal", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<PersonalTipo> tipos = new HashSet<>();

    @Builder.Default
    @OneToMany(mappedBy = "personal", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<PersonalOc> ocs = new HashSet<>();

    @Builder.Default
    @OneToMany(mappedBy = "personal", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<PersonalFirma> firmas = new HashSet<>();

    // ==========================================================
    // 🩺 Relación con Especialidades (1:N)
    // ==========================================================
//    @Builder.Default
//    @OneToMany(mappedBy = "personalCnt", cascade = CascadeType.ALL, orphanRemoval = true)
//    private Set<Especialidad> especialidades = new HashSet<>();

    // Nueva relaciones despues del cambio
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_servicio")
    private DimServicioEssi servicioEssi;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="id_origen")
    private DimOrigenPersonal origenPersonal;
    
//    @ManyToMany(fetch = FetchType.LAZY)
//    @JoinTable(
//            name = "dim_personal_tipo",
//            joinColumns = @JoinColumn(name = "id_pers"),             // PK de personal
//            inverseJoinColumns = @JoinColumn(name = "id_tip_pers")   // PK de tipo personal
//    )
//    private Set<TipoPersonal> tipoPersonal = new HashSet<>();
    
    
    
    
    // ==========================================================
    // 🧩 Métodos utilitarios
    // ==========================================================
    public String getNombreCompleto() {
        // Obtener el primer nombre (por si hay varios nombres separados por espacio)
        String primerNombre = Optional.ofNullable(nomPers)
                .map(n -> n.trim().split("\\s+")[0])
                .orElse("");
        
        // Obtener el primer apellido paterno
        String primerApellido = Optional.ofNullable(apePaterPers)
                .map(String::trim)
                .orElse("");
        
        // Formatear a título (primera letra mayúscula, resto minúscula)
        primerNombre = formatearATitulo(primerNombre);
        primerApellido = formatearATitulo(primerApellido);
        
        // Retornar "Nombre Apellido"
        return String.format("%s %s", primerNombre, primerApellido).trim();
    }
    
    private String formatearATitulo(String texto) {
        if (texto == null || texto.isEmpty()) {
            return "";
        }
        return texto.substring(0, 1).toUpperCase() + texto.substring(1).toLowerCase();
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