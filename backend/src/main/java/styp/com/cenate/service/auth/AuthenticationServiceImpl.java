package styp.com.cenate.service.auth;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import styp.com.cenate.dto.*;
import styp.com.cenate.exception.WeakPasswordException;
import styp.com.cenate.model.Usuario;
import styp.com.cenate.repository.UsuarioRepository;
import styp.com.cenate.security.service.JwtService;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationServiceImpl implements AuthenticationService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    // =========================================================
    // 🔐 LOGIN
    // =========================================================
    @Override
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        log.info("🔐 Login solicitado para usuario: {}", request.getUsername());

        Usuario user = usuarioRepository.findByNameUser(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassUser())) {
            throw new RuntimeException("Usuario o contraseña incorrectos");
        }

        if (!"ACTIVO".equalsIgnoreCase(user.getStatUser())) {
            throw new RuntimeException("La cuenta está inactiva o bloqueada.");
        }

        List<GrantedAuthority> authorities = new ArrayList<>();
        user.getRoles().forEach(rol -> {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + rol.getDescRol()));
            rol.getPermisos().forEach(permiso ->
                    authorities.add(new SimpleGrantedAuthority(permiso.getDescPermiso()))
            );
        });

        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", user.getRoles().stream()
                .map(r -> r.getDescRol()).collect(Collectors.toSet()));
        claims.put("permisos", user.getRoles().stream()
                .flatMap(r -> r.getPermisos().stream())
                .map(p -> p.getDescPermiso())
                .collect(Collectors.toSet()));

        User userDetails = new User(user.getNameUser(), user.getPassUser(), authorities);
        String token = jwtService.generateToken(claims, userDetails);

        return LoginResponse.builder()
                .type("Bearer")
                .token(token)
                .userId(user.getIdUser())
                .username(user.getNameUser())
                .roles(user.getRoles().stream()
                        .map(r -> r.getDescRol()).collect(Collectors.toSet()))
                .permisos(user.getRoles().stream()
                        .flatMap(r -> r.getPermisos().stream())
                        .map(p -> p.getDescPermiso())
                        .collect(Collectors.toSet()))
                .message("Login exitoso")
                .build();
    }

    // =========================================================
    // 🧍 CREAR USUARIO MANUAL (solo para pruebas o admin)
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
        user.setStatUser("ACTIVO");

        Usuario savedUser = usuarioRepository.save(user);

        return UsuarioResponse.builder()
                .idUser(savedUser.getIdUser())
                .username(savedUser.getNameUser())
                .estado(savedUser.getStatUser()) // 🔹 Cambiado de statUser() → estado()
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

        log.info("✅ Contraseña actualizada exitosamente para {}", username);
    }

    // =========================================================
    // 🧠 Validación de seguridad de contraseña
    // =========================================================
    private boolean isPasswordSecure(String password) {
        return password.length() >= 8 &&
                password.matches(".*[A-Z].*") &&
                password.matches(".*[a-z].*") &&
                password.matches(".*\\d.*") &&
                password.matches(".*[!@#$%^&*(),.?\":{}|<>].*");
    }
}