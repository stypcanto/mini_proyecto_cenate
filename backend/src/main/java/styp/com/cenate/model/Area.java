package styp.com.cenate.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "dim_area")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Area {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_area")
    private Long idArea;
    
    @Column(name = "desc_area", nullable = false, length = 255)
    private String descArea;
    
    @Column(name = "stat_area", nullable = false, length = 1)
    private String statArea;
    
    @CreationTimestamp
    @Column(name = "create_at", nullable = false, updatable = false)
    private LocalDateTime createAt;
    
    @UpdateTimestamp
    @Column(name = "update_at", nullable = false)
    private LocalDateTime updateAt;
}
