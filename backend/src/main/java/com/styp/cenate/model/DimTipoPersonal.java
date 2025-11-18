package com.styp.cenate.model;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

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
public class DimTipoPersonal {

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
    
//    // Se agrego por el nuevo cambio de arq bd
//    @ManyToMany(mappedBy = "tipoPersonal")
//    private Set<PersonalCnt> personal = new HashSet<>();
//    
    
}
