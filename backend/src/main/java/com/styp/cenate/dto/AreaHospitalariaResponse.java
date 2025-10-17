package com.styp.cenate.dto;

import lombok.*;
import java.time.LocalDateTime;

/**
 * DTO para dim_area_hosp.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AreaHospitalariaResponse {
    private Long idAreaHosp;
    private String codAreaHosp;
    private String descAreaHosp;
    private String abrAreaHosp;
    private String statAreaHosp;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}