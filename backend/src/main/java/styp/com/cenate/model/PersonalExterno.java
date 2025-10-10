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

/**
 * Entidad que representa al personal externo (no pertenece a CENATE)
 * Tabla: dim_personal_externo
 * 
 * ⚠️ MODELO ACTUALIZADO para coincidir con la estructura REAL de la base de datos
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
    
    /**
     * Tipo de documento (DNI, CE, Pasaporte, etc.)
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_tip_doc", nullable = false)
    private TipoDocumento tipoDocumento;
    
    /**
     * Número de documento
     */
    @Column(name = "num_doc_ext", nullable = false, length = 20)
    private String numDocExt;
    
    /**
     * Nombres completos
     */
    @Column(name = "nom_ext", nullable = false, length = 255)
    private String nomExt;
    
    /**
     * Apellido paterno
     */
    @Column(name = "ape_pater_ext", nullable = false, length = 255)
    private String apePaterExt;
    
    /**
     * Apellido materno
     */
    @Column(name = "ape_mater_ext", nullable = false, length = 255)
    private String apeMaterExt;
    
    /**
     * Fecha de nacimiento
     */
    @Column(name = "fech_naci_ext", nullable = false)
    private LocalDate fechNaciExt;
    
    /**
     * Género (M=Masculino, F=Femenino)
     */
    @Column(name = "gen_ext", nullable = false, length = 1)
    private String genExt;
    
    /**
     * ✅ RELACIÓN CON IPRESS: Institución a la que pertenece
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_ipress", nullable = false)
    private Ipress ipress;
    
    /**
     * Teléfono móvil
     */
    @Column(name = "movil_ext", length = 20)
    private String movilExt;
    
    /**
     * Email personal (columna principal)
     */
    @Column(name = "email_pers_ext", length = 100)
    private String emailPersExt;
    
    /**
     * Email corporativo
     */
    @Column(name = "email_corp_ext", length = 100)
    private String emailCorpExt;
    
    /**
     * Email alternativo (columna legacy)
     */
    @Column(name = "email_ext", length = 100)
    private String emailExt;
    
    /**
     * Institución (texto legacy - antes de la relación con IPRESS)
     */
    @Column(name = "inst_ext", length = 255)
    private String instExt;
    
    /**
     * Relación con usuario del sistema (columna nueva)
     */
    @Column(name = "id_user")
    private Long idUser;
    
    /**
     * Relación con usuario del sistema (columna legacy)
     */
    @Column(name = "id_usuario")
    private Integer idUsuario;
    
    @CreationTimestamp
    @Column(name = "create_at", nullable = false, updatable = false)
    private LocalDateTime createAt;
    
    @UpdateTimestamp
    @Column(name = "update_at", nullable = false)
    private LocalDateTime updateAt;
    
    /**
     * Obtiene el nombre completo del personal externo
     */
    public String getNombreCompleto() {
        StringBuilder nombre = new StringBuilder();
        if (nomExt != null) nombre.append(nomExt);
        if (apePaterExt != null) nombre.append(" ").append(apePaterExt);
        if (apeMaterExt != null) nombre.append(" ").append(apeMaterExt);
        return nombre.toString().trim();
    }
    
    /**
     * Calcula la edad actual basada en la fecha de nacimiento
     */
    public Integer getEdad() {
        if (fechNaciExt == null) return null;
        return Period.between(fechNaciExt, LocalDate.now()).getYears();
    }
    
    /**
     * Obtiene el nombre de la institución
     */
    public String getNombreInstitucion() {
        return ipress != null ? ipress.getDescIpress() : instExt;
    }
    
    /**
     * Obtiene el email principal (prioriza email_pers_ext)
     */
    public String getEmailPrincipal() {
        if (emailPersExt != null && !emailPersExt.isEmpty()) return emailPersExt;
        if (emailExt != null && !emailExt.isEmpty()) return emailExt;
        return emailCorpExt;
    }
    
    /**
     * Obtiene el ID de usuario (prioriza id_user)
     */
    public Long getIdUserPrincipal() {
        if (idUser != null) return idUser;
        if (idUsuario != null) return idUsuario.longValue();
        return null;
    }
}
