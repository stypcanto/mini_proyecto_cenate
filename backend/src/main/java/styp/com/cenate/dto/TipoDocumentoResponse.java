package styp.com.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TipoDocumentoResponse {
    private Long idTipDoc;
    private String descTipDoc;
    private String statTipDoc;
    private LocalDateTime createAt;
    private LocalDateTime updateAt;
}
