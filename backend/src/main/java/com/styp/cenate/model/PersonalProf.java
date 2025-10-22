package com.styp.cenate.model;
import lombok.Data;

import jakarta.persistence.*;
import lombok.*;
import com.styp.cenate.model.id.PersonalProfId;

@Entity
@Table(name = "dim_personal_prof")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class PersonalProf {

    @EmbeddedId
    private PersonalProfId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idPers")
    @JoinColumn(name = "id_pers")
    private PersonalCnt personal;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idProf")
    @JoinColumn(name = "id_prof")
    private Profesion profesion;
}
