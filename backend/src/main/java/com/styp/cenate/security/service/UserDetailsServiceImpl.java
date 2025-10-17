package com.styp.cenate.security.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import com.styp.cenate.model.Rol;
import com.styp.cenate.model.Usuario;
import com.styp.cenate.repository.UsuarioRepository;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 🔐 Servicio que carga los detalles del usuario desde la base de datos
 * y convierte roles + permisos a autoridades reconocidas por Spring Security.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByNameUserWithRoles(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));

        // 🎭 Mapeamos roles con prefijo ROLE_
        List<SimpleGrantedAuthority> authorities = usuario.getRoles().stream()
                .map(Rol::getDescRol)
                .map(descRol -> new SimpleGrantedAuthority("ROLE_" + descRol.toUpperCase()))
                .collect(Collectors.toList());

        // 🔐 Añadimos permisos granulares (si existen)
        usuario.getRoles().stream()
                .filter(r -> r.getPermisos() != null)
                .flatMap(r -> r.getPermisos().stream())
                .forEach(p -> authorities.add(new SimpleGrantedAuthority(p.getDescPermiso().toUpperCase())));

        log.info("✅ Usuario autenticado: {} con autoridades: {}", username, authorities);

        return new User(
                usuario.getNameUser(),
                usuario.getPassUser(),
                usuario.isActive(),              // habilitado (stat_user = 'A')
                true,                            // cuenta no expirada
                true,                            // credenciales no expiradas
                !usuario.isAccountLocked(),      // cuenta no bloqueada
                authorities
        );
    }
}