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
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PersonalExternoResponse {
    
    private Long idPersExt;  // ✅ Cambiado a Long
    private TipoDocumentoResponse tipoDocumento;
    private String numDocExt;
    private String nomExt;
    private String apePaterExt;
    private String apeMaterExt;
    private String nombreCompleto;
    private LocalDate fechNaciExt;
    private Integer edad;
    private String genExt;
    private String movilExt;
    private String emailPersExt;
    
    /**
     * Institución (IPRESS) a la que pertenece
     */
    private IpressResponse ipress;
    
    /**
     * Nombre de la institución (campo de conveniencia)
     */
    private String nombreInstitucion;
    
    private Long idUser;  // ✅ Cambiado a Long
    private LocalDateTime createAt;
    private LocalDateTime updateAt;
}
