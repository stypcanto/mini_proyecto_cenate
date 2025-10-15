package styp.com.cenate.dto.mbac;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de respuesta para la verificación de permisos.
 * 
 * @author CENATE Development Team
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckPermisoResponseDTO {
    
    @JsonProperty("permitido")
    private Boolean permitido;
    
    @JsonProperty("mensaje")
    private String mensaje;
    
    @JsonProperty("pagina")
    private String pagina;
    
    @JsonProperty("accion")
    private String accion;
}
