package com.styp.cenate.service.chatbot;

import com.styp.cenate.api.chatbot.TrazabilidadTools;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

/**
 * ============================================================
 * 🤖 ChatbotTrazabilidadService — Spring AI (v1.70.0)
 * ============================================================
 * Servicio que conecta con Anthropic Claude usando Spring AI.
 * Incluye tools que consultan la BD PostgreSQL en tiempo real
 * para responder preguntas de trazabilidad del personal CENATE.
 * ============================================================
 */
@Service
@Slf4j
@ConditionalOnProperty(name = "cenate.chatbot.enabled", havingValue = "true", matchIfMissing = false)
public class ChatbotTrazabilidadService {

    private final ChatClient chatClient;
    private final TrazabilidadTools tools;

    // System prompt con contexto CENATE
    private static final String SYSTEM_PROMPT = """
            Eres el Asistente de Trazabilidad del sistema CENATE (Centro Nacional de Telemedicina de EsSalud Perú).
            Tu rol es ayudar al personal interno a:
            - Rastrear el estado de pacientes y sus solicitudes de cita
            - Detectar problemas o inconsistencias en los datos
            - Explicar por qué una acción puede haber fallado
            - Consultar información de usuarios y profesionales del equipo CENATE

            REGLAS:
            - Siempre consulta la base de datos usando las herramientas disponibles antes de responder
            - Responde en español, de forma concisa y profesional
            - Si hay inconsistencias en los datos, explícalas claramente con contexto
            - No inventes datos que no estén en la BD; si no encuentras información, dilo
            - Usa emojis para indicar estados: ✅ ok, ⚠️ alerta, ❌ error, 🔍 buscando
            - Mantén respuestas cortas y enfocadas; máximo 3-4 párrafos
            - Los DNIs en Perú tienen 8 dígitos
            """;

    public ChatbotTrazabilidadService(ChatClient.Builder chatClientBuilder, TrazabilidadTools tools) {
        this.chatClient = chatClientBuilder.build();
        this.tools = tools;
    }

    /**
     * Procesa un mensaje del usuario y devuelve la respuesta del asistente.
     *
     * @param mensaje Pregunta o consulta del personal CENATE
     * @return Respuesta generada por el LLM con datos reales de BD
     */
    public String chat(String mensaje) {
        log.info("[ChatbotTrazabilidad] Procesando mensaje: {}", mensaje);
        try {
            String respuesta = chatClient.prompt()
                    .system(SYSTEM_PROMPT)
                    .user(mensaje)
                    .tools(tools)
                    .call()
                    .content();
            log.info("[ChatbotTrazabilidad] Respuesta generada exitosamente");
            return respuesta;
        } catch (Exception e) {
            log.error("[ChatbotTrazabilidad] Error al procesar mensaje: {}", e.getMessage());
            throw new RuntimeException("Error al procesar consulta: " + e.getMessage(), e);
        }
    }
}
