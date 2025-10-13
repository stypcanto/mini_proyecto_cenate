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
import styp.com.cenate.model.Permiso;
import styp.com.cenate.model.Rol;
import styp.com.cenate.model.Usuario;
import styp.com.cenate.repository.PermisoRepository;
import styp.com.cenate.repository.UsuarioRepository;
import styp.com.cenate.security.service.JwtService;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationServiceImpl implements AuthenticationService {

    private final UsuarioRepository usuarioRepository;
    private final PermisoRepository permisoRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    // =========================================================
    // 🔐 LOGIN (por usuario o correo)
    // =========================================================
    @Override
    @Transactional(readOnly = true)
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

        // ============================================
        // 🧠 Si es SUPERADMIN → obtiene TODOS los permisos
        // ============================================
        Set<Rol> roles = user.getRoles();
        List<Permiso> permisos;

        if (roles.stream().anyMatch(r -> r.getDescRol().equalsIgnoreCase("SUPERADMIN"))) {
            log.info("🧠 Usuario SUPERADMIN detectado, otorgando todos los permisos existentes");
            permisos = permisoRepository.findAll();
        } else {
            permisos = roles.stream()
                    .flatMap(r -> r.getPermisos().stream())
                    .distinct()
                    .collect(Collectors.toList());
        }

        // ============================================
        // Autoridades para el contexto de seguridad
        // ============================================
        List<GrantedAuthority> authorities = new ArrayList<>();
        roles.forEach(rol -> authorities.add(new SimpleGrantedAuthority("ROLE_" + rol.getDescRol())));
        permisos.forEach(p -> authorities.add(new SimpleGrantedAuthority(p.getDescPermiso())));

        // ============================================
        // Claims personalizados para el JWT
        // ============================================
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", roles.stream().map(Rol::getDescRol).toList());
        claims.put("permisos", permisos.stream().map(Permiso::getDescPermiso).toList());

        User userDetails = new User(user.getNameUser(), user.getPassUser(), authorities);
        String token = jwtService.generateToken(claims, userDetails);

        // ============================================
        // Rol principal y respuesta final
        // ============================================
        String rolPrincipal = roles.stream().findFirst()
                .map(Rol::getDescRol)
                .orElse("SIN_ROL");

        return LoginResponse.builder()
                .token(token)
                .username(user.getNameUser())
                .nombreCompleto(user.getNombreCompleto())
                .rolPrincipal(rolPrincipal)
                .roles(roles.stream().map(Rol::getDescRol).toList())
                .permisos(permisos.stream().map(Permiso::getDescPermiso).toList())
                .build();
    }

    /**
     * ✅ Busca usuario por correo (interno o externo)
     */
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

    /**
     * 🧩 Obtiene el correo del usuario desde las tablas relacionadas
     */
    private String obtenerCorreoUsuario(Usuario u) {
        return null; // TODO: Integrar con dim_personal_cnt / dim_personal_externo
    }

    // =========================================================
    // 🧍 CREAR USUARIO (para pruebas o admin)
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