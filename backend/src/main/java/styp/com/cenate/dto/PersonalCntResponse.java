package styp.com.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO de respuesta para Personal CENATE (interno)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonalCntResponse {
    private Long idPers;  // ✅ Cambiado a Long
    private TipoDocumentoResponse tipoDocumento;
    private String numDocPers;
    private String nomPers;
    private String apePaterPers;
    private String apeMaterPers;
    private String nombreCompleto;
    private String perPers;
    private String statPers;
    private LocalDate fechNaciPers;
    private Integer edad;
    private String genPers;
    private String movilPers;
    private String emailPers;
    private String emailCorpPers;
    private String colegPers;
    private String codPlanRem;
    private String direcPers;
    private String fotoPers;
    private RegimenLaboralResponse regimenLaboral;
    private AreaResponse area;
    private Long idUsuario;  // ✅ Cambiado a Long
    private LocalDateTime createAt;
    private LocalDateTime updateAt;
}
