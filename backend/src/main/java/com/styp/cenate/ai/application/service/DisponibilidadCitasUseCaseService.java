package com.styp.cenate.ai.application.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.styp.cenate.ai.domain.exception.ContextoInvalidoException;
import com.styp.cenate.ai.domain.exception.LLMServiceException;
import com.styp.cenate.ai.domain.model.ConversacionContext;
import com.styp.cenate.ai.domain.model.DisponibilidadSugerida;
import com.styp.cenate.ai.domain.model.MensajeLLM;
import com.styp.cenate.ai.domain.port.in.DisponibilidadCitasUseCase;
import com.styp.cenate.ai.domain.port.out.ConversacionMemoryPort;
import com.styp.cenate.ai.domain.port.out.FunctionCallingPort;
import com.styp.cenate.ai.domain.port.out.LLMServicePort;
import com.styp.cenate.ai.domain.port.out.PromptTemplatePort;
import com.styp.cenate.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Implementación del caso de uso: Chatbot de Disponibilidad de Citas.
 *
 * Orquesta la interacción entre el LLM, la memoria de conversación,
 * y el sistema de disponibilidad médica de CENATE.
 *
 * Flujo:
 * 1. Paciente envía mensaje en lenguaje natural
 * 2. LLM entiende la intención y extrae parámetros (especialidad, fecha, IPRESS)
 * 3. System invoca Function Calling para buscar disponibilidad real
 * 4. LLM presenta resultados de manera conversacional
 * 5. Paciente confirma o refina búsqueda
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.35.0
 * @since 2026-01-26
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DisponibilidadCitasUseCaseService implements DisponibilidadCitasUseCase {

    private final LLMServicePort llmService;
    private final PromptTemplatePort promptTemplate;
    private final ConversacionMemoryPort conversacionMemory;
    private final FunctionCallingPort functionCalling;
    private final AuditLogService auditLogService;
    private final ObjectMapper objectMapper;

    private static final String TEMPLATE_SYSTEM_PROMPT = "chatbot-disponibilidad-system-v1";
    private static final int MAX_MENSAJES_CONTEXTO = 10; // Últimos 10 mensajes para contexto
    private static final long SESSION_TTL_SECONDS = 1800; // 30 minutos

    @Override
    @Transactional
    public ConversacionDisponibilidadDTO iniciarConversacion(
        String dniPaciente,
        String mensajeInicial,
        Long usuarioId
    ) {
        log.info("Iniciando conversación de disponibilidad. DNI: {}, Usuario: {}", dniPaciente, usuarioId);

        // 1. Crear contexto de conversación
        String sessionId = UUID.randomUUID().toString();
        ConversacionContext context = ConversacionContext.builder()
            .sessionId(sessionId)
            .dniPaciente(dniPaciente)
            .usuarioId(usuarioId)
            .tipo(ConversacionContext.TipoConversacion.DISPONIBILIDAD_CITAS)
            .build();

        // 2. Obtener system prompt con variables
        Map<String, String> variables = Map.of(
            "dniPaciente", dniPaciente,
            "fechaActual", java.time.LocalDate.now().toString()
        );
        String systemPrompt = promptTemplate.fillTemplate(TEMPLATE_SYSTEM_PROMPT, variables);

        // 3. Agregar mensaje inicial del usuario
        MensajeLLM mensajeUsuario = MensajeLLM.builder()
            .rol(MensajeLLM.RolMensaje.USER)
            .contenido(mensajeInicial)
            .build();
        context.agregarMensaje(mensajeUsuario);

        // 4. Invocar LLM con Function Calling habilitado
        List<LLMServicePort.FunctionDefinition> functions = obtenerFuncionesDisponibles();
        String respuestaLLM;
        try {
            respuestaLLM = llmService.chatWithFunctions(
                context.getMensajes(),
                systemPrompt,
                functions,
                0.7, // Temperature moderada para conversaciones naturales
                1500 // Max tokens
            );
        } catch (Exception e) {
            log.error("Error al invocar LLM. SessionId: {}", sessionId, e);
            throw new LLMServiceException("Error al procesar solicitud de disponibilidad", e);
        }

        // 5. Agregar respuesta del LLM al contexto
        MensajeLLM mensajeAsistente = MensajeLLM.builder()
            .rol(MensajeLLM.RolMensaje.ASSISTANT)
            .contenido(respuestaLLM)
            .build();
        context.agregarMensaje(mensajeAsistente);

        // 6. Guardar contexto en memoria
        conversacionMemory.saveContext(sessionId, context);
        conversacionMemory.updateTTL(sessionId, SESSION_TTL_SECONDS);

        // 7. Extraer sugerencias de disponibilidad del metadato del contexto
        @SuppressWarnings("unchecked")
        List<DisponibilidadSugerida> sugerencias = (List<DisponibilidadSugerida>)
            context.getMetadatos().getOrDefault("sugerenciasActuales", new ArrayList<>());

        // 8. Auditar inicio de conversación
        auditLogService.registrarEvento(
            "AI_CHATBOT_DISPONIBILIDAD_INICIO",
            usuarioId,
            "Conversación iniciada. SessionId: " + sessionId,
            "SISTEMA",
            null,
            Map.of("sessionId", sessionId, "dniPaciente", dniPaciente)
        );

        log.info("Conversación iniciada exitosamente. SessionId: {}", sessionId);

        return new ConversacionDisponibilidadDTO(
            sessionId,
            respuestaLLM,
            sugerencias
        );
    }

    @Override
    @Transactional
    public RespuestaDisponibilidadDTO continuarConversacion(String sessionId, String mensaje) {
        log.info("Continuando conversación. SessionId: {}", sessionId);

        // 1. Obtener contexto existente
        ConversacionContext context = conversacionMemory.getContext(sessionId)
            .orElseThrow(() -> new ContextoInvalidoException(
                "Sesión no encontrada o expirada", sessionId
            ));

        // 2. Agregar mensaje del usuario
        MensajeLLM mensajeUsuario = MensajeLLM.builder()
            .rol(MensajeLLM.RolMensaje.USER)
            .contenido(mensaje)
            .build();
        context.agregarMensaje(mensajeUsuario);

        // 3. Obtener system prompt
        Map<String, String> variables = Map.of(
            "dniPaciente", context.getDniPaciente(),
            "fechaActual", java.time.LocalDate.now().toString()
        );
        String systemPrompt = promptTemplate.fillTemplate(TEMPLATE_SYSTEM_PROMPT, variables);

        // 4. Limitar contexto a últimos N mensajes (reducir costos)
        List<MensajeLLM> mensajesRecientes = conversacionMemory.getRecentMessages(
            sessionId,
            MAX_MENSAJES_CONTEXTO
        );

        // 5. Invocar LLM
        List<LLMServicePort.FunctionDefinition> functions = obtenerFuncionesDisponibles();
        String respuestaLLM;
        try {
            respuestaLLM = llmService.chatWithFunctions(
                mensajesRecientes,
                systemPrompt,
                functions,
                0.7,
                1500
            );
        } catch (Exception e) {
            log.error("Error al continuar conversación. SessionId: {}", sessionId, e);
            throw new LLMServiceException("Error al procesar mensaje", e);
        }

        // 6. Agregar respuesta del LLM
        MensajeLLM mensajeAsistente = MensajeLLM.builder()
            .rol(MensajeLLM.RolMensaje.ASSISTANT)
            .contenido(respuestaLLM)
            .build();
        context.agregarMensaje(mensajeAsistente);

        // 7. Actualizar memoria
        conversacionMemory.saveContext(sessionId, context);
        conversacionMemory.updateTTL(sessionId, SESSION_TTL_SECONDS);

        // 8. Extraer sugerencias actualizadas
        @SuppressWarnings("unchecked")
        List<DisponibilidadSugerida> sugerencias = (List<DisponibilidadSugerida>)
            context.getMetadatos().getOrDefault("sugerenciasActuales", new ArrayList<>());

        log.info("Conversación continuada. SessionId: {}, Total mensajes: {}",
            sessionId, context.getTotalMensajes());

        return new RespuestaDisponibilidadDTO(
            respuestaLLM,
            sugerencias,
            false // TODO: Implementar lógica para detectar si requiere acción
        );
    }

    @Override
    @Transactional
    public ConfirmacionCitaDTO confirmarCita(String sessionId, Long disponibilidadId) {
        log.info("Confirmando cita. SessionId: {}, DisponibilidadId: {}", sessionId, disponibilidadId);

        // 1. Validar sesión
        ConversacionContext context = conversacionMemory.getContext(sessionId)
            .orElseThrow(() -> new ContextoInvalidoException(
                "Sesión no encontrada", sessionId
            ));

        // 2. Invocar función de confirmación de cita
        Map<String, Object> args = Map.of(
            "disponibilidadId", disponibilidadId,
            "dniPaciente", context.getDniPaciente()
        );

        String resultado = functionCalling.executeFunction("confirmarCita", args);

        // 3. Parsear resultado
        try {
            Map<String, Object> resultadoMap = objectMapper.readValue(
                resultado,
                new TypeReference<Map<String, Object>>() {}
            );

            Long citaId = ((Number) resultadoMap.get("citaId")).longValue();
            String confirmacion = (String) resultadoMap.get("mensaje");

            // 4. Auditar confirmación
            auditLogService.registrarEvento(
                "AI_CHATBOT_CITA_CONFIRMADA",
                context.getUsuarioId(),
                "Cita confirmada mediante chatbot. CitaId: " + citaId,
                "SISTEMA",
                null,
                Map.of(
                    "sessionId", sessionId,
                    "citaId", citaId,
                    "disponibilidadId", disponibilidadId
                )
            );

            // 5. Marcar conversación como completada
            context.setEstado(ConversacionContext.EstadoConversacion.COMPLETADA);
            conversacionMemory.saveContext(sessionId, context);

            log.info("Cita confirmada exitosamente. CitaId: {}", citaId);

            return new ConfirmacionCitaDTO(
                citaId,
                confirmacion,
                "Revisa tu email para instrucciones de la teleconsulta."
            );

        } catch (Exception e) {
            log.error("Error al confirmar cita. SessionId: {}", sessionId, e);
            throw new LLMServiceException("Error al procesar confirmación", e);
        }
    }

    @Override
    public List<MensajeLLM> obtenerHistorial(String sessionId) {
        ConversacionContext context = conversacionMemory.getContext(sessionId)
            .orElseThrow(() -> new ContextoInvalidoException(
                "Sesión no encontrada", sessionId
            ));
        return context.getMensajes();
    }

    @Override
    public void finalizarConversacion(String sessionId) {
        log.info("Finalizando conversación. SessionId: {}", sessionId);
        conversacionMemory.clearContext(sessionId);
    }

    /**
     * Define las funciones disponibles para el LLM (Function Calling).
     */
    private List<LLMServicePort.FunctionDefinition> obtenerFuncionesDisponibles() {
        return List.of(
            new LLMServicePort.FunctionDefinition(
                "buscarDisponibilidadMedica",
                "Busca disponibilidad de médicos por especialidad, IPRESS y rango de fechas",
                Map.of(
                    "type", "object",
                    "properties", Map.of(
                        "especialidad", Map.of("type", "string", "description", "Especialidad médica"),
                        "ipressCodigo", Map.of("type", "string", "description", "Código IPRESS (opcional)"),
                        "fechaDesde", Map.of("type", "string", "description", "Fecha inicio búsqueda (YYYY-MM-DD)"),
                        "fechaHasta", Map.of("type", "string", "description", "Fecha fin búsqueda (YYYY-MM-DD)")
                    ),
                    "required", List.of("especialidad", "fechaDesde", "fechaHasta")
                )
            ),
            new LLMServicePort.FunctionDefinition(
                "confirmarCita",
                "Confirma una cita médica para el paciente",
                Map.of(
                    "type", "object",
                    "properties", Map.of(
                        "disponibilidadId", Map.of("type", "integer", "description", "ID de disponibilidad"),
                        "dniPaciente", Map.of("type", "string", "description", "DNI del paciente")
                    ),
                    "required", List.of("disponibilidadId", "dniPaciente")
                )
            )
        );
    }
}
