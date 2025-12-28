package com.styp.cenate.security.listener;

import com.styp.cenate.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationListener;
import org.springframework.security.authentication.event.AuthenticationSuccessEvent;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * SEC-002: Listener para autenticacion exitosa.
 * Resetea el contador de intentos fallidos cuando el usuario
 * inicia sesion correctamente.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AuthenticationSuccessListener
        implements ApplicationListener<AuthenticationSuccessEvent> {

    private final UsuarioRepository usuarioRepository;

    @Override
    @Transactional
    public void onApplicationEvent(AuthenticationSuccessEvent event) {
        String username = event.getAuthentication().getName();

        usuarioRepository.findByNameUser(username).ifPresent(usuario -> {
            // Solo resetear si habia intentos fallidos previos
            if (usuario.getFailedAttempts() != null && usuario.getFailedAttempts() > 0) {
                int intentosPrevios = usuario.getFailedAttempts();
                usuario.resetFailedAttempts();
                usuarioRepository.save(usuario);
                log.info("Intentos fallidos reseteados para {} (tenia {} intentos)",
                        username, intentosPrevios);
            }
        });
    }
}
