package com.styp.cenate.api.chatbot;

import com.styp.cenate.dto.chatbot.ChatbotTrazabilidadRequest;
import com.styp.cenate.dto.chatbot.ChatbotTrazabilidadResponse;
import com.styp.cenate.service.chatbot.ChatbotTrazabilidadService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * ============================================================
 * 🤖 ChatbotTrazabilidadController (v1.70.0)
 * ============================================================
 * Endpoint para el Chatbot de Trazabilidad interno de CENATE.
 * Solo accesible para personal autenticado (JWT requerido).
 *
 * POST /api/v1/chatbot/trazabilidad/chat
 * Body: { "mensaje": "¿Por qué el DNI 08643806 no puede ser citado?" }
 * Response: { "respuesta": "...", "timestamp": "..." }
 * ============================================================
 */
@RestController
@RequestMapping("/api/v1/chatbot/trazabilidad")
@RequiredArgsConstructor
@Slf4j
public class ChatbotTrazabilidadController {

    private final ChatbotTrazabilidadService chatbotTrazabilidadService;

    /**
     * Procesa una consulta de trazabilidad usando IA + datos reales de BD.
     *
     * @param request Mensaje del usuario (personal interno CENATE)
     * @return Respuesta del asistente con datos trazados de PostgreSQL
     */
    @PostMapping("/chat")
    public ResponseEntity<?> chat(@Valid @RequestBody ChatbotTrazabilidadRequest request) {
        log.info("[Trazabilidad] Solicitud recibida: {}", request.getMensaje());
        try {
            String respuesta = chatbotTrazabilidadService.chat(request.getMensaje());
            return ResponseEntity.ok(new ChatbotTrazabilidadResponse(respuesta, LocalDateTime.now()));
        } catch (Exception e) {
            log.error("[Trazabilidad] Error al procesar: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "No se pudo procesar la consulta. Intenta de nuevo.",
                    "detalle", e.getMessage(),
                    "timestamp", LocalDateTime.now().toString()));
        }
    }
}
