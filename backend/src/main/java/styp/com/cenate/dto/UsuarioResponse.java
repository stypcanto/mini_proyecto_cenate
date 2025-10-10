package styp.com.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioResponse {
    
    private Long idUser;  // ✅ Cambiado de Integer a Long
    private String username;
    private String nameUser;
    private String estado;
    private String statUser;
    private Set<String> roles;
    private Set<String> permisos;
    private LocalDateTime lastLoginAt;
    private LocalDateTime createAt;
    private LocalDateTime updateAt;
    private Integer failedAttempts;
    private boolean isLocked;
    
    // Campos adicionales de personal (si aplica)
    private String nombreCompleto;
    private String numDocumento;
    private String descIpress;
    
    // Método de conveniencia para obtener el estado
    public String getStatUser() {
        return statUser != null ? statUser : estado;
    }
    
    // Método de conveniencia para obtener el nombre de usuario
    public String getNameUser() {
        return nameUser != null ? nameUser : username;
    }
}
