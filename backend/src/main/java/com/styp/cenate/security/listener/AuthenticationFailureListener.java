package com.styp.cenate.security.listener;

import com.styp.cenate.repository.UsuarioRepository;
import com.styp.cenate.service.auditlog.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationListener;
import org.springframework.security.authentication.event.AuthenticationFailureBadCredentialsEvent;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * SEC-002: Listener para intentos fallidos de autenticacion.
 * Incrementa el contador de intentos fallidos y bloquea la cuenta
 * despues de 3 intentos fallidos por 10 minutos.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AuthenticationFailureListener
        implements ApplicationListener<AuthenticationFailureBadCredentialsEvent> {

    private final UsuarioRepository usuarioRepository;
    private final AuditLogService auditLogService;

    @Override
    @Transactional
    public void onApplicationEvent(AuthenticationFailureBadCredentialsEvent event) {
        String username = event.getAuthentication().getName();
        log.warn("Intento fallido de login para: {}", username);

        usuarioRepository.findByNameUser(username).ifPresent(usuario -> {
            usuario.increaseFailedAttempts();
            usuarioRepository.save(usuario);

            // Preparar detalle para auditoria
            String detalle = String.format("Intento fallido #%d para usuario %s",
                    usuario.getFailedAttempts(), username);

            if (usuario.isAccountLocked()) {
                detalle += " - CUENTA BLOQUEADA hasta " + usuario.getLockedUntil();
                log.warn("Cuenta bloqueada para {} hasta {}", username, usuario.getLockedUntil());
            }

            // Registrar en auditoria
            try {
                auditLogService.registrarEvento(
                        username,
                        "LOGIN_FAILED",
                        "AUTH",
                        detalle,
                        usuario.isAccountLocked() ? "WARNING" : "INFO",
                        "FAILURE"
                );
            } catch (Exception e) {
                log.error("Error registrando auditoria de login fallido: {}", e.getMessage());
            }
        });
    }
}
