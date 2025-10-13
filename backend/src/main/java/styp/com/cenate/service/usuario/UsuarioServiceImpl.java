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
 * 💡 Servicio de gestión de usuarios (solo administrativos o aprobados por el SUPERADMIN).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;
    private final PasswordEncoder passwordEncoder;

    // =============================================================
    // 🟢 CREAR USUARIO
    // =============================================================
    @Override
    @Transactional
    public UsuarioResponse createUser(UsuarioCreateRequest request) {
        if (request == null)
            throw new IllegalArgumentException("❌ Datos de usuario no proporcionados");

        if (usuarioRepository.existsByNameUser(request.getUsername()))
            throw new IllegalArgumentException("⚠️ El nombre de usuario ya existe: " + request.getUsername());

        Usuario usuario = new Usuario();
        usuario.setNameUser(request.getUsername());
        usuario.setPassUser(passwordEncoder.encode(request.getPassword()));
        usuario.setStatUser(request.getEstado() != null ? request.getEstado() : "INACTIVO");
        usuario.setCreateAt(LocalDateTime.now());

        usuarioRepository.save(usuario);
        log.info("🧾 Usuario creado pendiente de aprobación: {}", usuario.getNameUser());

        return convertToResponse(usuario);
    }

    // =============================================================
    // 🟢 CONSULTAS
    // =============================================================
    @Override
    @Transactional(readOnly = true)
    public List<UsuarioResponse> getAllUsers() {
        return usuarioRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponse getUserById(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con ID: " + id));
        return convertToResponse(usuario);
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponse getUserByUsername(String username) {
        Usuario usuario = usuarioRepository.findByNameUser(username)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado: " + username));
        return convertToResponse(usuario);
    }

    // =============================================================
    // ✏️ ACTUALIZAR USUARIO
    // =============================================================
    @Override
    @Transactional
    public UsuarioResponse updateUser(Long id, UsuarioUpdateRequest request) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con ID: " + id));

        if (request.getUsername() != null && !request.getUsername().isBlank())
            usuario.setNameUser(request.getUsername());

        if (request.getEstado() != null && !request.getEstado().isBlank())
            usuario.setStatUser(request.getEstado());

        usuario.setUpdateAt(LocalDateTime.now());
        usuarioRepository.save(usuario);

        log.info("✏️ Usuario actualizado: {}", usuario.getNameUser());
        return convertToResponse(usuario);
    }

    // =============================================================
    // 🚫 ELIMINAR / ESTADO
    // =============================================================
    @Override
    @Transactional
    public void deleteUser(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con ID: " + id));
        usuarioRepository.delete(usuario);
        log.info("🗑️ Usuario eliminado: {}", usuario.getNameUser());
    }

    @Override
    @Transactional
    public UsuarioResponse activateUser(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con ID: " + id));
        usuario.setStatUser("ACTIVO");
        usuario.setUpdateAt(LocalDateTime.now());
        usuarioRepository.save(usuario);
        log.info("✅ Usuario activado: {}", usuario.getNameUser());
        return convertToResponse(usuario);
    }

    @Override
    @Transactional
    public UsuarioResponse deactivateUser(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con ID: " + id));
        usuario.setStatUser("INACTIVO");
        usuario.setUpdateAt(LocalDateTime.now());
        usuarioRepository.save(usuario);
        log.info("🚫 Usuario desactivado: {}", usuario.getNameUser());
        return convertToResponse(usuario);
    }

    @Override
    @Transactional
    public UsuarioResponse unlockUser(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con ID: " + id));
        usuario.setLockedUntil(null);
        usuario.setFailedAttempts(0);
        usuarioRepository.save(usuario);
        log.info("🔓 Usuario desbloqueado: {}", usuario.getNameUser());
        return convertToResponse(usuario);
    }

    // =============================================================
    // 🔍 CONSULTAS PERSONALIZADAS
    // =============================================================
    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> obtenerDetalleUsuario(String username) {
        try {
            String sql = """
                    SELECT u.id_user, u.name_user, u.stat_user,
                           r.desc_rol AS rol, p.desc_permiso AS permiso
                    FROM dim_usuarios u
                    LEFT JOIN dim_usuario_rol ur ON u.id_user = ur.id_user
                    LEFT JOIN dim_roles r ON ur.id_rol = r.id_rol
                    LEFT JOIN dim_rol_permiso rp ON r.id_rol = rp.id_rol
                    LEFT JOIN dim_permisos p ON rp.id_permiso = p.id_permiso
                    WHERE u.name_user = :username
                    """;
            Map<String, Object> params = Map.of("username", username);
            return namedParameterJdbcTemplate.queryForList(sql, params);
        } catch (Exception e) {
            log.error("❌ Error obteniendo detalle del usuario {}: {}", username, e.getMessage());
            throw new RuntimeException("Error al obtener detalle del usuario", e);
        }
    }

    // =============================================================
    // 🧩 FILTROS POR ROLES
    // =============================================================
    @Override
    @Transactional(readOnly = true)
    public List<UsuarioResponse> getUsuariosByRoles(List<String> roles) {
        return usuarioRepository.findAll().stream()
                .filter(u -> u.getRoles() != null &&
                        u.getRoles().stream()
                                .anyMatch(r -> roles.contains(r.getDescRol())))
                .map(this::convertToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UsuarioResponse> getUsuariosExcluyendoRoles(List<String> roles) {
        return usuarioRepository.findAll().stream()
                .filter(u -> u.getRoles() == null ||
                        u.getRoles().stream()
                                .noneMatch(r -> roles.contains(r.getDescRol())))
                .map(this::convertToResponse)
                .toList();
    }

    // =============================================================
    // 🧠 CONVERSIÓN A DTO
    // =============================================================
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
                .message("Usuario " + usuario.getStatUser().toLowerCase())
                .build();
    }
}
