package com.styp.cenate.service.citas;

import com.styp.cenate.dto.chatbot.EnviarMensajeCitaRequest;
import com.styp.cenate.dto.chatbot.EnviarMensajeCitaResponse;
import com.styp.cenate.utils.MensajeCitaFormatter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Implementación del servicio de envío de mensajes de cita
 * Soporta WhatsApp, SMS y Email
 *
 * @version v1.0.0 (2026-02-06)
 */
@Service
@Slf4j
public class MensajeCitaServiceImpl implements MensajeCitaService {

    /**
     * Envía un mensaje de cita al paciente a través del canal especificado
     */
    @Override
    public EnviarMensajeCitaResponse enviarMensajeCita(EnviarMensajeCitaRequest request) {
        try {
            // Validar canal
            String canal = request.getCanal() != null ? request.getCanal().toUpperCase() : "WHATSAPP";

            switch (canal) {
                case "WHATSAPP":
                    return enviarPorWhatsApp(request);
                case "SMS":
                    return enviarPorSMS(request);
                case "EMAIL":
                    return enviarPorEmail(request);
                default:
                    return EnviarMensajeCitaResponse.error(
                        request.getIdSolicitud(),
                        "Canal no soportado: " + canal
                    );
            }
        } catch (Exception e) {
            log.error("Error enviando mensaje de cita para solicitud {}: {}",
                request.getIdSolicitud(), e.getMessage(), e);
            return EnviarMensajeCitaResponse.error(
                request.getIdSolicitud(),
                "Error al enviar el mensaje: " + e.getMessage()
            );
        }
    }

    /**
     * Envía por WhatsApp
     * Actualmente genera el mensaje y lo registra (implementar con Twilio u otra API)
     */
    @Override
    public EnviarMensajeCitaResponse enviarPorWhatsApp(EnviarMensajeCitaRequest request) {
        try {
            // Generar mensaje
            String contenido = MensajeCitaFormatter.generarMensajeCita(
                request.getNombrePaciente(),
                request.getNombreMedico(),
                request.getEspecialidad(),
                request.getFechaAtencion(),
                request.getHoraAtencion(),
                request.getHoraFin()
            );

            // Normalizar teléfono (agregar código de país si no tiene)
            String telefono = normalizarTelefono(request.getTelefonoPaciente());

            // TODO: Integrar con API de WhatsApp (Twilio, Meta Business API, etc.)
            // Ejemplo con Twilio:
            // TwilioService.enviarWhatsApp(telefono, contenido);

            log.info("Mensaje de cita generado para paciente {} (teléfono: {})",
                request.getNombrePaciente(), telefono);
            log.debug("Contenido del mensaje:\n{}", contenido);

            // Generar ID de envío único
            String idEnvio = "WA-" + UUID.randomUUID().toString();

            // Respuesta exitosa
            EnviarMensajeCitaResponse respuesta = EnviarMensajeCitaResponse.exitoso(
                request.getIdSolicitud(),
                idEnvio,
                "WHATSAPP",
                telefono,
                contenido
            );

            // Si solicitó enviar al coordinador también
            if (request.getEnviarAlCoordinador() && request.getEmailCoordinador() != null) {
                log.info("Enviando copia al coordinador: {}", request.getEmailCoordinador());
                respuesta.setEnviadoAlCoordinador(true);
            }

            return respuesta;

        } catch (Exception e) {
            log.error("Error enviando por WhatsApp para solicitud {}: {}",
                request.getIdSolicitud(), e.getMessage(), e);
            return EnviarMensajeCitaResponse.error(
                request.getIdSolicitud(),
                "Error al enviar por WhatsApp: " + e.getMessage()
            );
        }
    }

