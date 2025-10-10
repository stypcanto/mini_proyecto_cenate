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
    private Integer idPers;
    private TipoDocumentoResponse tipoDocumento;
    private String numDocPers;
    private String nomPers;
    private String apePaterPers;
    private String apeMaterPers;
    private String nombreCompleto;
    private String perPers;
    private String statPers;
    private LocalDate fechNaciPers;
    private Integer edad;              // ✅ NUEVO
    private String genPers;
    private String movilPers;
    private String emailPers;
    private String emailCorpPers;
    private String colegPers;
    private String codPlanRem;
    private String direcPers;
    private String fotoPers;           // ✅ NUEVO
    private RegimenLaboralResponse regimenLaboral;
    private AreaResponse area;
    private Integer idUsuario;
    private LocalDateTime createAt;
    private LocalDateTime updateAt;
}
