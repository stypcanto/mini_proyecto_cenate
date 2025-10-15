package styp.com.cenate.dto.mbac;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaginaModuloResponse {
    private Integer idPagina;
    private String nombrePagina;
    private String rutaPagina;
    private String descripcion;
    private Boolean activo;
}