package styp.com.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PersonalCntResponse {
    private Long idPers;
    private TipoDocumentoResponse tipoDocumento;
    private String numDocPers;
    private String perPers;
    private String statPers;
    private LocalDate fechNaciPers;
    private String genPers;
    private String movilPers;
    private String emailPers;
    private String emailCorpPers;
    private String cmp;
    private String codPlanRem;
    private String direcPers;
    private RegimenLaboralResponse regimenLaboral;
    private AreaResponse area;
    private Long idUsuario;
    private LocalDateTime createAt;
    private LocalDateTime updateAt;
}
