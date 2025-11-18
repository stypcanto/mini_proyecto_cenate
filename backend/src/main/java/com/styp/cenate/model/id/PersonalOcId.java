package com.styp.cenate.model.id;
import lombok.Data;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.Objects;

/**
 * 🆔 Clave compuesta para PersonalOc
 */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class PersonalOcId implements Serializable {

    @Column(name = "id_personal")
    private Long idPersonal;

    @Column(name = "id_oc")
    private Long idOc;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PersonalOcId that)) return false;
        return Objects.equals(idPersonal, that.idPersonal) &&
                Objects.equals(idOc, that.idOc);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idPersonal, idOc);
    }
}
