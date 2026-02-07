package com.styp.cenate.service.email;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final EmailAuditLogService emailAuditLogService;

    @Value("${app.mail.from-name:CENATE Sistema}")
    private String fromName;

    @Value("${app.mail.from-address:cenate.contacto@essalud.gob.pe}")
    private String fromAddress;

    @Value("${spring.mail.host:172.20.0.227}")
    private String mailHost;

    @Value("${spring.mail.port:25}")
    private int mailPort;

    /**
     * Enviar correo de bienvenida cuando se aprueba una solicitud de usuario externo
     */
    @Async
    public void enviarCorreoAprobacionSolicitud(String destinatario, String nombreCompleto,
                                                  String usuario, String passwordTemporal) {
        String asunto = "CENATE - Tu solicitud de acceso ha sido aprobada";

        String contenido = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #1a56db; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
                    .credentials { background-color: #fff; padding: 20px; border-radius: 8px; border: 1px solid #d1d5db; margin: 20px 0; }
                    .credential-item { margin: 10px 0; }
                    .credential-label { font-weight: bold; color: #374151; }
                    .credential-value { font-family: monospace; background-color: #f3f4f6; padding: 8px 12px; border-radius: 4px; display: inline-block; }
                    .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
                    .button { display: inline-block; background-color: #1a56db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Bienvenido a CENATE</h1>
                    </div>
                    <div class="content">
                        <p>Estimado/a <strong>%s</strong>,</p>

                        <p>Nos complace informarte que tu solicitud de acceso al sistema CENATE ha sido <strong style="color: #059669;">APROBADA</strong>.</p>

                        <div class="credentials">
                            <h3 style="margin-top: 0; color: #1a56db;">Tus credenciales de acceso:</h3>
                            <div class="credential-item">
                                <span class="credential-label">Usuario:</span>
                                <span class="credential-value">%s</span>
                            </div>
                            <div class="credential-item">
                                <span class="credential-label">Contraseña temporal:</span>
                                <span class="credential-value">%s</span>
                            </div>
                        </div>

                        <div class="warning">
                            <strong>Importante:</strong> Por seguridad, deberás cambiar tu contraseña en el primer inicio de sesión.
                        </div>

                        <div style="background-color: #dbeafe; border-left: 4px solid #1a56db; padding: 15px; margin: 20px 0;">
                            <strong>🏥 Acceso desde Red EsSalud:</strong>
                            <p style="margin: 10px 0 0 0;">El sistema <strong>Intranet CENATE</strong> solo es accesible desde la red interna de EsSalud. Asegúrate de estar conectado a la <strong>red corporativa o VPN</strong> para acceder al sistema.</p>
                        </div>

                        <p>Ya puedes acceder al sistema utilizando las credenciales proporcionadas.</p>

                    </div>
                    <div class="footer">
                        <p>Este es un correo automático, por favor no responda a este mensaje.</p>
                        <p>&copy; 2025 CENATE - Centro Nacional de Telemedicina</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(nombreCompleto, usuario, passwordTemporal);

        enviarCorreoHTML(destinatario, asunto, contenido);
    }

    /**
     * Enviar correo de rechazo de solicitud
     */
    @Async
    public void enviarCorreoRechazoSolicitud(String destinatario, String nombreCompleto, String motivoRechazo) {
        String asunto = "CENATE - Respuesta a tu solicitud de acceso";

        String contenido = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
                    .reason { background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Solicitud No Aprobada</h1>
                    </div>
                    <div class="content">
                        <p>Estimado/a <strong>%s</strong>,</p>

                        <p>Lamentamos informarte que tu solicitud de acceso al sistema CENATE no ha sido aprobada en esta ocasión.</p>

                        <div class="reason">
                            <strong>Motivo:</strong>
                            <p style="margin-bottom: 0;">%s</p>
                        </div>

                        <p>Si consideras que esto es un error o tienes alguna consulta, por favor contacta al administrador del sistema.</p>

                    </div>
                    <div class="footer">
                        <p>Este es un correo automático, por favor no responda a este mensaje.</p>
                        <p>&copy; 2025 CENATE - Centro Nacional de Telemedicina</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(nombreCompleto, motivoRechazo != null ? motivoRechazo : "No especificado");

        enviarCorreoHTML(destinatario, asunto, contenido);
    }

    /**
     * Enviar correo de bienvenida cuando se crea un usuario directamente (por admin)
     */
    @Async
    public void enviarCorreoBienvenidaUsuario(String destinatario, String nombreCompleto,
                                               String usuario, String passwordTemporal) {
        String asunto = "CENATE - Cuenta de usuario creada";

        String contenido = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #1a56db; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
                    .credentials { background-color: #fff; padding: 20px; border-radius: 8px; border: 1px solid #d1d5db; margin: 20px 0; }
                    .credential-item { margin: 10px 0; }
                    .credential-label { font-weight: bold; color: #374151; }
                    .credential-value { font-family: monospace; background-color: #f3f4f6; padding: 8px 12px; border-radius: 4px; display: inline-block; }
                    .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Bienvenido a CENATE</h1>
                    </div>
                    <div class="content">
                        <p>Estimado/a <strong>%s</strong>,</p>

                        <p>Se ha creado una cuenta de usuario para ti en el sistema CENATE.</p>

                        <div class="credentials">
                            <h3 style="margin-top: 0; color: #1a56db;">Tus credenciales de acceso:</h3>
                            <div class="credential-item">
                                <span class="credential-label">Usuario:</span>
                                <span class="credential-value">%s</span>
                            </div>
                            <div class="credential-item">
                                <span class="credential-label">Contraseña temporal:</span>
                                <span class="credential-value">%s</span>
                            </div>
                        </div>

                        <div class="warning">
                            <strong>Importante:</strong> Por seguridad, deberás cambiar tu contraseña en el primer inicio de sesión.
                        </div>

                        <div style="background-color: #dbeafe; border-left: 4px solid #1a56db; padding: 15px; margin: 20px 0;">
                            <strong>🏥 Acceso desde Red EsSalud:</strong>
                            <p style="margin: 10px 0 0 0;">El sistema <strong>Intranet CENATE</strong> solo es accesible desde la red interna de EsSalud. Asegúrate de estar conectado a la <strong>red corporativa o VPN</strong> para acceder al sistema.</p>
                        </div>

                        <p>Ya puedes acceder al sistema utilizando las credenciales proporcionadas.</p>

                    </div>
                    <div class="footer">
                        <p>Este es un correo automático, por favor no responda a este mensaje.</p>
                        <p>&copy; 2025 CENATE - Centro Nacional de Telemedicina</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(nombreCompleto, usuario, passwordTemporal);

        enviarCorreoHTML(destinatario, asunto, contenido);
    }

    /**
     * Enviar correo con enlace para cambiar contraseña (nuevo usuario o recuperación)
     */
    @Async
    public void enviarCorreoCambioContrasena(String destinatario, String nombreCompleto,
                                              String usuario, String enlace, int horasExpiracion,
                                              String tipoAccion) {
        enviarCorreoCambioContrasena(destinatario, nombreCompleto, usuario, enlace,
            horasExpiracion, tipoAccion, null, null, null);
    }

    /**
     * Enviar correo con enlace para cambiar contraseña (con auditoría)
     */
    @Async
    public void enviarCorreoCambioContrasena(String destinatario, String nombreCompleto,
                                              String usuario, String enlace, int horasExpiracion,
                                              String tipoAccion, Long idUsuario, String tokenAsociado, String tokenValue) {
        String asunto = "BIENVENIDO".equals(tipoAccion)
                ? "CENATE - Configura tu contraseña de acceso"
                : "CENATE - Restablece tu contraseña";

        String tituloHeader = "BIENVENIDO".equals(tipoAccion)
                ? "Bienvenido a CENATE"
                : "Restablecer Contraseña";

        String mensajePrincipal = "BIENVENIDO".equals(tipoAccion)
                ? "Tu cuenta en el sistema CENATE ha sido creada exitosamente. Para completar tu registro, debes configurar tu contraseña."
                : "Hemos recibido una solicitud para restablecer tu contraseña en el sistema CENATE.";

        String textoBoton = "BIENVENIDO".equals(tipoAccion)
                ? "Activar mi Cuenta"
                : "Restablecer Contraseña";

        String contenido = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #1a56db; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
                    .info-box { background-color: #fff; padding: 15px; border-radius: 8px; border: 1px solid #d1d5db; margin: 20px 0; }
                    .button-container { text-align: center; margin: 30px 0; }
                    .button { display: inline-block; background-color: #1a56db; color: white !important; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; }
                    .button:hover { background-color: #1e40af; }
                    .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
                    .link-fallback { word-break: break-all; font-size: 12px; color: #6b7280; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>%s</h1>
                    </div>
                    <div class="content">
                        <p>Estimado/a <strong>%s</strong>,</p>

                        <p>%s</p>

                        <div class="info-box">
                            <strong>Tu usuario de acceso:</strong> %s
                        </div>

                        <div class="button-container">
                            <a href="%s" class="button">%s</a>
                        </div>

                        <div class="warning">
                            <strong>Importante:</strong>
                            <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                                <li>Este enlace expira en <strong>%d horas</strong></li>
                                <li>Solo puede usarse una vez</li>
                                <li>Si no solicitaste este cambio, ignora este correo</li>
                            </ul>
                        </div>

                        <div style="background-color: #dbeafe; border-left: 4px solid #1a56db; padding: 15px; margin: 20px 0;">
                            <strong>🏥 Acceso desde Red EsSalud:</strong>
                            <p style="margin: 10px 0 0 0;">El sistema <strong>Intranet CENATE</strong> solo es accesible desde la red interna de EsSalud. Asegúrate de estar conectado a la <strong>red corporativa o VPN</strong> antes de hacer clic en el enlace.</p>
                        </div>

                        <p class="link-fallback">
                            Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
                            <a href="%s">%s</a>
                        </p>

                    </div>
                    <div class="footer">
                        <p>Este es un correo automático, por favor no responda a este mensaje.</p>
                        <p>&copy; 2025 CENATE - Centro Nacional de Telemedicina</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(tituloHeader, nombreCompleto, mensajePrincipal, usuario,
                          enlace, textoBoton, horasExpiracion, enlace, enlace);

        String tipoCorreoAuditoria = "BIENVENIDO".equals(tipoAccion) ? "BIENVENIDO" : "RECUPERACION";
        enviarCorreoHTML(destinatario, asunto, contenido, tipoCorreoAuditoria,
            idUsuario, usuario, tokenValue);
    }

    /**
     * Enviar correo cuando se resetea la contraseña de un usuario (DEPRECADO - usar enviarCorreoCambioContrasena)
     */
    @Async
    public void enviarCorreoResetPassword(String destinatario, String nombreCompleto,
                                           String usuario, String nuevaPassword) {
        String asunto = "CENATE - Tu contraseña ha sido restablecida";

        String contenido = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
                    .credentials { background-color: #fff; padding: 20px; border-radius: 8px; border: 1px solid #d1d5db; margin: 20px 0; }
                    .credential-item { margin: 10px 0; }
                    .credential-label { font-weight: bold; color: #374151; }
                    .credential-value { font-family: monospace; background-color: #f3f4f6; padding: 8px 12px; border-radius: 4px; display: inline-block; }
                    .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Contraseña Restablecida</h1>
                    </div>
                    <div class="content">
                        <p>Estimado/a <strong>%s</strong>,</p>

                        <p>Tu contraseña del sistema CENATE ha sido <strong>restablecida</strong> por un administrador.</p>

                        <div class="credentials">
                            <h3 style="margin-top: 0; color: #f59e0b;">Tus nuevas credenciales:</h3>
                            <div class="credential-item">
                                <span class="credential-label">Usuario:</span>
                                <span class="credential-value">%s</span>
                            </div>
                            <div class="credential-item">
                                <span class="credential-label">Nueva contraseña:</span>
                                <span class="credential-value">%s</span>
                            </div>
                        </div>

                        <div class="warning">
                            <strong>Importante:</strong> Por seguridad, deberás cambiar tu contraseña en el próximo inicio de sesión.
                        </div>

                        <div style="background-color: #dbeafe; border-left: 4px solid #1a56db; padding: 15px; margin: 20px 0;">
                            <strong>🏥 Acceso desde Red EsSalud:</strong>
                            <p style="margin: 10px 0 0 0;">El sistema <strong>Intranet CENATE</strong> solo es accesible desde la red interna de EsSalud. Asegúrate de estar conectado a la <strong>red corporativa o VPN</strong> para acceder al sistema.</p>
                        </div>

                        <p>Si no solicitaste este cambio, por favor contacta inmediatamente al administrador del sistema.</p>

                    </div>
                    <div class="footer">
                        <p>Este es un correo automático, por favor no responda a este mensaje.</p>
                        <p>&copy; 2025 CENATE - Centro Nacional de Telemedicina</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(nombreCompleto, usuario, nuevaPassword);

        enviarCorreoHTML(destinatario, asunto, contenido);
    }

    /**
     * Método base para enviar correos HTML con manejo robusto de errores y auditoría
     */
    private void enviarCorreoHTML(String destinatario, String asunto, String contenidoHTML) {
        enviarCorreoHTML(destinatario, asunto, contenidoHTML, "GENERAL", null, null, null);
    }

    /**
     * Método base para enviar correos HTML con auditoría integrada
     */
    private void enviarCorreoHTML(String destinatario, String asunto, String contenidoHTML,
                                  String tipoCorreo, Long idUsuario, String username, String tokenAsociado) {
        log.info("=== INICIANDO ENVÍO DE CORREO ===");
        log.info("Destinatario: {}", destinatario);
        log.info("Asunto: {}", asunto);
        log.info("From: {} <{}>", fromName, fromAddress);

        long tiempoInicio = System.currentTimeMillis();

        // Registrar intento de envío
        emailAuditLogService.registrarIntento(destinatario, tipoCorreo, asunto,
            username, idUsuario, mailHost, mailPort, tokenAsociado);

        try {
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");

            helper.setFrom(fromAddress, fromName);
            helper.setTo(destinatario);
            helper.setSubject(asunto);
            helper.setText(contenidoHTML, true);

            log.info("Mensaje preparado, enviando...");
            mailSender.send(mensaje);

            long tiempoRespuesta = System.currentTimeMillis() - tiempoInicio;
            log.info("✅ Correo enviado exitosamente a: {} ({} ms)", destinatario, tiempoRespuesta);

            // Marcar como enviado en auditoría
            emailAuditLogService.marcarEnviado(destinatario, tiempoRespuesta);

        } catch (MessagingException e) {
            log.error("❌ MessagingException al enviar correo a {}: {}", destinatario, e.getMessage());
            log.error("Stack trace: ", e);

            // Marcar como fallido en auditoría
            emailAuditLogService.marcarFallido(destinatario, e.getMessage(), "MESSAGING_ERROR");

            diagnosticarErrorSMTP(e);
        } catch (org.springframework.mail.MailException e) {
            log.error("❌ MailException al enviar correo a {}: {}", destinatario, e.getMessage());
            log.error("Stack trace: ", e);

            // Marcar como fallido en auditoría
            String codigoError = e.getMessage().contains("Connection") ? "CONNECTION_ERROR" : "MAIL_ERROR";
            emailAuditLogService.marcarFallido(destinatario, e.getMessage(), codigoError);

            diagnosticarErrorSMTP(e);
        } catch (Exception e) {
            log.error("❌ Error inesperado al enviar correo a {}: {} - {}", destinatario, e.getClass().getName(), e.getMessage());
            log.error("Stack trace: ", e);

            // Marcar como fallido en auditoría
            emailAuditLogService.marcarFallido(destinatario, e.getMessage(), "UNKNOWN_ERROR");
        }
    }

    /**
     * Método para diagnosticar problemas SMTP
     */
    private void diagnosticarErrorSMTP(Exception e) {
        String mensaje = e.getMessage();

        if (mensaje == null) mensaje = "Error desconocido";

        log.warn("🔍 DIAGNÓSTICO DE ERROR SMTP:");

        if (mensaje.contains("bad greeting") || mensaje.contains("[EOF]")) {
            log.warn("  ⚠️ PROBLEMA: El servidor SMTP no responde correctamente");
            log.warn("  📍 Causa probable: Relay SMTP no está corriendo");
            log.warn("  ✅ Soluciones:");
            log.warn("     1. Ejecutar: ./start-smtp-relay.sh");
            log.warn("     2. Verificar que el contenedor smtp-relay-cenate está corriendo");
        } else if (mensaje.contains("Authentication failed") || mensaje.contains("535")) {
            log.warn("  ⚠️ PROBLEMA: Autenticación SMTP fallida");
            log.warn("  📍 Causa probable: Credenciales incorrectas");
            log.warn("  ✅ Soluciones: Verificar MAIL_USERNAME y MAIL_PASSWORD");
        } else if (mensaje.contains("Connection refused") || mensaje.contains("connect timed out")) {
            log.warn("  ⚠️ PROBLEMA: No se puede conectar al servidor SMTP");
            log.warn("  📍 Causa probable: Relay no corriendo o servidor EsSalud no accesible");
            log.warn("  ✅ Soluciones:");
            log.warn("     1. Ejecutar: ./start-smtp-relay.sh");
            log.warn("     2. Verificar VPN/red hacia 172.20.0.227:25");
        } else {
            log.warn("  ⚠️ PROBLEMA: {}", mensaje);
        }
    }

    /**
     * ⚠️ DEPRECATED v1.55.0: Método incompleto (invocaba enviarCorreo() que no existe)
     * TODO v1.61.0: Implementar correctamente cuando se resuelvan dependencias
     *
     * 🆕 v1.58.2: Enviar notificación de ECG nuevo a coordinador
     */
    /*
    @Async
    public void enviarNotificacionECGNuevo(String emailCoordinador, String nombreCoordinador,
                                           String pacienteNombre, String pacienteDni,
                                           String ipress, Boolean esUrgente) {
        String asunto = esUrgente ? "🚨 URGENTE - Nuevo ECG cargado: " + pacienteNombre
                                  : "📊 Nuevo ECG cargado: " + pacienteNombre;

        String urgenciaHTML = esUrgente ?
            "<div style='background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;'>" +
            "<strong style='color: #991b1b;'>⚠️ URGENTE:</strong> Este ECG ha sido marcado como urgente." +
            "</div>" : "";

        String contenido = String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #0d5ba9; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
                    .patient-info { background-color: #fff; padding: 20px; border-radius: 8px; border-left: 4px solid #0d5ba9; margin: 20px 0; }
                    .info-row { margin: 10px 0; }
                    .info-label { font-weight: bold; color: #374151; display: inline-block; width: 120px; }
                    .button { display: inline-block; background-color: #0d5ba9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
                    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📊 Nuevo ECG Cargado</h1>
                    </div>
                    <div class="content">
                        <p>Estimado/a <strong>%s</strong>,</p>

                        <p>Se ha cargado un nuevo electrocardiograma (ECG) en el sistema CENATE.</p>

                        %s

                        <div class="patient-info">
                            <h3 style="margin-top: 0; color: #0d5ba9;">Información del Paciente:</h3>
                            <div class="info-row">
                                <span class="info-label">Paciente:</span>
                                <span>%s</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">DNI:</span>
                                <span>%s</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">IPRESS Origen:</span>
                                <span>%s</span>
                            </div>
                        </div>

                        <p>Por favor, revisa el ECG y procesa según sea necesario. El ECG está disponible en tu bandeja de trabajo de CENATE.</p>

                        <a href="http://cenate.essalud.gob.pe/citas/gestion-asegurado" class="button">Ir a CENATE</a>
                    </div>
                    <div class="footer">
                        <p>Este es un correo automático, por favor no responda a este mensaje.</p>
                        <p>&copy; 2025 CENATE - Centro Nacional de Telemedicina</p>
                    </div>
                </div>
            </body>
            </html>
            """, nombreCoordinador, urgenciaHTML, pacienteNombre, pacienteDni, ipress);

        // DEPRECATED: enviarCorreo() method does not exist
        // enviarCorreo(emailCoordinador, asunto, contenido);
        log.info("📧 Notificación ECG enviada a coordinador: {}", emailCoordinador);
    }
    */

    /**
     * Método de prueba para verificar conexión SMTP (síncrono)
     */
    public boolean probarConexionSMTP(String emailPrueba) {
        log.info("=== PRUEBA DE CONEXIÓN SMTP ===");
        log.info("Servidor SMTP: {}:{}", mailHost, mailPort);
        log.info("From Address configurado: {}", fromAddress);
        log.info("From Name configurado: {}", fromName);

        try {
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");

            helper.setFrom(fromAddress, fromName);
            helper.setTo(emailPrueba);
            helper.setSubject("CENATE - Prueba de conexión SMTP");
            helper.setText("<h1>Prueba exitosa</h1><p>Si recibes este correo, la conexión SMTP está funcionando correctamente.</p>", true);

            log.info("Enviando correo de prueba a: {}", emailPrueba);
            mailSender.send(mensaje);
            log.info("✅ Correo de prueba enviado exitosamente");
            return true;

        } catch (Exception e) {
            log.error("❌ Error en prueba SMTP: {} - {}", e.getClass().getName(), e.getMessage());
            if (e.getCause() != null) {
                log.error("Causa: {}", e.getCause().getMessage());
            }
            e.printStackTrace();
            return false;
        }
    }
}
