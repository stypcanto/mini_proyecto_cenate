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
import java.util.Set;
import java.util.HashSet;
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

    // -------------------------------
    // LOGIN
    // -------------------------------
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByNameUserWithRoles(request.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Usuario o contraseña incorrectos"));

        if (usuario.isAccountLocked()) {
            throw new BadCredentialsException("Cuenta bloqueada temporalmente. Intente más tarde.");
        }

        if (!usuario.isActive()) {
            throw new BadCredentialsException("Cuenta inactiva. Contacte al administrador.");
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );

            // Reset de intentos fallidos
            resetFailedAttempts(usuario);

            usuario.setLastLoginAt(LocalDateTime.now());
            usuarioRepository.save(usuario);

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String token = jwtService.generateToken(userDetails);

            log.info("✅ Usuario {} inició sesión exitosamente", usuario.getNameUser());

            return LoginResponse.builder()
                    .token(token)
                    .type("Bearer")
                    .userId(usuario.getIdUser())
                    .username(usuario.getNameUser())
                    .roles(mapRoles(usuario))
                    .permisos(mapPermisos(usuario))
                    .message("Login exitoso")
                    .build();

        } catch (BadCredentialsException e) {
            usuarioRepository.findByNameUser(request.getUsername())
                    .ifPresent(this::increaseFailedAttempts);
            throw new BadCredentialsException("Usuario o contraseña incorrectos");
        } catch (Exception e) {
            log.error("❌ Error inesperado durante login de {}: {}", request.getUsername(), e.getMessage(), e);
            throw new RuntimeException("Ocurrió un error interno en el servidor");
        }
    }

    // -------------------------------
    // REGISTRO
    // -------------------------------
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
                .createAt(LocalDateTime.now())
                .build();

        usuario = usuarioRepository.save(usuario);
        log.info("👤 Usuario {} creado exitosamente", usuario.getNameUser());

        return convertToResponse(usuario);
    }

    // -------------------------------
    // CAMBIO DE CONTRASEÑA
    // -------------------------------
    @Transactional
    public void changePassword(String username, String currentPassword, String newPassword, String confirmPassword) {
        Usuario usuario = usuarioRepository.findByNameUser(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(currentPassword, usuario.getPassUser())) {
            throw new RuntimeException("La contraseña actual es incorrecta");
        }

        if (!newPassword.equals(confirmPassword)) {
            throw new RuntimeException("La nueva contraseña y la confirmación no coinciden");
        }

        usuario.setPassUser(passwordEncoder.encode(newPassword));
        usuario.setUpdateAt(LocalDateTime.now());
        usuarioRepository.save(usuario);

        log.info("🔐 Contraseña actualizada exitosamente para {}", username);
    }

    // -------------------------------
    // UTILITARIOS DE INTENTOS
    // -------------------------------
    private void increaseFailedAttempts(Usuario usuario) {
        int newAttempts = usuario.getFailedAttempts() + 1;
        usuario.setFailedAttempts(newAttempts);

        if (newAttempts >= MAX_FAILED_ATTEMPTS) {
            usuario.setLockedUntil(LocalDateTime.now().plusMinutes(LOCK_TIME_DURATION_MINUTES));
            log.warn("🚫 Usuario {} bloqueado por {} intentos fallidos", usuario.getNameUser(), newAttempts);
        }

        usuarioRepository.save(usuario);
    }

    private void resetFailedAttempts(Usuario usuario) {
        if (usuario.getFailedAttempts() > 0 || usuario.getLockedUntil() != null) {
            usuario.setFailedAttempts(0);
            usuario.setLockedUntil(null);
            usuarioRepository.save(usuario);
        }
    }

    // -------------------------------
    // UTILITARIOS DE ROLES / PERMISOS
    // -------------------------------
    private Set<String> mapRoles(Usuario usuario) {
        return usuario.getRoles().stream()
                .map(Rol::getDescRol)
                .collect(Collectors.toSet());
    }

    private Set<String> mapPermisos(Usuario usuario) {
        return usuario.getRoles().stream()
                .filter(r -> r.getPermisos() != null)
                .flatMap(r -> r.getPermisos().stream())
                .map(Permiso::getDescPermiso)
                .collect(Collectors.toSet());
    }

    // -------------------------------
    // MAPEADOR DE RESPONSE
    // -------------------------------
    private UsuarioResponse convertToResponse(Usuario usuario) {
        return UsuarioResponse.builder()
                .idUser(usuario.getIdUser())
                .username(usuario.getNameUser())
                .nameUser(usuario.getNameUser())
                .estado(usuario.getStatUser())
                .statUser(usuario.getStatUser())
                .roles(mapRoles(usuario))
                .permisos(mapPermisos(usuario))
                .lastLoginAt(usuario.getLastLoginAt())
                .createAt(usuario.getCreateAt())
                .updateAt(usuario.getUpdateAt())
                .failedAttempts(usuario.getFailedAttempts())
                .isLocked(usuario.isAccountLocked())
                .build();
    }
}
