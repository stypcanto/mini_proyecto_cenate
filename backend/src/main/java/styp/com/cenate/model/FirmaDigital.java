package styp.com.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "dim_firma_digital")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class FirmaDigital {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "id_firm_dig")
    private Long idFirmDig;

    @Column(name = "desc_firm_dig", nullable = false, length = 200)
    private String descFirmDig;

    @Column(name = "ruta_archivo", length = 255)
    private String rutaArchivo; // Ruta del archivo en disco o URL

    @Builder.Default // ✅ mantiene el valor por defecto "A" al usar el builder
    @Column(name = "stat_firm_dig", nullable = false, length = 1)
    private String statFirmDig = "A";

    @CreationTimestamp
    @Column(name = "create_at", updatable = false)
    private LocalDateTime createAt;

    @UpdateTimestamp
    @Column(name = "update_at")
    private LocalDateTime updateAt;

    public boolean isActivo() {
        return "A".equalsIgnoreCase(statFirmDig);
    }
}