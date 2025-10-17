package com.styp.cenate.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FrmTransfImgRequest {

    private Long idIpress;
    private Long idAreaHosp;
    private Long idTipProced;
    private Long idProced;

    private boolean requiereReferencia;
    private String codRefe;
    private String descRefe;

    private String estado;
}