package com.styp.cenate.model;
import lombok.Data;

import jakarta.persistence.*;
import lombok.*;
import com.styp.cenate.model.id.PersonalTipoId;

@Entity
@Table(name = "dim_personal_tipo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class PersonalTipo {

    @EmbeddedId
    private PersonalTipoId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idPers")
    @JoinColumn(name = "id_pers")
    private PersonalCnt personal;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idTipPers")
    @JoinColumn(name = "id_tip_pers")
    private DimTipoPersonal tipoPersonal;
}
