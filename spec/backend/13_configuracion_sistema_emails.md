# 📧 Guía Completa: Sistema de Envío de Correos CENATE

> **Versión:** 1.0
> **Última Actualización:** 2026-02-16
> **Componente Base:** `EmailService.java` + `EmailAuditLogService.java`

---

## 📋 Tabla de Contenidos
1. [Dependencias Requeridas](#dependencias-requeridas)
2. [Configuración SMTP](#configuración-smtp)
3. [Estructura del Servicio](#estructura-del-servicio)
4. [Implementación Paso a Paso](#implementación-paso-a-paso)
5. [Ejemplos de Uso](#ejemplos-de-uso)
6. [Auditoría de Correos](#auditoría-de-correos)
7. [Troubleshooting](#troubleshooting)

---

## 🔧 Dependencias Requeridas

Agregar al `build.gradle`:

```gradle
dependencies {
    // Spring Mail
    implementation 'org.springframework.boot:spring-boot-starter-mail'

    // Jakarta Mail (reemplazo de javax.mail)
    implementation 'jakarta.mail:jakarta.mail-api:2.1.0'

    // Lombok (para anotaciones @RequiredArgsConstructor, @Slf4j)
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'

    // Spring Data JPA (para auditoría en BD)
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
}
```

O si usas **Maven** (`pom.xml`):

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-mail</artifactId>
    </dependency>

    <dependency>
        <groupId>jakarta.mail</groupId>
        <artifactId>jakarta.mail-api</artifactId>
        <version>2.1.0</version>
    </dependency>

    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
</dependencies>
```

---

## 📧 Configuración SMTP

### **En `application.properties`:**

```properties
# ============================================================
# CONFIGURACIÓN DE EMAIL (SMTP Corporativo EsSalud)
# ============================================================
spring.mail.host=${MAIL_HOST:172.20.0.227}
spring.mail.port=${MAIL_PORT:25}
spring.mail.username=${MAIL_USERNAME:cenate.contacto@essalud.gob.pe}
spring.mail.password=${MAIL_PASSWORD:essaludc50}

# Configuración de autenticación
spring.mail.properties.mail.smtp.auth=${MAIL_SMTP_AUTH:false}
spring.mail.properties.mail.smtp.starttls.enable=${MAIL_SMTP_STARTTLS:true}
spring.mail.properties.mail.smtp.ssl.enable=${MAIL_SMTP_SSL:false}
spring.mail.properties.mail.smtp.starttls.required=${MAIL_SMTP_STARTTLS_REQUIRED:false}

# Timeouts (aumentados a 30s para conexiones lentas)
spring.mail.properties.mail.smtp.connectiontimeout=30000
spring.mail.properties.mail.smtp.timeout=30000
spring.mail.properties.mail.smtp.writetimeout=30000

# Debug SMTP (desactivar en producción)
spring.mail.properties.mail.debug=${MAIL_DEBUG:true}
logging.level.org.springframework.mail=DEBUG
logging.level.com.sun.mail=DEBUG
logging.level.jakarta.mail=DEBUG

# Remitente
app.mail.from-name=TU_PROYECTO Sistema
app.mail.from-address=${MAIL_USERNAME:cenate.contacto@essalud.gob.pe}

# URL del frontend (para enlaces en emails)
app.frontend.url=${FRONTEND_URL:http://localhost:3000}
```

### **Variables de Entorno (para producción):**

```bash
# Archivo: .env o sistema operativo
export MAIL_HOST=172.20.0.227
export MAIL_PORT=25
export MAIL_USERNAME=cenate.contacto@essalud.gob.pe
export MAIL_PASSWORD=essaludc50
export FRONTEND_URL=http://10.0.89.239
export MAIL_DEBUG=false
```

---

## 🏗️ Estructura del Servicio

### **1. Modelo de Auditoría (`EmailAuditLog.java`)**

```java
@Entity
@Table(name = "email_audit_log")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "destinatario", nullable = false)
    private String destinatario;

    @Column(name = "tipo_correo") // BIENVENIDO, RECUPERACION, GENERAL
    private String tipoCorreo;

    @Column(name = "asunto")
    private String asunto;

    @Column(name = "username")
    private String username;

    @Column(name = "id_usuario")
    private Long idUsuario;

    @Column(name = "smtp_host")
    private String smtpHost;

    @Column(name = "smtp_port")
    private Integer smtpPort;

    @Column(name = "estado") // INTENTO, ENVIADO, FALLIDO
    private String estado;

    @Column(name = "tiempo_respuesta_ms")
    private Long tiempoRespuestaMs;

    @Column(name = "token_asociado") // Para recuperación de contraseña
    private String tokenAsociado;

    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
```

### **2. Repositorio (`EmailAuditLogRepository.java`)**

```java
@Repository
public interface EmailAuditLogRepository extends JpaRepository<EmailAuditLog, Long> {

    List<EmailAuditLog> findByDestinatario(String destinatario);

    List<EmailAuditLog> findByTipoCorreo(String tipoCorreo);

    List<EmailAuditLog> findByUsername(String username);

    List<EmailAuditLog> findByEstado(String estado);

    List<EmailAuditLog> findByCreatedAtAfter(LocalDateTime fecha);
}
```

### **3. Servicio de Auditoría (`EmailAuditLogService.java`)**

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailAuditLogService {

    private final EmailAuditLogRepository emailAuditLogRepository;

    /**
     * Registra intento de envío de correo
     */
    public void registrarIntento(String destinatario, String tipoCorreo, String asunto,
                                 String username, Long idUsuario, String smtpHost,
                                 Integer smtpPort, String tokenAsociado) {
        EmailAuditLog auditLog = EmailAuditLog.builder()
            .destinatario(destinatario)
            .tipoCorreo(tipoCorreo)
            .asunto(asunto)
            .username(username)
            .idUsuario(idUsuario)
            .smtpHost(smtpHost)
            .smtpPort(smtpPort)
            .estado("INTENTO")
            .tokenAsociado(tokenAsociado)
            .build();

        emailAuditLogRepository.save(auditLog);
        log.info("Intento de envío registrado: {} -> {}", tipoCorreo, destinatario);
    }

    /**
     * Marca correo como enviado exitosamente
     */
    public void marcarEnviado(String destinatario, Long tiempoRespuestaMs) {
        List<EmailAuditLog> intentos = emailAuditLogRepository
            .findByDestinatario(destinatario);

        if (!intentos.isEmpty()) {
            EmailAuditLog ultimo = intentos.get(intentos.size() - 1);
            if ("INTENTO".equals(ultimo.getEstado())) {
                ultimo.setEstado("ENVIADO");
                ultimo.setTiempoRespuestaMs(tiempoRespuestaMs);
                emailAuditLogRepository.save(ultimo);
                log.info("Correo marcado como ENVIADO: {} ({} ms)",
                    destinatario, tiempoRespuestaMs);
            }
        }
    }

    /**
     * Marca correo como fallido
     */
    public void marcarFallido(String destinatario, String error) {
        List<EmailAuditLog> intentos = emailAuditLogRepository
            .findByDestinatario(destinatario);

        if (!intentos.isEmpty()) {
            EmailAuditLog ultimo = intentos.get(intentos.size() - 1);
            ultimo.setEstado("FALLIDO");
            emailAuditLogRepository.save(ultimo);
            log.error("Correo FALLIDO: {} - Error: {}", destinatario, error);
        }
    }
}
```

### **4. Servicio de Emails (`EmailService.java`)**

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final EmailAuditLogService emailAuditLogService;

    @Value("${app.mail.from-name:TU_PROYECTO Sistema}")
    private String fromName;

    @Value("${app.mail.from-address:contacto@ejemplo.com}")
    private String fromAddress;

    @Value("${spring.mail.host:172.20.0.227}")
    private String mailHost;

    @Value("${spring.mail.port:25}")
    private int mailPort;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    /**
     * Enviar correo de bienvenida cuando se aprueba una solicitud
     */
    @Async
    public void enviarCorreoAprobacion(String destinatario, String nombreCompleto,
                                       String usuario, String passwordTemporal) {
        String asunto = "TU_PROYECTO - Tu solicitud ha sido aprobada";

        String contenido = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #1a56db; color: white; padding: 20px; text-align: center; }
                    .content { background-color: #f9fafb; padding: 30px; }
                    .credentials { background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; }
                    .button { display: inline-block; background-color: #1a56db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>¡Bienvenido!</h1>
                    </div>
                    <div class="content">
                        <p>Estimado/a <strong>%s</strong>,</p>
                        <p>Tu solicitud ha sido <strong style="color: #059669;">APROBADA</strong>.</p>

                        <div class="credentials">
                            <h3>Tus credenciales:</h3>
                            <p><strong>Usuario:</strong> <code>%s</code></p>
                            <p><strong>Contraseña:</strong> <code>%s</code></p>
                        </div>

                        <p><strong>Importante:</strong> Cambia tu contraseña en el primer inicio de sesión.</p>
                        <a href="%s" class="button">Acceder al Sistema</a>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(nombreCompleto, usuario, passwordTemporal, frontendUrl);

        enviarCorreoHTML(destinatario, asunto, contenido, "APROBACION");
    }

    /**
     * Enviar correo de recuperación de contraseña
     */
    @Async
    public void enviarCorreoRecuperacion(String destinatario, String nombreCompleto,
                                         String usuario, String enlaceRecuperacion,
                                         Long idUsuario, String token) {
        String asunto = "TU_PROYECTO - Restablecer tu contraseña";

        String contenido = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #f59e0b; color: white; padding: 20px; text-align: center; }
                    .content { background-color: #f9fafb; padding: 30px; }
                    .button { display: inline-block; background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                    .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Restablecer Contraseña</h1>
                    </div>
                    <div class="content">
                        <p>Estimado/a <strong>%s</strong>,</p>
                        <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>

                        <a href="%s" class="button">Restablecer Contraseña</a>

                        <div class="warning">
                            <strong>Importante:</strong>
                            <ul>
                                <li>Este enlace expira en 6 horas</li>
                                <li>Solo puede usarse una vez</li>
                                <li>Si no solicitaste esto, ignora este correo</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(nombreCompleto, enlaceRecuperacion);

        enviarCorreoHTML(destinatario, asunto, contenido, "RECUPERACION",
            idUsuario, usuario, token);
    }

    /**
     * Método base para enviar correos HTML
     */
    private void enviarCorreoHTML(String destinatario, String asunto,
                                  String contenidoHTML, String tipoCorreo) {
        enviarCorreoHTML(destinatario, asunto, contenidoHTML, tipoCorreo,
            null, null, null);
    }

    /**
     * Método base para enviar correos HTML con auditoría
     */
    private void enviarCorreoHTML(String destinatario, String asunto,
                                  String contenidoHTML, String tipoCorreo,
                                  Long idUsuario, String username, String token) {
        log.info("=== INICIANDO ENVÍO DE CORREO ===");
        log.info("Destinatario: {}", destinatario);
        log.info("Tipo: {}", tipoCorreo);

        long tiempoInicio = System.currentTimeMillis();

        // Registrar intento
        emailAuditLogService.registrarIntento(destinatario, tipoCorreo, asunto,
            username, idUsuario, mailHost, mailPort, token);

        try {
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");

            helper.setFrom(fromAddress, fromName);
            helper.setTo(destinatario);
            helper.setSubject(asunto);
            helper.setText(contenidoHTML, true);

            mailSender.send(mensaje);

            long tiempoRespuesta = System.currentTimeMillis() - tiempoInicio;
            log.info("✅ Correo enviado a: {} ({} ms)", destinatario, tiempoRespuesta);

            emailAuditLogService.marcarEnviado(destinatario, tiempoRespuesta);

        } catch (MessagingException e) {
            log.error("❌ Error al enviar correo a {}: {}", destinatario, e.getMessage());
            emailAuditLogService.marcarFallido(destinatario, e.getMessage());
        }
    }
}
```

---

## 📝 Implementación Paso a Paso

### **Paso 1: Crear las Tablas en la BD**

```sql
-- Tabla de auditoría de correos
CREATE TABLE email_audit_log (
    id BIGSERIAL PRIMARY KEY,
    destinatario VARCHAR(255) NOT NULL,
    tipo_correo VARCHAR(50),
    asunto VARCHAR(255),
    username VARCHAR(100),
    id_usuario BIGINT,
    smtp_host VARCHAR(100),
    smtp_port INTEGER,
    estado VARCHAR(20), -- INTENTO, ENVIADO, FALLIDO
    tiempo_respuesta_ms BIGINT,
    token_asociado TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_email_destinatario ON email_audit_log(destinatario);
CREATE INDEX idx_email_tipo ON email_audit_log(tipo_correo);
CREATE INDEX idx_email_estado ON email_audit_log(estado);
CREATE INDEX idx_email_usuario ON email_audit_log(username);
```

### **Paso 2: Agregar Anotación @EnableAsync**

En tu clase principal (`Application.java`):

```java
@SpringBootApplication
@EnableAsync
public class MiProyectoApplication {
    public static void main(String[] args) {
        SpringApplication.run(MiProyectoApplication.class, args);
    }
}
```

### **Paso 3: Inyectar EmailService donde lo necesites**

```java
@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final EmailService emailService;
    private final UsuarioRepository usuarioRepository;

    public void aprobarUsuario(Long idUsuario) {
        Usuario usuario = usuarioRepository.findById(idUsuario).orElseThrow();

        // ... lógica de aprobación ...

        // Enviar correo
        emailService.enviarCorreoAprobacion(
            usuario.getEmail(),
            usuario.getNombreCompleto(),
            usuario.getUsername(),
            "TempPassword123!" // Password temporal
        );
    }

    public void solicitudRecuperacion(String email, String usuario) {
        String token = generarTokenJWT(email, 6); // 6 horas
        String enlace = String.format(
            "%s/reset-password?token=%s",
            "http://localhost:3000",
            token
        );

        emailService.enviarCorreoRecuperacion(
            email,
            usuario,
            email,
            enlace,
            null,
            token
        );
    }
}
```

---

## 💡 Ejemplos de Uso

### **Ejemplo 1: Aprobar Solicitud**

```java
// En tu servicio de solicitudes
@Service
@RequiredArgsConstructor
public class SolicitudService {

    private final EmailService emailService;

    public void aprobarSolicitud(Long solicitudId) {
        Solicitud solicitud = solicitudRepository.findById(solicitudId).orElseThrow();

        // Crear usuario
        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setNombre(solicitud.getNombre());
        nuevoUsuario.setEmail(solicitud.getEmail());
        nuevoUsuario.setUsername(solicitud.getDNI());
        String passwordTemporal = generarPasswordTemporal();
        nuevoUsuario.setPassword(encriptarPassword(passwordTemporal));

        usuarioRepository.save(nuevoUsuario);

        // Enviar correo de bienvenida
        emailService.enviarCorreoAprobacion(
            solicitud.getEmail(),
            solicitud.getNombre(),
            nuevoUsuario.getUsername(),
            passwordTemporal
        );

        // Marcar solicitud como aprobada
        solicitud.setEstado("APROBADO");
        solicitudRepository.save(solicitud);
    }

    private String generarPasswordTemporal() {
        return UUID.randomUUID().toString().substring(0, 12);
    }
}
```

### **Ejemplo 2: Recuperación de Contraseña**

```java
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final EmailService emailService;
    private final UsuarioRepository usuarioRepository;
    private final JwtTokenProvider jwtProvider;

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        Usuario usuario = usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        // Generar token de recuperación (válido 6 horas)
        String token = jwtProvider.generarTokenRecuperacion(usuario.getId(), 6);

        String enlace = String.format(
            "%s/reset-password?token=%s",
            "http://localhost:3000",
            token
        );

        // Enviar correo
        emailService.enviarCorreoRecuperacion(
            usuario.getEmail(),
            usuario.getNombreCompleto(),
            usuario.getUsername(),
            enlace,
            usuario.getId(),
            token
        );

        return ResponseEntity.ok(Map.of(
            "message", "Correo de recuperación enviado"
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");

        // Validar token
        Long userId = jwtProvider.validarTokenRecuperacion(token);

        Usuario usuario = usuarioRepository.findById(userId).orElseThrow();
        usuario.setPassword(encriptarPassword(newPassword));
        usuarioRepository.save(usuario);

        return ResponseEntity.ok(Map.of(
            "message", "Contraseña actualizada exitosamente"
        ));
    }
}
```

---

## 📊 Auditoría de Correos

### **Endpoint para consultar historial:**

```java
@RestController
@RequestMapping("/api/email-audit")
@RequiredArgsConstructor
public class EmailAuditController {

    private final EmailAuditLogRepository emailAuditLogRepository;

    @GetMapping("/logs")
    public ResponseEntity<List<EmailAuditLog>> obtenerLogs(
            @RequestParam(required = false) String destinatario,
            @RequestParam(required = false) String tipoCorreo,
            @RequestParam(required = false) String estado) {

        if (destinatario != null) {
            return ResponseEntity.ok(
                emailAuditLogRepository.findByDestinatario(destinatario)
            );
        }

        if (tipoCorreo != null) {
            return ResponseEntity.ok(
                emailAuditLogRepository.findByTipoCorreo(tipoCorreo)
            );
        }

        if (estado != null) {
            return ResponseEntity.ok(
                emailAuditLogRepository.findByEstado(estado)
            );
        }

        return ResponseEntity.ok(emailAuditLogRepository.findAll());
    }

    @GetMapping("/estadisticas")
    public ResponseEntity<?> obtenerEstadisticas() {
        return ResponseEntity.ok(Map.of(
            "totalEnviados", emailAuditLogRepository.findByEstado("ENVIADO").size(),
            "totalFallidos", emailAuditLogRepository.findByEstado("FALLIDO").size(),
            "totalIntentos", emailAuditLogRepository.findByEstado("INTENTO").size()
        ));
    }
}
```

---

## 🐛 Troubleshooting

| Problema | Causa | Solución |
|----------|-------|----------|
| `javax.mail.MessagingException: 530 5.7.1 Authentication required` | SMTP requiere autenticación | Verificar `MAIL_SMTP_AUTH=true` |
| `Connection timed out` | SMTP no responde | Verificar conectividad a `172.20.0.227:25` |
| `Correos no llegan` | Relay rechaza el correo | Verificar formato email y dominio |
| `SSL Exception` | TLS mal configurado | Verificar `MAIL_SMTP_SSL` vs `STARTTLS` |
| `Token inválido/expirado` | Token JWT venció | Implementar reenvío de enlace en frontend |

---

## ✅ Checklist de Implementación

- [ ] Agregar dependencias en `build.gradle` o `pom.xml`
- [ ] Crear tabla `email_audit_log` en BD
- [ ] Crear modelo `EmailAuditLog.java`
- [ ] Crear repositorio `EmailAuditLogRepository.java`
- [ ] Crear servicio `EmailAuditLogService.java`
- [ ] Crear servicio `EmailService.java`
- [ ] Configurar variables en `application.properties`
- [ ] Agregar `@EnableAsync` en clase principal
- [ ] Crear controladores para endpoints
- [ ] Probar envío en desarrollo
- [ ] Testear en staging con credenciales reales
- [ ] Validar logs en tabla `email_audit_log`
- [ ] Deployar en producción

---

## 📞 Soporte

Para problemas específicos del servidor SMTP EsSalud, contactar a:
- **Host:** `172.20.0.227`
- **Puerto:** `25`
- **Soporte:** Equipo de Infraestructura EsSalud

---

**Documento creado:** 2026-02-16
**Base:** Implementación CENATE v1.68.5
