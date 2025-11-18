package com.styp.cenate.model;
import lombok.Data;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "dim_oc")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Data
public class Oc {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "id_oc")
    private Long idOc;

    @Column(name = "desc_oc", nullable = false, length = 150)
    private String descOc;

    @Builder.Default
    @Column(name = "stat_oc", nullable = false, length = 1)
    private String statOc = "A";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updateAt;

    public boolean isActivo() {
        return "A".equalsIgnoreCase(statOc);
    }
}
