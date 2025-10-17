package com.styp.cenate.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FrmTransfImgResponse {
    private Long id;
    private String descRed;
    private String descIpress;
    private String descNivelIpress;
    private String descAreaHosp;
    private String descTipProced;
    private String codProced;
    private String descProced;
    private String estado;
    private boolean requiereReferencia;
    private String codRefe;
    private String descRefe;
}