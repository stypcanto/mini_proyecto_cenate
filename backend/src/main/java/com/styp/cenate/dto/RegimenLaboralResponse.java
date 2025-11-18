package com.styp.cenate.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data               // Genera getters, setters, equals, hashCode y toString
@NoArgsConstructor  // Constructor vacío
@AllArgsConstructor // Constructor con todos los campos
@Builder            // Permite usar .builder()
public class RegimenLaboralResponse {

    private Long idRegLab;
    private String descRegLab;
    private String statRegLab;
    private LocalDateTime createAt;
    private LocalDateTime updateAt;
}
