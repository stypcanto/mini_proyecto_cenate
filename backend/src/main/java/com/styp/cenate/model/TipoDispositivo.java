package com.styp.cenate.model;
import lombok.Data;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * ⚙️ Entidad que representa los tipos de dispositivo usados en las firmas digitales.
 * Corresponde a la tabla: dim_tipo_dispositivo
 */
@Entity
@Table(name = "dim_tipo_dispositivo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Data
public class TipoDispositivo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "id_tip_dis")
    private Long idTipDis;

    @Column(name = "desc_tip_dis", nullable = false, length = 100)
    private String descTipDis; // Ej: TOKEN, SMARTCARD, SOFTWARE, etc.

    @Column(name = "marca", length = 100)
    private String marca;

    @Builder.Default
    @Column(name = "estado", nullable = false, length = 1)
    private String estado = "A";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updateAt;

    public boolean isActivo() {
        return "A".equalsIgnoreCase(estado);
    }
}
