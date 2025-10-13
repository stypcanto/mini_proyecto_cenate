package styp.com.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 🧑‍⚕️ Entidad que representa el personal interno (CNT)
 * Incluye información personal, laboral y de usuario asociado.
 */
@Entity
@Table(name = "dim_personal_cnt")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"usuario", "area", "regimenLaboral", "tipoDocumento"})
public class PersonalCnt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "id_pers")
    private Long idPers;

    @Column(name = "nom_pers", nullable = false)
    private String nomPers;

    @Column(name = "ape_pater_pers")
    private String apePaterPers;

    @Column(name = "ape_mater_pers")
    private String apeMaterPers;

    @Column(name = "num_doc_pers", unique = true)
    private String numDocPers;

    /**
     * 📅 Fecha de nacimiento (solo fecha, sin hora)
     * Si tu base de datos usa TIMESTAMP, cambia a LocalDateTime.
     */
    @Column(name = "fech_naci_pers")
    private LocalDate fechNaciPers;

    @Column(name = "gen_pers")
    private String genPers;

    @Column(name = "movil_pers")
    private String movilPers;

    @Column(name = "email_pers")
    private String emailPers;

    @Column(name = "email_corp_pers")
    private String emailCorpPers;

    @Column(name = "stat_pers", length = 1)
    private String statPers; // 'A' = Activo, 'I' = Inactivo

    @Column(name = "foto_pers")
    private String fotoPers;

    @Column(name = "coleg_pers")
    private String colegPers;

    @Column(name = "cod_plan_rem")
    private String codPlanRem;

    @Column(name = "direc_pers")
    private String direcPers;

    @Column(name = "per_pers")
    private String perPers;

    @Column(name = "create_at")
    private LocalDateTime createAt;

    @Column(name = "update_at")
    private LocalDateTime updateAt;

    // ==========================================================
    // 🔗 Relaciones
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

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    // ==========================================================
    // 🧩 Métodos utilitarios
    // ==========================================================

    /** Devuelve el nombre completo formateado */
    public String getNombreCompleto() {
        return String.format("%s %s %s",
                safe(nomPers),
                safe(apePaterPers),
                safe(apeMaterPers)
        ).trim();
    }

    /** Evita NullPointer al concatenar nombres */
    private String safe(String valor) {
        return valor != null ? valor : "";
    }

    /** Marca el registro como actualizado */
    @PreUpdate
    public void preUpdate() {
        this.updateAt = LocalDateTime.now();
    }

    /** Marca el registro como creado */
    @PrePersist
    public void prePersist() {
        this.createAt = LocalDateTime.now();
    }
}