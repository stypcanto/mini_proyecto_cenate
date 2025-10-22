package com.styp.cenate.model;
import lombok.Data;

import jakarta.persistence.*;
import lombok.*;
import com.styp.cenate.model.id.PersonalFirmaId;

import java.io.Serializable;

/**
 * 🖋️ Entidad que representa la relación entre un personal y su firma digital.
 * Corresponde a la tabla: dim_personal_firma
 */
@Entity
@Table(name = "dim_personal_firma")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"personal", "firmaDigital"})
@Data
public class PersonalFirma implements Serializable {

    @EmbeddedId
    private PersonalFirmaId id;

    // 🔗 Relación con personal CNT
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idPersonal")
    @JoinColumn(name = "id_pers", referencedColumnName = "id_pers", nullable = false)
    private PersonalCnt personal;

    // 🔗 Relación con firma digital
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idFirmaDigital")
    @JoinColumn(name = "id_firm_dig", referencedColumnName = "id_firm_dig", nullable = false)
    private FirmaDigital firmaDigital;

    // 🚫 Eliminamos las columnas created_at y updated_at

    // 🔹 Métodos auxiliares
    public String getSerieFirma() {
        return (firmaDigital != null && firmaDigital.getSerieFirmDig() != null)
                ? firmaDigital.getSerieFirmDig()
                : "Sin firma";
    }

    public boolean isFirmaActiva() {
        return firmaDigital != null && firmaDigital.isActivo();
    }
}
