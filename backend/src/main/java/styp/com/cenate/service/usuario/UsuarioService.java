package styp.com.cenate.service.usuario;

import styp.com.cenate.dto.UsuarioCreateRequest;
import styp.com.cenate.dto.UsuarioResponse;
import styp.com.cenate.dto.UsuarioUpdateRequest;

import java.util.List;
import java.util.Map;

public interface UsuarioService {

    // 🔹 Consultas
    List<UsuarioResponse> getAllUsers();
    UsuarioResponse getUserById(Long id);
    UsuarioResponse getUserByUsername(String username);

    // 🔹 Gestión de usuarios
    UsuarioResponse createUser(UsuarioCreateRequest request);
    UsuarioResponse updateUser(Long id, UsuarioUpdateRequest request);
    void deleteUser(Long id);

    // 🔹 Control de estado
    UsuarioResponse activateUser(Long id);
    UsuarioResponse deactivateUser(Long id);
    UsuarioResponse unlockUser(Long id);

    // 🔹 Ejecución de consultas personalizadas (para /detalle/{username})
    List<Map<String, Object>> executeCustomQuery(String sql, String username);
}