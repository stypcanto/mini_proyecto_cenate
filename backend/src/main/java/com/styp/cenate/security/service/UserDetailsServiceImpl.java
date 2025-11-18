package com.styp.cenate.security.service;

import com.styp.cenate.model.Rol;
import com.styp.cenate.model.Usuario;
import com.styp.cenate.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

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
        log.info("🔎 Buscando usuario para autenticación: {}", username);

        // Recupera usuario + roles
        Usuario usuario = usuarioRepository.findByNameUserWithRoles(username)
                .orElseThrow(() -> new UsernameNotFoundException("❌ Usuario no encontrado: " + username));

        // Verifica que el usuario esté activo
        String status = usuario.getStatUser().trim().toUpperCase();
        boolean enabled = status.equals("A") || status.equals("ACTIVO");
        if (!enabled) {
            log.warn("🚫 Usuario inactivo o bloqueado: {}", username);
            throw new UsernameNotFoundException("Usuario inactivo o bloqueado");
        }

        // Construcción de authorities basadas en roles MBAC
        Set<SimpleGrantedAuthority> authorities = new HashSet<>();
        if (usuario.getRoles() != null) {
            for (Rol rol : usuario.getRoles()) {
                authorities.add(new SimpleGrantedAuthority("ROLE_" + rol.getDescRol().toUpperCase()));
            }
        }

        log.info("✅ Usuario cargado: {} con roles {}", username, authorities);

        // Retorna objeto User con la contraseña codificada en BD (BCrypt)
        return new User(
                usuario.getNameUser(),
                usuario.getPassUser(),
                enabled,   // cuenta habilitada según BD
                true,      // cuenta no expirada
                true,      // credenciales no expiradas
                true,      // no bloqueada
                authorities
        );
    }
}