package styp.com.cenate.service.usuario;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import styp.com.cenate.dto.UsuarioResponse;
import styp.com.cenate.dto.UsuarioCreateRequest;
import styp.com.cenate.dto.UsuarioUpdateRequest;
import styp.com.cenate.model.Permiso;
import styp.com.cenate.model.Rol;
import styp.com.cenate.model.Usuario;
import styp.com.cenate.repository.UsuarioRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 💡 Servicio que implementa la lógica de negocio para la gestión de usuarios.
 * Aquí se definen los métodos CRUD y utilidades adicionales.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;

    // =============================================================
    // 🟢 MÉTODOS DE LECTURA
    // =============================================================

    /**
     * Obtiene todos los usuarios del sistema.
     */
    @Override
    @Transactional(readOnly = true)
    public List<UsuarioResponse> getAllUsers() {
        log.info("📋 Consultando todos los usuarios");
        return usuarioRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene un usuario por su ID.
     */
    @Override
    @Transactional(readOnly = true)
    public UsuarioResponse getUserById(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("❌ Usuario no encontrado con ID: " + id));
        return convertToResponse(usuario);
    }

    /**
     * Obtiene un usuario por su nombre de usuario.
     */
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

    /**
     * 🆕 Crea un nuevo usuario.
     */
    @Override
    @Transactional
    public UsuarioResponse createUser(UsuarioCreateRequest request) {
        Usuario usuario = new Usuario();
        usuario.setNameUser(request.getNameUser());
        usuario.setPassUser(request.getPassUser()); // ⚠️ idealmente encriptar con BCrypt antes
        usuario.setStatUser("ACTIVO");
        usuario.setCreateAt(LocalDateTime.now());

        usuarioRepository.save(usuario);
        log.info("✅ Usuario creado: {}", usuario.getNameUser());

        return convertToResponse(usuario);
    }

    /**
     * ✏️ Actualiza datos de un usuario existente.
     * Usa el DTO UsuarioUpdateRequest.
     */
    @Override
    @Transactional
    public UsuarioResponse updateUser(Long id, UsuarioUpdateRequest request) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("❌ Usuario no encontrado con ID: " + id));

        // 🔸 Actualizar campos básicos
        if (request.getNameUser() != null)
            usuario.setNameUser(request.getNameUser());

        if (request.getEstado() != null)
            usuario.setStatUser(request.getEstado());

        // 🔸 Aquí podrías actualizar roles si tienes un RolRepository
        // por ejemplo:
        // if (request.getRoles() != null && !request.getRoles().isEmpty()) {
        //     Set<Rol> nuevosRoles = rolRepository.findByDescRolIn(request.getRoles());
        //     usuario.setRoles(nuevosRoles);
        // }

        usuario.setUpdateAt(LocalDateTime.now());
        usuarioRepository.save(usuario);

        log.info("✏️ Usuario actualizado: {}", usuario.getNameUser());
        return convertToResponse(usuario);
    }

    // =============================================================
    // 🟢 ELIMINACIÓN / ESTADOS
    // =============================================================

    /**
     * 🗑️ Elimina un usuario.
     */
    @Override
    @Transactional
    public void deleteUser(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("❌ Usuario no encontrado con ID: " + id));
        usuarioRepository.delete(usuario);
        log.info("🗑️ Usuario eliminado: {}", usuario.getNameUser());
    }

    /**
     * ✅ Activa un usuario.
     */
    @Override
    @Transactional
    public UsuarioResponse activateUser(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("❌ Usuario no encontrado con ID: " + id));
        usuario.setStatUser("ACTIVO");
        usuarioRepository.save(usuario);
        log.info("✅ Usuario activado: {}", usuario.getNameUser());
        return convertToResponse(usuario);
    }

    /**
     * 🚫 Desactiva un usuario.
     */
    @Override
    @Transactional
    public UsuarioResponse deactivateUser(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("❌ Usuario no encontrado con ID: " + id));
        usuario.setStatUser("INACTIVO");
        usuarioRepository.save(usuario);
        log.info("🚫 Usuario desactivado: {}", usuario.getNameUser());
        return convertToResponse(usuario);
    }

    /**
     * 🔓 Desbloquea un usuario.
     */
    @Override
    @Transactional
    public UsuarioResponse unlockUser(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("❌ Usuario no encontrado con ID: " + id));
        usuario.setFailedAttempts(0);
        usuario.setLockedUntil(null);
        usuarioRepository.save(usuario);
        log.info("🔓 Usuario desbloqueado: {}", usuario.getNameUser());
        return convertToResponse(usuario);
    }

    // =============================================================
    // 🧠 MÉTODOS AUXILIARES
    // =============================================================

    /**
     * Ejecuta una consulta SQL personalizada.
     */
    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> executeCustomQuery(String sql, String username) {
        log.info("🧠 Ejecutando consulta SQL personalizada para usuario: {}", username);
        Map<String, Object> params = Map.of("username", username);
        return namedParameterJdbcTemplate.queryForList(sql, params);
    }

    /**
     * Convierte la entidad Usuario en un objeto UsuarioResponse.
     */
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
