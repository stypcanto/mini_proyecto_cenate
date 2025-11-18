package com.styp.cenate.model.id;

import jakarta.persistence.Embeddable;
import lombok.*;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class PersonalTipoId implements Serializable {
    private Long idPers;
    private Long idTipPers;
}