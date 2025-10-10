package styp.com.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO de respuesta para Personal Externo
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonalExternoResponse {
    private Integer idPersExt;
    private TipoDocumentoResponse tipoDocumento;
    private String numDocExt;
    private String nomExt;
    private String apePaterExt;
    private String apeMaterExt;
    private String nombreCompleto;
    private LocalDate fechNaciExt;
    private String genExt;
    private String movilExt;
    private String emailExt;
    private String emailCorpExt;
    private String instExt;
    private Integer idUsuario;
    private LocalDateTime createAt;
    private LocalDateTime updateAt;
}
