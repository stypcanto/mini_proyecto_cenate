package com.styp.cenate.model.id;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

/**
 * 🔹 PersonalProfId
 * Clave primaria embebida para la entidad PersonalProf.
 * Representa la PK compuesta (id_pers + id_prof).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode
@Embeddable
public class PersonalProfId implements Serializable {

    private static final long serialVersionUID = 1L;

    @Column(name = "id_pers", nullable = false)
    private Long idPers;

    @Column(name = "id_prof", nullable = false)
    private Long idProf;
}