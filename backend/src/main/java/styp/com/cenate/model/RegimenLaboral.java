package styp.com.cenate.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "dim_regimen_laboral")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegimenLaboral {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_reg_lab")
    private Long idRegLab;

    public Long getIdRegLab() {
        return this.idRegLab;
    }

    public String getDescRegLab() {
        return this.descRegLab;
    }

    public String getStatRegLab() {
        return this.statRegLab;
    }

    public LocalDateTime getCreateAt() {
        return this.createAt;
    }

    public LocalDateTime getUpdateAt() {
        return this.updateAt;
    }

    public void setDescRegLab(String descRegLab) {
        this.descRegLab = descRegLab;
    }

    public void setStatRegLab(String statRegLab) {
        this.statRegLab = statRegLab;
    }


    @Column(name = "desc_reg_lab", nullable = false, length = 100)
    private String descRegLab;
    
    @Column(name = "stat_reg_lab", nullable = false, length = 1)
    private String statRegLab;
    
    @CreationTimestamp
    @Column(name = "create_at", nullable = false, updatable = false)
    private LocalDateTime createAt;
    
    @UpdateTimestamp
    @Column(name = "update_at", nullable = false)
    private LocalDateTime updateAt;
}
