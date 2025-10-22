package com.styp.cenate.model.id;
import lombok.Data;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.Objects;

/**
 * 🆔 Clave compuesta para la entidad PersonalFirma.
 * Mapea correctamente las columnas reales de la tabla: dim_personal_firma
 */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class PersonalFirmaId implements Serializable {

    @Column(name = "id_pers")
    private Long idPersonal;

    @Column(name = "id_firm_dig")
    private Long idFirmaDigital;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PersonalFirmaId that)) return false;
        return Objects.equals(idPersonal, that.idPersonal) &&
                Objects.equals(idFirmaDigital, that.idFirmaDigital);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idPersonal, idFirmaDigital);
    }
}
