package com.styp.cenate.model;
import lombok.Data;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * 📄 Entidad que representa los tipos de documentos del sistema.
 * Tabla: dim_tipo_documento
 */
@Entity
@Table(name = "dim_tipo_documento")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = "personales")
@Data
public class TipoDocumento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "id_tip_doc")
    private Long idTipDoc;

    @Column(name = "desc_tip_doc", nullable = false, length = 50)
    private String descTipDoc;

    @Column(name = "stat_tip_doc", nullable = false, length = 1)
    private String statTipDoc; // 'A' = Activo, 'I' = Inactivo

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updateAt;

    // ==========================================================
    // 🔗 Relación con PersonalCnt
    // ==========================================================
    @Builder.Default
    @OneToMany(mappedBy = "tipoDocumento", fetch = FetchType.LAZY)
    private Set<PersonalCnt> personales = new HashSet<>();

    // ==========================================================
    // 🧩 Métodos utilitarios
    // ==========================================================
    /** Devuelve si el tipo de documento está activo */
    public boolean isActivo() {
        return "A".equalsIgnoreCase(this.statTipDoc);
    }

    /** Devuelve el nombre limpio (mayúsculas y sin espacios) */
    public String getNombreLimpio() {
        return descTipDoc != null ? descTipDoc.trim().toUpperCase() : "";
    }
}
