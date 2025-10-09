package styp.com.cenate.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import styp.com.cenate.dto.LoginRequest;
import styp.com.cenate.dto.LoginResponse;
import styp.com.cenate.dto.UsuarioCreateRequest;
import styp.com.cenate.dto.UsuarioResponse;
import styp.com.cenate.model.Permiso;
import styp.com.cenate.model.Rol;
import styp.com.cenate.model.Usuario;
import styp.com.cenate.repository.RolRepository;
import styp.com.cenate.repository.UsuarioRepository;
import styp.com.cenate.security.JwtService;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final long LOCK_TIME_DURATION_MINUTES = 30;

    /**
     * Login de usuario con validaciones de bloqueo, estado y JWT.
     */
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        try {
            Usuario usuario = usuarioRepository.findByNameUserWithRoles(request.getUsername())
                    .orElseThrow(() -> new BadCredentialsException("Credenciales inválidas"));

            // Verificar si está bloqueado
            if (usuario.isAccountLocked()) {
                throw new BadCredentialsException("Cuenta bloqueada. Intente nuevamente más tarde.");
            }

            // Verificar si está activo
            if (!usuario.isActive()) {
                throw new BadCredentialsException("Cuenta inactiva. Contacte al administrador.");
            }

            // Autenticar con Spring Security
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );

            // Resetear intentos fallidos
            resetFailedAttempts(usuario);

            // Actualizar último acceso
            usuario.setLastLoginAt(LocalDateTime.now());
            usuarioRepository.save(usuario);

            // Generar token JWT
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String token = jwtService.generateToken(userDetails);

            // Roles y permisos
            Set<Rol> rolesUsuario = new HashSet<>(usuario.getRoles());

            Set<String> roles = rolesUsuario.stream()
                    .map(Rol::getDescRol)
                    .collect(Collectors.toSet());

            Set<String> permisos = rolesUsuario.stream()
                    .filter(r -> r.getPermisos() != null)
                    .flatMap(r -> r.getPermisos().stream())
                    .map(Permiso::getDescPermiso)
                    .collect(Collectors.toSet());

            log.info("✅ Usuario {} inició sesión exitosamente", usuario.getNameUser());

            return LoginResponse.builder()
                    .token(token)
                    .type("Bearer")
                    .userId(usuario.getIdUser())
                    .username(usuario.getNameUser())
                    .roles(roles)
                    .permisos(permisos)
                    .message("Login exitoso")
                    .build();

        } catch (BadCredentialsException e) {
            usuarioRepository.findByNameUser(request.getUsername())
                    .ifPresent(this::increaseFailedAttempts);
            throw new BadCredentialsException("Usuario o contraseña incorrectos");
        } catch (Exception e) {
            // 🔥 Corrección: no referenciamos 'request' fuera de alcance
            log.error("❌ Error inesperado durante el login: {}", e.getMessage(), e);
            throw new RuntimeException("Ocurrió un error en el servidor al procesar el inicio de sesión");
        }
    }

    /**
     * Crear un nuevo usuario con sus roles asignados.
     */
    @Transactional
    public UsuarioResponse createUser(UsuarioCreateRequest request) {
        if (usuarioRepository.existsByNameUser(request.getUsername())) {
            throw new RuntimeException("El usuario ya existe");
        }

        Set<Rol> roles = new HashSet<>();
        for (Integer roleId : request.getRoleIds()) {
            Rol rol = rolRepository.findById(roleId)
                    .orElseThrow(() -> new RuntimeException("Rol no encontrado: " + roleId));
            roles.add(rol);
        }

        Usuario usuario = Usuario.builder()
                .nameUser(request.getUsername())
                .passUser(passwordEncoder.encode(request.getPassword()))
                .statUser(request.getEstado())
                .roles(roles)
                .failedAttempts(0)
                .build();

        usuario = usuarioRepository.save(usuario);
        log.info("👤 Usuario {} creado exitosamente", usuario.getNameUser());

        return convertToResponse(usuario);
    }

    /**
     * Incrementar intentos fallidos y bloquear si excede el límite.
     */
    private void increaseFailedAttempts(Usuario usuario) {
        int newFailAttempts = usuario.getFailedAttempts() + 1;
        usuario.setFailedAttempts(newFailAttempts);

        if (newFailAttempts >= MAX_FAILED_ATTEMPTS) {
            usuario.setLockedUntil(LocalDateTime.now().plusMinutes(LOCK_TIME_DURATION_MINUTES));
            log.warn("🔒 Usuario {} bloqueado por {} intentos fallidos",
                    usuario.getNameUser(), newFailAttempts);
        }

        usuarioRepository.save(usuario);
    }

    /**
     * Reinicia los intentos fallidos después de un login exitoso.
     */
    private void resetFailedAttempts(Usuario usuario) {
        if (usuario.getFailedAttempts() > 0 || usuario.getLockedUntil() != null) {
            usuario.setFailedAttempts(0);
            usuario.setLockedUntil(null);
            usuarioRepository.save(usuario);
        }
    }

    /**
     * Cambiar contraseña de un usuario autenticado.
     */
    @Transactional
    public void changePassword(String username, String currentPassword, String newPassword, String confirmPassword) {
        if (!newPassword.equals(confirmPassword)) {
            throw new RuntimeException("Las contraseñas no coinciden");
        }

        Usuario usuario = usuarioRepository.findByNameUser(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(currentPassword, usuario.getPassUser())) {
            throw new RuntimeException("La contraseña actual es incorrecta");
        }

        if (passwordEncoder.matches(newPassword, usuario.getPassUser())) {
            throw new RuntimeException("La nueva contraseña debe ser diferente a la actual");
        }

        usuario.setPassUser(passwordEncoder.encode(newPassword));
        usuario.setPasswordChangedAt(LocalDateTime.now());
        usuario.setFailedAttempts(0);
        usuario.setLockedUntil(null);

        usuarioRepository.save(usuario);
        log.info("🔑 Contraseña cambiada exitosamente para usuario {}", usuario.getNameUser());
    }

    /**
     * Convertir entidad Usuario a DTO.
     */
    private UsuarioResponse convertToResponse(Usuario usuario) {
        Set<String> roles = usuario.getRoles().stream()
                .map(Rol::getDescRol)
                .collect(Collectors.toSet());

        Set<String> permisos = usuario.getRoles().stream()
                .filter(r -> r.getPermisos() != null)
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
