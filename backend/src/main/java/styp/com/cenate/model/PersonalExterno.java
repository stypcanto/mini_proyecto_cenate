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

/**
 * Entidad que representa al personal externo (no pertenece a CENATE)
 * Tabla: dim_personal_externo
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
    private Integer idPersExt;
    
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
    @Column(name = "ape_mater_ext", length = 255)
    private String apeMaterExt;
    
    /**
     * Fecha de nacimiento
     */
    @Column(name = "fech_naci_ext")
    private LocalDate fechNaciExt;
    
    /**
     * Género (M=Masculino, F=Femenino)
     */
    @Column(name = "gen_ext", length = 1)
    private String genExt;
    
    /**
     * Teléfono personal
     */
    @Column(name = "movil_ext", length = 20)
    private String movilExt;
    
    /**
     * Correo personal
     */
    @Column(name = "email_ext", length = 100)
    private String emailExt;
    
    /**
     * Correo corporativo (de su institución)
     */
    @Column(name = "email_corp_ext", length = 100)
    private String emailCorpExt;
    
    /**
     * Institución de procedencia
     */
    @Column(name = "inst_ext", length = 255)
    private String instExt;
    
    /**
     * Relación con usuario del sistema
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
}
