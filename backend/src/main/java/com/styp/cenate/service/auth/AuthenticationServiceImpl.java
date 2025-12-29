package com.styp.cenate.service.auth;

import com.styp.cenate.dto.UsuarioCreateRequest;
import com.styp.cenate.dto.UsuarioResponse;
import com.styp.cenate.dto.auth.AuthRequest;
import com.styp.cenate.dto.auth.AuthResponse;
import com.styp.cenate.dto.mbac.PermisoUsuarioResponseDTO;
import com.styp.cenate.exception.WeakPasswordException;
import com.styp.cenate.model.Rol;
import com.styp.cenate.model.Usuario;
import com.styp.cenate.repository.UsuarioRepository;
import com.styp.cenate.security.service.JwtService;
import com.styp.cenate.service.auditlog.AuditLogService;
import com.styp.cenate.service.mbac.PermisosService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 🔐 Servicio de Autenticación MBAC (CENATE 2025)
 * Unifica login JWT + roles y permisos reales desde MBAC.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationServiceImpl implements AuthenticationService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final PermisosService permisosService;
    private final AuditLogService auditLogService;
    private final com.styp.cenate.service.session.SessionService sessionService;
    private final com.styp.cenate.util.RequestContextUtil requestContextUtil;

    // =========================================================
    // 🔐 LOGIN MBAC
    // =========================================================
    @Override
    @Transactional
    public AuthResponse authenticate(AuthRequest request) {
        log.info("🔑 Intento de autenticación para: {}", request.getUsername());

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        Usuario user = usuarioRepository.findByNameUser(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Determinar si el usuario está activo
        List<String> estadosActivos = List.of("A", "ACTIVO");
        boolean enabled = estadosActivos.contains(user.getStatUser().trim().toUpperCase());

        if (!enabled) {
            throw new RuntimeException("❌ La cuenta está inactiva o bloqueada.");
        }

        // Roles
        var roles = user.getRoles().stream()
                .map(Rol::getDescRol)
                .collect(Collectors.toList());

        
        
        
        // Permisos MBAC
//        
//        var permisos = permisosService.obtenerPermisosPorUsuario(user.getIdUser())
//                .stream()
//                .map(PermisoUsuarioResponseDTO::getRutaPagina)
//                .distinct()
//                .collect(Collectors.toList());
//        log.info("Cantidad de Permisos : " + permisos.size());
        
        
        
        

        // Construcción del UserDetails con enabled y roles
        User userDetails = new User(
                user.getNameUser(),
                user.getPassUser(),
                enabled,          // enabled = true si ACTIVO
                true,             // accountNonExpired
                true,             // credentialsNonExpired
                true,             // accountNonLocked
                roles.stream().map(r -> new SimpleGrantedAuthority("ROLE_" + r)).collect(Collectors.toList())
        );

        Map<String, Object> claims = new HashMap<>();
        claims.put("id_user", user.getIdUser());  // 🆕 CRITICO: ID en el JWT para persistencia
        claims.put("roles", roles);
        claims.put("permisos", null);
        claims.put("nombre_completo", user.getNombreCompleto());  // ✅ Nombre y apellido

        String token = jwtService.generateToken(claims, userDetails);

        // 🆕 REGISTRAR SESIÓN ACTIVA
        String sessionId = null;
        try {
            com.styp.cenate.util.RequestContextUtil.AuditContext context =
                com.styp.cenate.util.RequestContextUtil.getAuditContext();

            sessionId = sessionService.registrarNuevaSesion(
                user.getIdUser(),
                user.getNameUser(),
                context.getIp(),
                context.getUserAgent()
            );

            log.info("✅ Sesión registrada: {} para usuario: {}", sessionId, user.getNameUser());
        } catch (Exception e) {
            log.warn("⚠️ No se pudo registrar la sesión: {}", e.getMessage());
        }

        // Registrar auditoría
        try {
            auditLogService.registrarEvento(
                    user.getNameUser(),
                    "LOGIN",
                    "AUTH",
                    "Inicio de sesión exitoso",
                    "INFO",
                    "SUCCESS"
            );
        } catch (Exception e) {
            log.warn("⚠️ No se pudo registrar el log de login: {}", e.getMessage());
        }

        return AuthResponse.builder()
                .token(token)
                .id_user(user.getIdUser())  // 🆕 CRITICO: ID del usuario para el frontend
                .username(user.getNameUser())
                .nombreCompleto(user.getNombreCompleto())  // ✅ Nombre y apellido del usuario
                .roles(roles)
                .permisos(null)
                .requiereCambioPassword(user.getRequiereCambioPassword() != null ? user.getRequiereCambioPassword() : false)  // 🔑 Flag de primer acceso
                .sessionId(sessionId)  // 🆕 ID de sesión para tracking
                .message("Inicio de sesión exitoso")
                .build();
    }

    // =========================================================
    // 🧍 CREAR USUARIO
    // =========================================================
    @Override
    @Transactional
    public UsuarioResponse createUser(UsuarioCreateRequest request) {
        log.info("🧍 Creando nuevo usuario MBAC: {}", request.getUsername());

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
        user.setCreateAt(new Date().toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime());

        Usuario savedUser = usuarioRepository.save(user);

        // Registrar auditoría
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
        log.info("🔐 Cambio de contraseña solicitado para: {}", username);

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
    // 🧩 VALIDACIÓN DE SEGURIDAD DE CONTRASEÑA
    // =========================================================
    private boolean isPasswordSecure(String password) {
        return password != null &&
                password.length() >= 8 &&
                password.matches(".*[A-Z].*") &&
                password.matches(".*[a-z].*") &&
                password.matches(".*\\d.*") &&
                password.matches(".*[!@#$%^&*(),.?\":{}|<>].*");
    }
}