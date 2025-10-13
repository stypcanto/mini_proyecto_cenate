package styp.com.cenate.dto;

import lombok.Data;
import java.util.Set;

/**
 * DTO usado por el administrador para revisar solicitudes
 * (aprobar o rechazar la creación de una cuenta).
 */
@Data
public class AccountRequestReviewRequest {
    private Set<Long> roles;   // IDs de roles que se asignarán al aprobar
    private String comentario; // Observación o justificación
    private Long idAdmin;      // ID del administrador que revisa la solicitud
}