package styp.com.cenate.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "dim_personal_cnt")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PersonalCnt {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pers")
    private Long idPers;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_tip_doc", nullable = false)
    private TipoDocumento tipoDocumento;
    
    @Column(name = "num_doc_pers", nullable = false, length = 20)
    private String numDocPers;
    
    @Column(name = "per_pers", nullable = false, length = 255)
    private String perPers;
    
    @Column(name = "stat_pers", nullable = false, length = 1)
    private String statPers;
    
    @Column(name = "fech_naci_pers")
    private LocalDate fechNaciPers;
    
    @Column(name = "gen_pers", length = 1)
    private String genPers;
    
    @Column(name = "movil_pers", length = 20)
    private String movilPers;
    
    @Column(name = "email_pers", length = 100)
    private String emailPers;
    
    @Column(name = "email_corp_pers", length = 100)
    private String emailCorpPers;
    
    @Column(name = "cmp", length = 20)
    private String cmp;
    
    @Column(name = "cod_plan_rem", length = 50)
    private String codPlanRem;
    
    @Column(name = "direc_pers", length = 255)
    private String direcPers;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_reg_lab")
    private RegimenLaboral regimenLaboral;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_area")
    private Area area;
    
    @Column(name = "id_usuario")
    private Long idUsuario;
    
    @CreationTimestamp
    @Column(name = "create_at", nullable = false, updatable = false)
    private LocalDateTime createAt;
    
    @UpdateTimestamp
    @Column(name = "update_at", nullable = false)
    private LocalDateTime updateAt;
}
