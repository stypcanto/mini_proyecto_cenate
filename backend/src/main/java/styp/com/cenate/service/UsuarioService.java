package styp.com.cenate.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import styp.com.cenate.dto.UsuarioResponse;
import styp.com.cenate.model.Rol;
import styp.com.cenate.model.Usuario;
import styp.com.cenate.repository.UsuarioRepository;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UsuarioService {
    
    private final UsuarioRepository usuarioRepository;
    
    @Transactional(readOnly = true)
    public List<UsuarioResponse> getAllUsers() {
        return usuarioRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public UsuarioResponse getUserById(Integer id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return convertToResponse(usuario);
    }
    
    @Transactional(readOnly = true)
    public UsuarioResponse getUserByUsername(String username) {
        Usuario usuario = usuarioRepository.findByNameUser(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return convertToResponse(usuario);
    }
    
    @Transactional
    public void deleteUser(Integer id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        usuarioRepository.delete(usuario);
        log.info("Usuario {} eliminado", usuario.getNameUser());
    }
    
    @Transactional
    public UsuarioResponse activateUser(Integer id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        usuario.setStatUser("ACTIVO");
        usuario = usuarioRepository.save(usuario);
        
        log.info("Usuario {} activado", usuario.getNameUser());
        return convertToResponse(usuario);
    }
    
    @Transactional
    public UsuarioResponse deactivateUser(Integer id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        usuario.setStatUser("INACTIVO");
        usuario = usuarioRepository.save(usuario);
        
        log.info("Usuario {} desactivado", usuario.getNameUser());
        return convertToResponse(usuario);
    }
    
    @Transactional
    public UsuarioResponse unlockUser(Integer id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        usuario.setFailedAttempts(0);
        usuario.setLockedUntil(null);
        usuario = usuarioRepository.save(usuario);
        
        log.info("Usuario {} desbloqueado", usuario.getNameUser());
        return convertToResponse(usuario);
    }
    
    private UsuarioResponse convertToResponse(Usuario usuario) {
        Set<String> roles = usuario.getRoles().stream()
                .map(Rol::getDescRol)
                .collect(Collectors.toSet());
        
        Set<String> permisos = usuario.getRoles().stream()
                .flatMap(rol -> rol.getPermisos().stream())
                .map(permiso -> permiso.getDescPermiso())
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
