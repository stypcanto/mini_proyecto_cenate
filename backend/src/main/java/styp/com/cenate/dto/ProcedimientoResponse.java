package styp.com.cenate.dto;

import lombok.*;
import java.time.LocalDateTime;

/**
 * DTO para la tabla dim_proced (Procedimientos médicos).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProcedimientoResponse {
    private Long idProced;
    private String codProced;
    private String descProced;
    private String statProced;  // 'A' o 'I'
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}