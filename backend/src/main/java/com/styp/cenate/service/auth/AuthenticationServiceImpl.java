package com.styp.cenate.service.auth;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.styp.cenate.dto.*;
import com.styp.cenate.exception.WeakPasswordException;
import com.styp.cenate.model.Permiso;
import com.styp.cenate.model.Rol;
import com.styp.cenate.model.Usuario;
import com.styp.cenate.repository.PermisoRepository;
import com.styp.cenate.repository.UsuarioRepository;
import com.styp.cenate.security.service.JwtService;
import com.styp.cenate.service.auditlog.AuditLogService;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Data
public class AuthenticationServiceImpl implements AuthenticationService {

    private final UsuarioRepository usuarioRepository;
    private final PermisoRepository permisoRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuditLogService auditLogService;

    // =========================================================
    // 🔐 LOGIN (CORREGIDO: ya NO es read-only)
    // =========================================================
    @Override
    @Transactional
    public LoginResponse login(LoginRequest request) {
        log.info("🔐 Intento de login para: {}", request.getUsername());

        Usuario user = usuarioRepository.findByNameUser(request.getUsername())
                .orElseGet(() -> buscarUsuarioPorCorreo(request.getUsername())
                        .orElseThrow(() -> new RuntimeException("Usuario o correo no encontrado")));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassUser())) {
            throw new RuntimeException("Usuario o contraseña incorrectos");
        }

        if (!user.isActive()) {
            throw new RuntimeException("La cuenta está inactiva o bloqueada.");
        }

        // Roles y permisos
        Set<Rol> roles = user.getRoles();
        List<Permiso> permisos = roles.stream()
                .flatMap(r -> r.getPermisos().stream())
                .distinct()
                .collect(Collectors.toList());

        // SUPERADMIN obtiene todos los permisos
        if (roles.stream().anyMatch(r -> r.getDescRol().equalsIgnoreCase("SUPERADMIN"))) {
            permisos = permisoRepository.findAll();
        }

        // Construcción de autoridades
        List<GrantedAuthority> authorities = new ArrayList<>();
        roles.forEach(rol -> authorities.add(new SimpleGrantedAuthority("ROLE_" + rol.getDescRol())));
        permisos.forEach(p -> authorities.add(new SimpleGrantedAuthority(p.getDescPermiso())));

        // Claims del token
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", roles.stream().map(Rol::getDescRol).toList());
        claims.put("permisos", permisos.stream().map(Permiso::getDescPermiso).toList());

        User userDetails = new User(user.getNameUser(), user.getPassUser(), authorities);
        String token = jwtService.generateToken(claims, userDetails);

        String rolPrincipal = roles.stream()
                .findFirst()
                .map(Rol::getDescRol)
                .orElse("SIN_ROL");

        // 🧾 Registrar auditoría del login exitoso
        try {
            auditLogService.registrarEvento(
                    user.getNameUser(),
                    "LOGIN",
                    "AUTH",
                    "Usuario inició sesión exitosamente",
                    "INFO",
                    "SUCCESS"
            );
        } catch (Exception e) {
            log.warn("⚠️ No se pudo registrar el log de login: {}", e.getMessage());
        }

        return LoginResponse.builder()
                .token(token)
                .username(user.getNameUser())
                .nombreCompleto(user.getNombreCompleto())
                .rolPrincipal(rolPrincipal)
                .roles(roles.stream().map(Rol::getDescRol).toList())
                .permisos(permisos.stream().map(Permiso::getDescPermiso).toList())
                .build();
    }

    // =========================================================
    // 🧍 CREAR USUARIO
    // =========================================================
    @Override
    @Transactional
    public UsuarioResponse createUser(UsuarioCreateRequest request) {
        log.info("🧍 Registrando nuevo usuario: {}", request.getUsername());

        if (usuarioRepository.existsByNameUser(request.getUsername())) {
            throw new RuntimeException("El nombre de usuario ya existe");
        }

        if (!isPasswordSecure(request.getPassword())) {
            throw new WeakPasswordException(
                    "La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y un símbolo."
            );
        }

        Usuario user = new Usuario();
        user.setNameUser(request.getUsername());
        user.setPassUser(passwordEncoder.encode(request.getPassword()));
        user.setStatUser("A");

        Usuario savedUser = usuarioRepository.save(user);

        // 🧾 Registrar auditoría
        try {
            auditLogService.registrarEvento(
                    savedUser.getNameUser(),
                    "CREATE_USER",
                    "AUTH",
                    "Usuario creado exitosamente",
                    "INFO",
                    "SUCCESS"
            );
        } catch (Exception e) {
            log.warn("⚠️ No se pudo registrar el log de creación de usuario: {}", e.getMessage());
        }

        return UsuarioResponse.builder()
                .idUser(savedUser.getIdUser())
                .username(savedUser.getNameUser())
                .estado(savedUser.getStatUser())
                .message("Usuario registrado exitosamente")
                .build();
    }

    // =========================================================
    // 🔑 CAMBIO DE CONTRASEÑA
    // =========================================================
    @Override
    @Transactional
    public void changePassword(String username, String currentPassword, String newPassword, String confirmPassword) {
        log.info("🧩 Cambio de contraseña solicitado para: {}", username);

        Usuario user = usuarioRepository.findByNameUser(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(currentPassword, user.getPassUser())) {
            throw new RuntimeException("La contraseña actual es incorrecta");
        }

        if (!newPassword.equals(confirmPassword)) {
            throw new RuntimeException("La nueva contraseña y su confirmación no coinciden");
        }

        if (passwordEncoder.matches(newPassword, user.getPassUser())) {
            throw new RuntimeException("La nueva contraseña no puede ser igual a la actual");
        }

        if (!isPasswordSecure(newPassword)) {
            throw new WeakPasswordException(
                    "La nueva contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y un símbolo."
            );
        }

        user.setPassUser(passwordEncoder.encode(newPassword));
        usuarioRepository.save(user);

        // 🧾 Registrar auditoría del cambio de contraseña
        try {
            auditLogService.registrarEvento(
                    username,
                    "CHANGE_PASSWORD",
                    "AUTH",
                    "Cambio de contraseña exitoso",
                    "INFO",
                    "SUCCESS"
            );
        } catch (Exception e) {
            log.warn("⚠️ No se pudo registrar el log de cambio de contraseña: {}", e.getMessage());
        }

        log.info("✅ Contraseña actualizada exitosamente para {}", username);
    }

    // =========================================================
    // 🔎 MÉTODOS AUXILIARES
    // =========================================================
    private Optional<Usuario> buscarUsuarioPorCorreo(String correo) {
        log.info("🔎 Buscando usuario por correo: {}", correo);
        try {
            boolean existe = usuarioRepository.existsByAnyEmail(correo);
            if (!existe) return Optional.empty();
            return usuarioRepository.findAll().stream()
                    .filter(u -> correo.equalsIgnoreCase(obtenerCorreoUsuario(u)))
                    .findFirst();
        } catch (Exception e) {
            log.error("⚠️ Error buscando usuario por correo: {}", e.getMessage());
            return Optional.empty();
        }
    }

    private String obtenerCorreoUsuario(Usuario u) {
        return null; // pendiente de integración con tablas de personal
    }

    private boolean isPasswordSecure(String password) {
        return password.length() >= 8 &&
                password.matches(".*[A-Z].*") &&
                password.matches(".*[a-z].*") &&
                password.matches(".*\\d.*") &&
                password.matches(".*[!@#$%^&*(),.?\":{}|<>].*");
    }
}
