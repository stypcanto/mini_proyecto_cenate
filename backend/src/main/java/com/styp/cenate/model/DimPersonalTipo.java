package com.styp.cenate.model;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "dim_personal_tipo", schema = "public")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DimPersonalTipo {

    @EmbeddedId
    private DimPersonalTipoId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idPers")
    @JoinColumn(name = "id_pers")
    @ToString.Exclude
    private PersonalCnt personal;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idTipoPers")
    @JoinColumn(name = "id_tip_pers")
    @ToString.Exclude
    private DimTipoPersonal tipoPersonal;
}










