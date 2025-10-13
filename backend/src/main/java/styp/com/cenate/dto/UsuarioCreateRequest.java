package styp.com.cenate.dto;

import lombok.Data;

/**
 * DTO para creación de usuarios internos o externos aprobados.
 * Este objeto solo lo usa el backend (SUPERADMIN) al aprobar una solicitud.
 */
@Data
public class UsuarioCreateRequest {
    private String username;
    private String password;

    // El estado por defecto es INACTIVO hasta que el SUPERADMIN lo active manualmente
    private String estado = "INACTIVO";

    // Si el SUPERADMIN lo desea, puede asignar roles después de la aprobación
    private Long idRol; // ✅ Simplificado: un rol principal inicial opcional
}