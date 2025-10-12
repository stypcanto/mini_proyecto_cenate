package styp.com.cenate.security.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import styp.com.cenate.model.Usuario;
import styp.com.cenate.repository.UsuarioRepository;

import java.util.ArrayList;
import java.util.List;

/**
 * Servicio que carga los detalles del usuario para el proceso de autenticación.
 * Implementa la interfaz de Spring Security UserDetailsService.
 */
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByNameUser(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));

        // Verificar si la cuenta está activa
        if (!usuario.isActive()) {
            throw new UsernameNotFoundException("Usuario inactivo: " + username);
        }

        // Verificar si la cuenta está bloqueada
        if (usuario.isAccountLocked()) {
            throw new UsernameNotFoundException("Usuario bloqueado: " + username);
        }

        // Construir las autoridades (roles y permisos)
        List<GrantedAuthority> authorities = new ArrayList<>();

        // Agregar roles
        usuario.getRoles().forEach(rol -> {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + rol.getDescRol()));

            // Agregar permisos asociados al rol
            rol.getPermisos().forEach(permiso ->
                    authorities.add(new SimpleGrantedAuthority(permiso.getDescPermiso()))
            );
        });

        // Retornar el usuario compatible con Spring Security
        return User.builder()
                .username(usuario.getNameUser())
                .password(usuario.getPassUser())
                .authorities(authorities)
                .accountExpired(false)
                .accountLocked(usuario.isAccountLocked())
                .credentialsExpired(false)
                .disabled(!usuario.isActive())
                .build();
    }
}