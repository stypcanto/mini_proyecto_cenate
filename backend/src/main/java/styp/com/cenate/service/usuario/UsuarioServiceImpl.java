package styp.com.cenate.service.usuario;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import styp.com.cenate.dto.UsuarioResponse;
import styp.com.cenate.model.Permiso;
import styp.com.cenate.model.Rol;
import styp.com.cenate.model.Usuario;
import styp.com.cenate.repository.UsuarioRepository;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;

    @Transactional(readOnly = true)
    public List<UsuarioResponse> getAllUsers() {
        return usuarioRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UsuarioResponse getUserById(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));
        return convertToResponse(usuario);
    }

    @Transactional(readOnly = true)
    public UsuarioResponse getUserByUsername(String username) {
        Usuario usuario = usuarioRepository.findByNameUser(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + username));
        return convertToResponse(usuario);
    }

    @Transactional
    public void deleteUser(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));
        usuarioRepository.delete(usuario);
        log.info("Usuario {} eliminado", usuario.getNameUser());
    }

    @Transactional
    public UsuarioResponse activateUser(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));
        usuario.setStatUser("ACTIVO");
        usuario = usuarioRepository.save(usuario);
        log.info("Usuario {} activado", usuario.getNameUser());
        return convertToResponse(usuario);
    }

    @Transactional
    public UsuarioResponse deactivateUser(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));
        usuario.setStatUser("INACTIVO");
        usuario = usuarioRepository.save(usuario);
        log.info("Usuario {} desactivado", usuario.getNameUser());
        return convertToResponse(usuario);
    }

    @Transactional
    public UsuarioResponse unlockUser(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));
        usuario.setFailedAttempts(0);
        usuario.setLockedUntil(null);
        usuario = usuarioRepository.save(usuario);
        log.info("Usuario {} desbloqueado", usuario.getNameUser());
        return convertToResponse(usuario);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> executeCustomQuery(String sql, String username) {
        log.info("🧠 Ejecutando consulta SQL personalizada para usuario: {}", username);
        Map<String, Object> params = Map.of("username", username);
        return namedParameterJdbcTemplate.queryForList(sql, params);
    }

    private UsuarioResponse convertToResponse(Usuario usuario) {
        Set<String> roles = usuario.getRoles().stream()
                .map(Rol::getDescRol)
                .collect(Collectors.toSet());

        Set<String> permisos = usuario.getRoles().stream()
                .flatMap(r -> r.getPermisos().stream())
                .map(Permiso::getDescPermiso)
                .collect(Collectors.toSet());

        return UsuarioResponse.builder()
                .idUser(usuario.getIdUser())
                .username(usuario.getNameUser())
                .nameUser(usuario.getNameUser())
                .estado(usuario.getStatUser())
                .statUser(usuario.getStatUser())
                .roles(roles)
                .permisos(permisos)
                .lastLoginAt(usuario.getLastLoginAt())
                .createAt(usuario.getCreateAt())
                .updateAt(usuario.getUpdateAt())
                .failedAttempts(usuario.getFailedAttempts())
                .isLocked(usuario.isAccountLocked())
                .build();
    }
}
