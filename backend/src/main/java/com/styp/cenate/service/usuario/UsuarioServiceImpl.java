package com.styp.cenate.service.usuario;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.styp.cenate.dto.UsuarioCreateRequest;
import com.styp.cenate.dto.UsuarioResponse;
import com.styp.cenate.dto.UsuarioUpdateRequest;
import com.styp.cenate.model.*;
import com.styp.cenate.repository.UsuarioRepository;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 💼 Servicio principal para la gestión de usuarios del sistema CENATE.
 * Incluye creación, actualización, eliminación, detalle extendido y filtros por roles.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Data
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
        usuario.setStatUser(Optional.ofNullable(request.getEstado()).orElse("I"));
        usuario.setCreateAt(LocalDateTime.now());

        usuarioRepository.save(usuario);
        log.info("🧾 Usuario creado: {}", usuario.getNameUser());

        return convertToResponse(usuario);
    }

    // =============================================================
    // 🔍 CONSULTAS
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
    // 🚫 ELIMINAR USUARIO
    // =============================================================
    @Override
    @Transactional
    public void deleteUser(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con ID: " + id));

        usuarioRepository.delete(usuario);
        log.info("🗑️ Usuario eliminado correctamente: {}", usuario.getNameUser());
    }

    // =============================================================
    // 🔒 CONTROL DE ESTADO
    // =============================================================
    @Override
    @Transactional
    public UsuarioResponse activateUser(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con ID: " + id));
        usuario.setStatUser("A");
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
        usuario.setStatUser("I");
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
    // 🔍 CONSULTA EXTENDIDA (usuario + personal + roles)
    // =============================================================
    @Override
    @Transactional(readOnly = true)
    public UsuarioResponse obtenerDetalleUsuarioExtendido(String username) {
        Usuario usuario = usuarioRepository.findByNameUser(username)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado: " + username));

        UsuarioResponse base = convertToResponse(usuario);

        if (usuario.getPersonalCnt() != null) {
            PersonalCnt p = usuario.getPersonalCnt();

            base.setNombreCompleto(p.getNombreCompleto());
            base.setCorreoPersonal(p.getEmailPers());
            base.setCorreoCorporativo(p.getEmailCorpPers());
            base.setNumeroDocumento(p.getNumDocPers());
            base.setTipoDocumento(p.getTipoDocumento() != null ? p.getTipoDocumento().toString() : null);
            base.setRegimenLaboral(p.getRegimenLaboral() != null ? p.getRegimenLaboral().getDescRegLab() : null);
            base.setAreaTrabajo(p.getArea() != null ? p.getArea().getDescArea() : null);
            base.setFotoUrl(p.getFotoPers());

            // ✅ Firmas digitales (ajustado a la nueva estructura)
            base.setFirmasDigitales(
                    p.getFirmas().stream()
                            .map(f -> f.getFirmaDigital() != null
                                    ? f.getFirmaDigital().getSerieFirmDig()
                                    : "Sin firma")
                            .collect(Collectors.toList())
            );

            // ✅ Profesiones
            base.setProfesiones(
                    p.getProfesiones().stream()
                            .map(pp -> pp.getProfesion().getDescProf())
                            .collect(Collectors.toList())
            );

            // ✅ Órdenes de compra
            base.setOrdenesCompra(
                    p.getOcs().stream()
                            .map(oc -> oc.getNumOc() != null ? oc.getNumOc() : "Sin OC")
                            .collect(Collectors.toList())
            );
        }

        log.info("📋 Detalle extendido generado para usuario: {}", username);
        return base;
    }

    // =============================================================
    // 🔍 CONSULTA SQL BÁSICA
    // =============================================================
    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> obtenerDetalleUsuario(String username) {
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
        return namedParameterJdbcTemplate.queryForList(sql, Map.of("username", username));
    }

    // =============================================================
    // 🧩 FILTROS
    // =============================================================
    @Override
    @Transactional(readOnly = true)
    public List<UsuarioResponse> getUsuariosByRoles(List<String> roles) {
        return usuarioRepository.findAll().stream()
                .filter(u -> u.getRoles() != null &&
                        u.getRoles().stream().anyMatch(r -> roles.contains(r.getDescRol())))
                .map(this::convertToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UsuarioResponse> getUsuariosExcluyendoRoles(List<String> roles) {
        return usuarioRepository.findAll().stream()
                .filter(u -> u.getRoles() == null ||
                        u.getRoles().stream().noneMatch(r -> roles.contains(r.getDescRol())))
                .map(this::convertToResponse)
                .toList();
    }

    // =============================================================
    // 🧠 CONVERSIÓN DTO
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
                .locked(usuario.isAccountLocked())
                .message("Usuario " + usuario.getStatUser().toLowerCase())
                .build();
    }
}
