package styp.com.cenate.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO para personal externo (otras instituciones)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonalExternoResponse {

    private Long idPersExt;
    private TipoDocumentoResponse tipoDocumento;
    private String numDocExt;
    private String nomExt;
    private String apePaterExt;
    private String apeMaterExt;
    private String nombreCompleto;
    private LocalDate fechNaciExt;
    private Integer edad;
    private String genExt;
    private IpressResponse ipress;
    private String nombreInstitucion;
    private String movilExt;
    private String emailPersExt;
    private Long idUser;
    private LocalDateTime createAt;
    private LocalDateTime updateAt;
}