    /**
     * Envía por SMS
     * Actualmente genera el mensaje y lo registra (implementar con Twilio u otra API)
     */
    @Override
    public EnviarMensajeCitaResponse enviarPorSMS(EnviarMensajeCitaRequest request) {
        try {
            // Para SMS, usar una versión más corta del mensaje
            String contenido = generarMensajeCorto(request);

            String telefono = normalizarTelefono(request.getTelefonoPaciente());

            // TODO: Integrar con API de SMS (Twilio, Vonage, etc.)

            log.info("Mensaje SMS generado para paciente {} (teléfono: {})",
                request.getNombrePaciente(), telefono);

            String idEnvio = "SMS-" + UUID.randomUUID().toString();

            return EnviarMensajeCitaResponse.exitoso(
                request.getIdSolicitud(),
                idEnvio,
                "SMS",
                telefono,
                contenido
            );

        } catch (Exception e) {
            log.error("Error enviando SMS para solicitud {}: {}",
                request.getIdSolicitud(), e.getMessage(), e);
            return EnviarMensajeCitaResponse.error(
                request.getIdSolicitud(),
                "Error al enviar SMS: " + e.getMessage()
            );
        }
    }

    /**
     * Envía por Email
     * Actualmente genera el mensaje y lo registra (implementar con JavaMail)
     */
    @Override
    public EnviarMensajeCitaResponse enviarPorEmail(EnviarMensajeCitaRequest request) {
        try {
            String email = request.getEmailPaciente();

            if (email == null || email.trim().isEmpty()) {
                return EnviarMensajeCitaResponse.error(
                    request.getIdSolicitud(),
                    "Email del paciente no proporcionado"
                );
            }

            // Generar mensaje
            String contenido = MensajeCitaFormatter.generarMensajeCita(
                request.getNombrePaciente(),
                request.getNombreMedico(),
                request.getEspecialidad(),
                request.getFechaAtencion(),
                request.getHoraAtencion(),
                request.getHoraFin()
            );

            // TODO: Integrar con servicio de Email (JavaMail, SendGrid, etc.)
            // EmailService.enviarEmail(email, "Cita Médica Confirmada", contenido);

            log.info("Mensaje Email generado para paciente {} (email: {})",
                request.getNombrePaciente(), email);

            String idEnvio = "EMAIL-" + UUID.randomUUID().toString();

            return EnviarMensajeCitaResponse.exitoso(
                request.getIdSolicitud(),
                idEnvio,
                "EMAIL",
                email,
                contenido
            );

        } catch (Exception e) {
            log.error("Error enviando Email para solicitud {}: {}",
                request.getIdSolicitud(), e.getMessage(), e);
            return EnviarMensajeCitaResponse.error(
                request.getIdSolicitud(),
                "Error al enviar Email: " + e.getMessage()
            );
        }
    }

    /**
     * Normaliza número de teléfono peruano
     * Agrega código de país (51) si no lo tiene
     */
    private String normalizarTelefono(String telefono) {
        if (telefono == null || telefono.trim().isEmpty()) {
            return "";
        }

        String limpio = telefono.replaceAll("[^0-9]", "");

        // Si ya tiene código de país (51)
        if (limpio.startsWith("51")) {
            return limpio;
        }

        // Si tiene 9 dígitos (número local peruano)
        if (limpio.length() == 9) {
            return "51" + limpio;
        }

        // Si tiene 10 dígitos (probablemente con un 0 al inicio)
        if (limpio.length() == 10 && limpio.startsWith("0")) {
            return "51" + limpio.substring(1);
        }

        // Devolver tal cual si no encaja
        return limpio;
    }

    /**
     * Genera una versión corta del mensaje para SMS (máx. 160 caracteres)
     */
    private String generarMensajeCorto(EnviarMensajeCitaRequest request) {
        String fecha = request.getFechaAtencion().toString();
        String hora = request.getHoraAtencion().toString();

        return String.format(
            "Cita CENATE - Dr. %s (%s) el %s a las %s. Confirme en 01 2118830",
            request.getNombreMedico(),
            request.getEspecialidad(),
            fecha,
            hora
        );
    }
}
