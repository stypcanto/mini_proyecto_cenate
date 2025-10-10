package styp.com.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TipoDocumentoResponse {
    private Long idTipDoc;
    private String descTipDoc;
    private String statTipDoc;       // Estado del documento
    private LocalDateTime createAt;  // Fecha de creación
    private LocalDateTime updateAt;  // Fecha de actualización
}
