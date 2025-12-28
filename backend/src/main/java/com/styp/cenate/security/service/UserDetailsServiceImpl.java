package com.styp.cenate.security.service;

import com.styp.cenate.model.Rol;
import com.styp.cenate.model.Usuario;
import com.styp.cenate.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.Set;

/**
 * 🔐 Servicio que carga los detalles del usuario desde la base de datos
 * y convierte roles a autoridades reconocidas por Spring Security.
 * Compatible con el sistema MBAC (roles y permisos centralizados).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.info("Buscando usuario para autenticacion: {}", username);

        // Recupera usuario + roles
        Usuario usuario = usuarioRepository.findByNameUserWithRoles(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));

        // SEC-002: Verificar bloqueo temporal por intentos fallidos
        if (usuario.isAccountLocked()) {
            String horaDesbloqueo = usuario.getLockedUntil()
                    .format(DateTimeFormatter.ofPattern("HH:mm"));
            log.warn("Cuenta bloqueada hasta {} para usuario: {}", horaDesbloqueo, username);
            throw new LockedException("Cuenta bloqueada temporalmente. Intente despues de las " + horaDesbloqueo);
        }

        // Verifica que el usuario este activo
        boolean enabled = usuario.isActive();
        if (!enabled) {
            log.warn("Usuario inactivo: {}", username);
            throw new DisabledException("Usuario inactivo o deshabilitado");
        }

        // Construccion de authorities basadas en roles MBAC
        Set<SimpleGrantedAuthority> authorities = new HashSet<>();
        if (usuario.getRoles() != null) {
            for (Rol rol : usuario.getRoles()) {
                authorities.add(new SimpleGrantedAuthority("ROLE_" + rol.getDescRol().toUpperCase()));
            }
        }

        log.info("Usuario cargado: {} con roles {}", username, authorities);

        // Retorna objeto User con la contrasena codificada en BD (BCrypt)
        return new User(
                usuario.getNameUser(),
                usuario.getPassUser(),
                enabled,
                true,      // cuenta no expirada
                true,      // credenciales no expiradas
                !usuario.isAccountLocked(),  // SEC-002: usar valor real de bloqueo
                authorities
        );
    }
}