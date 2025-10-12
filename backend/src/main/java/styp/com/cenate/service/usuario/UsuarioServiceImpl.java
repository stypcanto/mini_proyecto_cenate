package styp.com.cenate.service.usuario;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import styp.com.cenate.dto.UsuarioCreateRequest;
import styp.com.cenate.dto.UsuarioResponse;
import styp.com.cenate.dto.UsuarioUpdateRequest;
import styp.com.cenate.model.Permiso;
import styp.com.cenate.model.Rol;
import styp.com.cenate.model.Usuario;
import styp.com.cenate.repository.UsuarioRepository;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 💡 Servicio que implementa la lógica de negocio para la gestión de usuarios.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;
    private final PasswordEncoder passwordEncoder;

    // =============================================================
    // 🟢 MÉTODOS DE LECTURA
    // =============================================================

    @Override
    @Transactional(readOnly = true)
    public List<UsuarioResponse> getAllUsers() {
        log.info("📋 Consultando todos los usuarios");
        return usuarioRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponse getUserById(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("❌ Usuario no encontrado con ID: " + id));
        return convertToResponse(usuario);
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponse getUserByUsername(String username) {
        Usuario usuario = usuarioRepository.findByNameUser(username)
                .orElseThrow(() -> new EntityNotFoundException("❌ Usuario no encontrado: " + username));
        return convertToResponse(usuario);
    }

    // =============================================================
    // 🟢 CREACIÓN Y ACTUALIZACIÓN
    // =============================================================

    @Override
    @Transactional
    public UsuarioResponse createUser(UsuarioCreateRequest request) {
        if (request == null) throw new IllegalArgumentException("❌ Datos de usuario no proporcionados");

        if (usuarioRepository.existsByNameUser(request.getUsername())) {
            throw new IllegalArgumentException("⚠️ El nombre de usuario ya existe: " + request.getUsername());
        }

        Usuario usuario = new Usuario();
        usuario.setNameUser(request.getUsername());
        usuario.setPassUser(passwordEncoder.encode(request.getPassword())); // 🔐 Encriptación segura
        usuario.setStatUser(request.getEstado() != null ? request.getEstado() : "ACTIVO");
        usuario.setCreateAt(LocalDateTime.now());

        usuarioRepository.save(usuario);
        log.info("✅ Usuario creado exitosamente: {}", usuario.getNameUser());

        return convertToResponse(usuario);
    }

    @Override
    @Transactional
    public UsuarioResponse updateUser(Long id, UsuarioUpdateRequest request) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("❌ Usuario no encontrado con ID: " + id));

        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            usuario.setNameUser(request.getUsername());
        }

        if (request.getEstado() != null && !request.getEstado().isBlank()) {
            usuario.setStatUser(request.getEstado());
        }

        usuario.setUpdateAt(LocalDateTime.now());
        usuarioRepository.save(usuario);

        log.info("✏️ Usuario actualizado: {}", usuario.getNameUser());
        return convertToResponse(usuario);
    }

    // =============================================================
    // 🗑️ ELIMINACIÓN / ESTADOS
    // =============================================================

    @Override
    @Transactional
    public void deleteUser(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("❌ Usuario no encontrado con ID: " + id));
        usuarioRepository.delete(usuario);
        log.info("🗑️ Usuario eliminado: {}", usuario.getNameUser());
    }

    @Override
    @Transactional
    public UsuarioResponse activateUser(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("❌ Usuario no encontrado con ID: " + id));
        usuario.setStatUser("ACTIVO");
        usuarioRepository.save(usuario);
        return convertToResponse(usuario);
    }

    @Override
    @Transactional
    public UsuarioResponse deactivateUser(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("❌ Usuario no encontrado con ID: " + id));
        usuario.setStatUser("INACTIVO");
        usuarioRepository.save(usuario);
        return convertToResponse(usuario);
    }

    @Override
    @Transactional
    public UsuarioResponse unlockUser(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("❌ Usuario no encontrado con ID: " + id));
        usuario.setFailedAttempts(0);
        usuario.setLockedUntil(null);
        usuarioRepository.save(usuario);
        return convertToResponse(usuario);
    }

    // =============================================================
    // 🧠 MÉTODOS AUXILIARES
    // =============================================================

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> executeCustomQuery(String sql, String username) {
        if (sql == null || sql.isBlank()) throw new IllegalArgumentException("❌ SQL no puede estar vacío");
        log.info("🧠 Ejecutando consulta SQL personalizada para usuario: {}", username);
        Map<String, Object> params = Map.of("username", username);
        return namedParameterJdbcTemplate.queryForList(sql, params);
    }

    private UsuarioResponse convertToResponse(Usuario usuario) {
        Set<String> roles = Optional.ofNullable(usuario.getRoles())
                .orElse(Collections.emptySet())
                .stream()
                .map(Rol::getDescRol)
                .collect(Collectors.toSet());

        Set<String> permisos = Optional.ofNullable(usuario.getRoles())
                .orElse(Collections.emptySet())
                .stream()
                .flatMap(r -> Optional.ofNullable(r.getPermisos())
                        .orElse(Collections.emptySet())
                        .stream())
                .map(Permiso::getDescPermiso)
                .collect(Collectors.toSet());

        return UsuarioResponse.builder()
                .idUser(usuario.getIdUser())
                .username(usuario.getNameUser())
                .estado(usuario.getStatUser())
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