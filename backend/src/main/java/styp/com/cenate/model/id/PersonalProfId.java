package styp.com.cenate.model.id;

import jakarta.persistence.Embeddable;
import lombok.*;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class PersonalProfId implements Serializable {
    private Long idPers;
    private Long idProf;
}