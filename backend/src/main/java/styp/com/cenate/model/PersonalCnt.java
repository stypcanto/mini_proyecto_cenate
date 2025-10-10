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
 * Entidad que representa al personal interno de CENATE
 * Tabla: dim_personal_cnt
 */
@Entity
@Table(name = "dim_personal_cnt")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonalCnt {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pers")
    private Integer idPers;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_tip_doc", nullable = false)
    private TipoDocumento tipoDocumento;
    
    /**
     * Número de documento de identidad
     */
    @Column(name = "num_doc_pers", nullable = false, length = 20)
    private String numDocPers;
    
    /**
     * Nombres del personal
     */
    @Column(name = "nom_pers", nullable = false, length = 255)
    private String nomPers;
    
    /**
     * Apellido paterno del personal
     */
    @Column(name = "ape_pater_pers", nullable = false, length = 255)
    private String apePaterPers;
    
    /**
     * Apellido materno del personal
     */
    @Column(name = "ape_mater_pers", length = 255)
    private String apeMaterPers;
    
    /**
     * Periodo de inicio de trabajo (formato: YYYYMM, ejemplo: 202504)
     */
    @Column(name = "per_pers", length = 6)
    private String perPers;
    
    /**
     * Estado del personal (A=Activo, I=Inactivo)
     */
    @Column(name = "stat_pers", nullable = false, length = 1)
    private String statPers;
    
    @Column(name = "fech_naci_pers")
    private LocalDate fechNaciPers;
    
    /**
     * Género (M=Masculino, F=Femenino)
     */
    @Column(name = "gen_pers", length = 1)
    private String genPers;
    
    @Column(name = "movil_pers", length = 20)
    private String movilPers;
    
    @Column(name = "email_pers", length = 100)
    private String emailPers;
    
    @Column(name = "email_corp_pers", length = 100)
    private String emailCorpPers;
    
    /**
     * Número de colegiatura
     */
    @Column(name = "coleg_pers", length = 20)
    private String colegPers;
    
    /**
     * Código de planilla laboral
     */
    @Column(name = "cod_plan_rem", length = 50)
    private String codPlanRem;
    
    /**
     * Domicilio del personal
     */
    @Column(name = "direc_pers", length = 255)
    private String direcPers;
    
    /**
     * ✅ NUEVO: Ruta de la foto del personal
     */
    @Column(name = "foto_pers", length = 500)
    private String fotoPers;
    
    /**
     * Régimen laboral del personal
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_reg_lab")
    private RegimenLaboral regimenLaboral;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_area")
    private Area area;
    
    @Column(name = "id_usuario")
    private Integer idUsuario;
    
    @CreationTimestamp
    @Column(name = "create_at", nullable = false, updatable = false)
    private LocalDateTime createAt;
    
    @UpdateTimestamp
    @Column(name = "update_at", nullable = false)
    private LocalDateTime updateAt;
    
    /**
     * Obtiene el nombre completo del personal
     */
    public String getNombreCompleto() {
        StringBuilder nombre = new StringBuilder();
        if (nomPers != null) nombre.append(nomPers);
        if (apePaterPers != null) nombre.append(" ").append(apePaterPers);
        if (apeMaterPers != null) nombre.append(" ").append(apeMaterPers);
        return nombre.toString().trim();
    }
    
    /**
     * ✅ NUEVO: Calcula la edad actual basada en la fecha de nacimiento
     */
    public Integer getEdad() {
        if (fechNaciPers == null) return null;
        return Period.between(fechNaciPers, LocalDate.now()).getYears();
    }
}
