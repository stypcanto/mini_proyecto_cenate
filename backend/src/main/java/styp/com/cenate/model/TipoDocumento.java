package styp.com.cenate.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "dim_tipo_documento")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TipoDocumento {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tip_doc")
    private Long idTipDoc;
    
    @Column(name = "desc_tip_doc", nullable = false, length = 50)
    private String descTipDoc;
    
    @Column(name = "stat_tip_doc", nullable = false, length = 1)
    private String statTipDoc;
    
    @CreationTimestamp
    @Column(name = "create_at", nullable = false, updatable = false)
    private LocalDateTime createAt;
    
    @UpdateTimestamp
    @Column(name = "update_at", nullable = false)
    private LocalDateTime updateAt;
}
