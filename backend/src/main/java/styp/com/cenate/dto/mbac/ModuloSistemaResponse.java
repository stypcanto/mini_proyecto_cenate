package styp.com.cenate.dto.mbac;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModuloSistemaResponse {
    private Integer idModulo;
    private String nombreModulo;
    private String descripcion;
    private String icono;
    private String rutaBase;
    private Boolean activo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<PaginaModuloResponse> paginas;
}