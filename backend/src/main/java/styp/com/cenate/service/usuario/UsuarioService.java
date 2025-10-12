package styp.com.cenate.service.usuario;

import styp.com.cenate.dto.UsuarioCreateRequest;
import styp.com.cenate.dto.UsuarioResponse;
import styp.com.cenate.dto.UsuarioUpdateRequest;

import java.util.List;
import java.util.Map;

public interface UsuarioService {

    List<UsuarioResponse> getAllUsers();

    UsuarioResponse getUserById(Long id);

    UsuarioResponse getUserByUsername(String username);

    UsuarioResponse createUser(UsuarioCreateRequest request);

    UsuarioResponse updateUser(Long id, UsuarioUpdateRequest request);

    void deleteUser(Long id);

    UsuarioResponse activateUser(Long id);

    UsuarioResponse deactivateUser(Long id);

    UsuarioResponse unlockUser(Long id);

    List<Map<String, Object>> executeCustomQuery(String sql, String username);
}