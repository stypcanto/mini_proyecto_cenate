package com.styp.cenate.model;
import lombok.Data;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "dim_tipo_personal")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Data
public class TipoPersonal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "id_tip_pers")
    private Long idTipPers;

    @Column(name = "desc_tip_pers", nullable = false, length = 100)
    private String descTipPers;

    @Builder.Default // ✅ mantiene el valor "A" al usar el builder
    @Column(name = "stat_tip_pers", nullable = false, length = 1)
    private String statTipPers = "A";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updateAt;

    public boolean isActivo() {
        return "A".equalsIgnoreCase(statTipPers);
    }
}
