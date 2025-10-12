package styp.com.cenate.service.usuario;

import styp.com.cenate.dto.UsuarioResponse;

import java.util.List;
import java.util.Map;

public interface UsuarioService {

    List<UsuarioResponse> getAllUsers();

    UsuarioResponse getUserById(Long id);
    UsuarioResponse updateUser(Long id, UsuarioUpdateRequest request);

    UsuarioResponse getUserByUsername(String username);

    void deleteUser(Long id);

    UsuarioResponse activateUser(Long id);

    UsuarioResponse deactivateUser(Long id);

    UsuarioResponse unlockUser(Long id);

    List<Map<String, Object>> executeCustomQuery(String sql, String username);
}
