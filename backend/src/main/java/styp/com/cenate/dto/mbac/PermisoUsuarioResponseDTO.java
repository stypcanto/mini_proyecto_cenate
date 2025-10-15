package styp.com.cenate.dto.mbac;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de respuesta para los permisos de un usuario por rol, módulo y página.
 * Este DTO es utilizado por el endpoint GET /api/permisos/usuario/{id}
 * 
 * @author CENATE Development Team
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PermisoUsuarioResponseDTO {
    
    @JsonProperty("rol")
    private String rol;
    
    @JsonProperty("modulo")
    private String modulo;
    
    @JsonProperty("pagina")
    private String pagina;
    
    @JsonProperty("rutaPagina")
    private String rutaPagina;
    
    @JsonProperty("permisos")
    private PermisosDTO permisos;
}
