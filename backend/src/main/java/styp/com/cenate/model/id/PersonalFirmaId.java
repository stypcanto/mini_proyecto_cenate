package styp.com.cenate.model.id;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.Objects;

/**
 * 🆔 Clave compuesta para PersonalFirma
 */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonalFirmaId implements Serializable {

    @Column(name = "id_personal")
    private Long idPersonal;

    @Column(name = "id_firma")
    private Long idFirma;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PersonalFirmaId that)) return false;
        return Objects.equals(idPersonal, that.idPersonal) &&
                Objects.equals(idFirma, that.idFirma);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idPersonal, idFirma);
    }
}