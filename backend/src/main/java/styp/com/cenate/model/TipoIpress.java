package styp.com.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.OffsetDateTime;

@Entity
@Table(name = "dim_tipo_ipress")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TipoIpress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tip_ipress")
    private Long id;

    @Column(name = "desc_tip_ipress", nullable = false)
    private String descripcion;

    @Column(name = "stat_tip_ipress", nullable = false)
    private String estado;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime creado;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime actualizado;
}