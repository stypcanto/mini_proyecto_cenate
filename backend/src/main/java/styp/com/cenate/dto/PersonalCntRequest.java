package styp.com.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PersonalCntRequest {
    private Long idTipDoc;
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
    private Long idRegLab;
    private Long idArea;
    private Long idUsuario;
}
