package styp.com.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import styp.com.cenate.model.id.PersonalProfId;

@Entity
@Table(name = "dim_personal_prof")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
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