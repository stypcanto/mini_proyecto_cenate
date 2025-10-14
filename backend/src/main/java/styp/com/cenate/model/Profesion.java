package styp.com.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "dim_profesiones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Profesion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "id_prof")
    private Long idProf;

    @Column(name = "desc_prof", nullable = false, length = 150)
    private String descProf;

    @Builder.Default // ✅ Esto elimina el warning de Lombok
    @Column(name = "stat_prof", nullable = false, length = 1)
    private String statProf = "A"; // A=Activo, I=Inactivo

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updateAt;

    public boolean isActivo() {
        return "A".equalsIgnoreCase(statProf);
    }
}