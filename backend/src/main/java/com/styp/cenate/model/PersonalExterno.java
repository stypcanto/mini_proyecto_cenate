package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.Period;

/**
 * 🧑‍⚕️ Representa al personal externo de una IPRESS.
 * Mapea la tabla: dim_personal_externo
 */
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

    /** Tipo de documento */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_tip_doc", nullable = false)
    private TipoDocumento tipoDocumento;

    /** Número de documento */
    @Column(name = "num_doc_ext", nullable = false, length = 20)
    private String numDocExt;

    /** Nombres y apellidos */
    @Column(name = "nom_ext", nullable = false, length = 255)
    private String nomExt;

    @Column(name = "ape_pater_ext", nullable = false, length = 255)
    private String apePaterExt;

    @Column(name = "ape_mater_ext", nullable = false, length = 255)
    private String apeMaterExt;

    /** Fecha de nacimiento */
    @Column(name = "fech_naci_ext", nullable = false)
    private LocalDate fechNaciExt;

    /** Género (M, F, X) */
    @Column(name = "gen_ext", nullable = false, length = 1)
    private String genExt;

    /** IPRESS a la que pertenece */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_ipress", nullable = false)
    private Ipress ipress;

    /** Contacto */
    @Column(name = "movil_ext", length = 20)
    private String movilExt;

    @Column(name = "email_pers_ext", length = 100)
    private String emailPersExt;

    @Column(name = "email_corp_ext", length = 100)
    private String emailCorpExt;

    @Column(name = "email_ext", length = 100)
    private String emailExt;

    /** Institución externa (si no pertenece a IPRESS del sistema) */
    @Column(name = "inst_ext", length = 255)
    private String instExt;

    /** Vínculos con usuarios del sistema */
    @Column(name = "id_user")
    private Long idUser;

    @Column(name = "id_usuario")
    private Integer idUsuario;

    // ============================================================
    // 🔹 Auditoría
    // ============================================================
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    // ============================================================
    // 🔹 Métodos derivados / utilitarios
    // ============================================================

    /** 🧑 Nombre completo formateado */
    public String getNombreCompleto() {
        StringBuilder nombre = new StringBuilder();
        if (nomExt != null && !nomExt.isBlank()) nombre.append(nomExt.trim());
        if (apePaterExt != null && !apePaterExt.isBlank()) nombre.append(" ").append(apePaterExt.trim());
        if (apeMaterExt != null && !apeMaterExt.isBlank()) nombre.append(" ").append(apeMaterExt.trim());
        return nombre.toString().trim();
    }

    /** 📆 Edad calculada */
    public Integer getEdad() {
        if (fechNaciExt == null) return null;
        return Period.between(fechNaciExt, LocalDate.now()).getYears();
    }

    /** 🏥 Nombre de la institución o IPRESS */
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