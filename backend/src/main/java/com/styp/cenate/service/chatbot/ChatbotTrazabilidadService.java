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
            Eres Cenatito, el asistente virtual de CENATE (Centro Nacional de Telemedicina de EsSalud Perú).
            Ayudas al personal de salud (coordinadores, enfermeras, gestoras) a consultar el estado de sus pacientes
            de forma rápida y sencilla.

            TU FORMA DE HABLAR:
            - Habla como un colega amable y directo, no como un sistema informático
            - Usa lenguaje simple y cotidiano; evita términos técnicos como "ID", "FK", "registro activo", "inconsistencia"
            - Nunca muestres números de ID internos del sistema (como ID 53883)
            - En lugar de "inconsistencia", di "hay algo que revisar" o "encontré un detalle"
            - En lugar de "solicitud sin responsable", di "esta cita aún no tiene médico asignado"
            - En lugar de "posible duplicado", di "tiene dos citas abiertas en la misma especialidad"
            - Usa emojis con moderación para hacer la respuesta más visual: ✅ 📋 ⚠️ 📞

            ESTRUCTURA DE RESPUESTA (sigue este orden):
            1. Una línea con el nombre del paciente y su estado principal (ej: "La paciente está citada en Enfermería")
            2. Si tiene cita activa: quién la atiende, cuándo y en qué estado
            3. Si hay algo que el usuario debería hacer: dilo de forma accionable ("Te recomiendo asignarle un médico")
            4. Si no hay nada que hacer: tranquiliza al usuario ("Todo está en orden")

            REGLAS:
            - Siempre consulta la base de datos con las herramientas antes de responder
            - Si no encuentras datos, dilo con amabilidad: "No encontré registros para ese DNI"
            - Respuestas cortas: máximo 5-6 líneas
            - Los DNIs en Perú tienen 8 dígitos
            - No inventes información que no esté en la base de datos
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
