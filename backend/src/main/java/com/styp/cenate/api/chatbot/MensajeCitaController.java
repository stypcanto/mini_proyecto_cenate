package com.styp.cenate.api.chatbot;

import com.styp.cenate.dto.chatbot.EnviarMensajeCitaRequest;
import com.styp.cenate.dto.chatbot.EnviarMensajeCitaResponse;
import com.styp.cenate.service.citas.MensajeCitaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador para envío de mensajes de cita a pacientes
 * Soporta WhatsApp, SMS y Email
 *
 * @version v1.0.0 (2026-02-06)
 */
@RestController
@RequestMapping("/api/citas/mensaje")
@Tag(name = "Mensajes de Cita", description = "Envío de notificaciones de cita a pacientes")
@RequiredArgsConstructor
@Slf4j
public class MensajeCitaController {

    private final MensajeCitaService mensajeCitaService;

    /**
     * Envía un mensaje de cita al paciente
     *
     * @param request Datos de la cita (paciente, médico, fecha, hora)
     * @return Respuesta con confirmación o error
     */
    @PostMapping("/enviar")
    @PreAuthorize("hasAnyRole('COORDINADOR', 'COORDINADOR_GESTION_CITAS', 'MEDICO', 'ADMIN')")
    @Operation(summary = "Enviar mensaje de cita al paciente",
        description = "Genera y envía un mensaje con los datos de la cita programada al paciente a través del canal especificado")
    public ResponseEntity<EnviarMensajeCitaResponse> enviarMensajeCita(
            @Valid @RequestBody EnviarMensajeCitaRequest request) {

        log.info("Solicitud de envío de mensaje de cita para paciente: {}", request.getNombrePaciente());

        EnviarMensajeCitaResponse respuesta = mensajeCitaService.enviarMensajeCita(request);

        // Retornar con status 200 si fue exitoso, 400 si hubo error
        if (respuesta.getExitoso()) {
            return ResponseEntity.ok(respuesta);
        } else {
            return ResponseEntity.badRequest().body(respuesta);
        }
    }

    /**
     * Envía un mensaje de cita por WhatsApp específicamente
     *
     * @param request Datos de la cita
     * @return Respuesta con confirmación
     */
    @PostMapping("/enviar/whatsapp")
    @PreAuthorize("hasAnyRole('COORDINADOR', 'COORDINADOR_GESTION_CITAS', 'MEDICO', 'ADMIN')")
    @Operation(summary = "Enviar mensaje por WhatsApp",
        description = "Envía el mensaje de cita a través de WhatsApp")
    public ResponseEntity<EnviarMensajeCitaResponse> enviarPorWhatsApp(
            @Valid @RequestBody EnviarMensajeCitaRequest request) {

        log.info("Enviando mensaje por WhatsApp para paciente: {}", request.getNombrePaciente());
        request.setCanal("WHATSAPP");

        EnviarMensajeCitaResponse respuesta = mensajeCitaService.enviarPorWhatsApp(request);

        return respuesta.getExitoso()
            ? ResponseEntity.ok(respuesta)
            : ResponseEntity.badRequest().body(respuesta);
    }

    /**
     * Envía un mensaje de cita por SMS específicamente
     *
     * @param request Datos de la cita
     * @return Respuesta con confirmación
     */
    @PostMapping("/enviar/sms")
    @PreAuthorize("hasAnyRole('COORDINADOR', 'COORDINADOR_GESTION_CITAS', 'MEDICO', 'ADMIN')")
    @Operation(summary = "Enviar mensaje por SMS",
        description = "Envía el mensaje de cita a través de SMS (versión corta)")
    public ResponseEntity<EnviarMensajeCitaResponse> enviarPorSMS(
            @Valid @RequestBody EnviarMensajeCitaRequest request) {

        log.info("Enviando mensaje por SMS para paciente: {}", request.getNombrePaciente());
        request.setCanal("SMS");

        EnviarMensajeCitaResponse respuesta = mensajeCitaService.enviarPorSMS(request);

        return respuesta.getExitoso()
            ? ResponseEntity.ok(respuesta)
            : ResponseEntity.badRequest().body(respuesta);
    }

    /**
     * Envía un mensaje de cita por Email específicamente
     *
     * @param request Datos de la cita
     * @return Respuesta con confirmación
     */
    @PostMapping("/enviar/email")
    @PreAuthorize("hasAnyRole('COORDINADOR', 'COORDINADOR_GESTION_CITAS', 'MEDICO', 'ADMIN')")
    @Operation(summary = "Enviar mensaje por Email",
        description = "Envía el mensaje de cita a través de Email")
    public ResponseEntity<EnviarMensajeCitaResponse> enviarPorEmail(
            @Valid @RequestBody EnviarMensajeCitaRequest request) {

        log.info("Enviando mensaje por Email para paciente: {}", request.getNombrePaciente());
        request.setCanal("EMAIL");

        EnviarMensajeCitaResponse respuesta = mensajeCitaService.enviarPorEmail(request);

        return respuesta.getExitoso()
            ? ResponseEntity.ok(respuesta)
            : ResponseEntity.badRequest().body(respuesta);
    }

    /**
     * Vista previa del mensaje que se enviará
     * Útil para que el coordinador vea el mensaje antes de enviarlo
     *
     * @param request Datos de la cita
     * @return El contenido del mensaje formateado
     */
    @PostMapping("/preview")
    @PreAuthorize("hasAnyRole('COORDINADOR', 'COORDINADOR_GESTION_CITAS', 'MEDICO', 'ADMIN')")
    @Operation(summary = "Vista previa del mensaje",
        description = "Muestra cómo se vería el mensaje sin enviarlo")
    public ResponseEntity<?> previsualizarMensaje(
            @Valid @RequestBody EnviarMensajeCitaRequest request) {

        try {
            String contenido = com.styp.cenate.utils.MensajeCitaFormatter.generarMensajeCita(
                request.getNombrePaciente(),
                request.getNombreMedico(),
                request.getEspecialidad(),
                request.getFechaAtencion(),
                request.getHoraAtencion(),
                request.getHoraFin()
            );

            return ResponseEntity.ok(new Object() {
                public final String contenido_mensaje = contenido;
                public final String canal = request.getCanal() != null ? request.getCanal() : "WHATSAPP";
                public final String destino = request.getTelefonoPaciente() != null
                    ? request.getTelefonoPaciente()
                    : "No especificado";
            });

        } catch (Exception e) {
            log.error("Error generando vista previa: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new Object() {
                public final boolean error = true;
                public final String mensaje = "Error al generar vista previa: " + e.getMessage();
            });
        }
    }
}
