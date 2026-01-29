package com.styp.cenate.api.pruebas;
import com.styp.cenate.service.email.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/health")
@Slf4j
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class HealthController {

    private final EmailService emailService;

    @Value("${spring.mail.host:172.20.0.227}")
    private String mailHost;

    @Value("${spring.mail.port:25}")
    private int mailPort;

    @Value("${spring.mail.username:cenate.contacto@essalud.gob.pe}")
    private String mailUsername;

    @GetMapping
    public String healthCheck() {
        return "OK";
    }

    /**
     * 🧪 Prueba de conexión SMTP
     * Endpoint público para diagnosticar problemas de email
     * Usage: GET /api/health/smtp-test?email=test@example.com
     */
    @GetMapping("/smtp-test")
    public ResponseEntity<?> probarSMTP(@RequestParam String email) {
        log.info("🧪 Prueba SMTP solicitada para: {}", email);
        log.info("📧 Servidor: {}:{} | Usuario: {}", mailHost, mailPort, mailUsername);

        try {
            boolean resultado = emailService.probarConexionSMTP(email);

            if (resultado) {
                return ResponseEntity.ok(Map.of(
                    "exitoso", true,
                    "mensaje", "Conexión SMTP exitosa",
                    "detalle", "Se envió un correo de prueba a: " + email,
                    "servidor", mailHost,
                    "puerto", mailPort,
                    "remitente", mailUsername
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "exitoso", false,
                    "mensaje", "Falló la conexión SMTP",
                    "detalle", "No se pudo establecer conexión con el servidor de correo. Revisa los logs del servidor para más detalles.",
                    "servidor", mailHost,
                    "puerto", mailPort
                ));
            }
        } catch (Exception e) {
            log.error("❌ Error al probar SMTP: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                "exitoso", false,
                "mensaje", "Error al probar SMTP",
                "error", e.getMessage(),
                "causa", e.getCause() != null ? e.getCause().getMessage() : "Desconocida",
                "servidor", mailHost,
                "puerto", mailPort
            ));
        }
    }
}
