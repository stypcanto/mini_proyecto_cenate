package styp.com.cenate.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;

@Entity
@Table(name = "dim_personal_externo")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonalExterno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pers_ext")
    private Long idPersExt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_tip_doc", nullable = false)
    private TipoDocumento tipoDocumento;

    @Column(name = "num_doc_ext", nullable = false, length = 20)
    private String numDocExt;

    @Column(name = "nom_ext", nullable = false, length = 255)
    private String nomExt;

    @Column(name = "ape_pater_ext", nullable = false, length = 255)
    private String apePaterExt;

    @Column(name = "ape_mater_ext", nullable = false, length = 255)
    private String apeMaterExt;

    @Column(name = "fech_naci_ext", nullable = false)
    private LocalDate fechNaciExt;

    @Column(name = "gen_ext", nullable = false, length = 1)
    private String genExt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_ipress", nullable = false)
    private Ipress ipress;

    @Column(name = "movil_ext", length = 20)
    private String movilExt;

    @Column(name = "email_pers_ext", length = 100)
    private String emailPersExt;

    @Column(name = "email_corp_ext", length = 100)
    private String emailCorpExt;

    @Column(name = "email_ext", length = 100)
    private String emailExt;

    @Column(name = "inst_ext", length = 255)
    private String instExt;

    @Column(name = "id_user")
    private Long idUser;

    @Column(name = "id_usuario")
    private Integer idUsuario;

    @CreationTimestamp
    @Column(name = "create_at", nullable = false, updatable = false)
    private LocalDateTime createAt;

    @UpdateTimestamp
    @Column(name = "update_at", nullable = false)
    private LocalDateTime updateAt;

    /** 🧑 Nombre completo */
    public String getNombreCompleto() {
        StringBuilder nombre = new StringBuilder();
        if (nomExt != null && !nomExt.isBlank()) nombre.append(nomExt);
        if (apePaterExt != null && !apePaterExt.isBlank()) nombre.append(" ").append(apePaterExt);
        if (apeMaterExt != null && !apeMaterExt.isBlank()) nombre.append(" ").append(apeMaterExt);
        return nombre.toString().trim();
    }

    /** 📆 Edad calculada */
    public Integer getEdad() {
        if (fechNaciExt == null) return null;
        return Period.between(fechNaciExt, LocalDate.now()).getYears();
    }

    /** 🏥 Nombre de institución */
    public String getNombreInstitucion() {
        if (ipress != null && ipress.getDescIpress() != null) {
            return ipress.getDescIpress();
        }
        return instExt;
    }

    /** 📧 Email principal */
    public String getEmailPrincipal() {
        if (emailPersExt != null && !emailPersExt.isBlank()) return emailPersExt;
        if (emailExt != null && !emailExt.isBlank()) return emailExt;
        return emailCorpExt;
    }

    /** 👤 ID de usuario principal */
    public Long getIdUserPrincipal() {
        if (idUser != null) return idUser;
        if (idUsuario != null) return idUsuario.longValue();
        return null;
    }
}
