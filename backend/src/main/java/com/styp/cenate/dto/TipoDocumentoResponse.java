package com.styp.cenate.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data                   // Genera getters, setters, equals, hashCode y toString
@NoArgsConstructor      // Constructor vacío
@AllArgsConstructor     // Constructor con todos los campos
@Builder                // Permite usar .builder()
public class TipoDocumentoResponse {

    private Long idTipDoc;
    private String descTipDoc;
    private String statTipDoc;       // Estado del documento
    private LocalDateTime createAt;  // Fecha de creación
    private LocalDateTime updateAt;  // Fecha de actualización
}
