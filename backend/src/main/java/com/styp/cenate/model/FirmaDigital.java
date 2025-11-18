package com.styp.cenate.model;
import lombok.Data;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 🖋️ Entidad que representa una firma digital emitida a un personal del sistema.
 * Corresponde a la tabla: dim_firma_digital
 */
@Entity
@Table(name = "dim_firma_digital")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "tipoDispositivo")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Data
public class FirmaDigital {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "id_firm_dig")
    private Long idFirmDig;

    @Column(name = "serie_firm_dig", nullable = false, unique = true)
    private String serieFirmDig;

    @Column(name = "fech_ini_firm", nullable = false)
    private LocalDate fechIniFirm;

    @Column(name = "fech_fin_firm")
    private LocalDate fechFinFirm;

    // 🔗 Relación con tipo de dispositivo
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tip_dis", nullable = false)
    private TipoDispositivo tipoDispositivo;

    @Builder.Default
    @Column(name = "stat_firm_dig", nullable = false, length = 1)
    private String statFirmDig = "A";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updateAt;

    // 🔹 Método auxiliar
    public boolean isActivo() {
        return "A".equalsIgnoreCase(statFirmDig);
    }

    public String getDescripcion() {
        return serieFirmDig + " (" + tipoDispositivo.getDescTipDis() + ")";
    }
}
