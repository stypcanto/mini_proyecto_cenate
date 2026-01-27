package com.styp.cenate.ai.infrastructure.adapter.in.web;

import com.styp.cenate.ai.application.dto.ChatRequestDTO;
import com.styp.cenate.ai.application.dto.ChatResponseDTO;
import com.styp.cenate.ai.domain.port.in.DisponibilidadCitasUseCase;
import com.styp.cenate.security.jwt.JwtUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller REST para Chatbot de Disponibilidad de Citas.
 *
 * Expone endpoints para:
 * - Iniciar conversación de búsqueda de disponibilidad
 * - Continuar conversación multi-turno
 * - Confirmar cita seleccionada
 * - Obtener historial de conversación
 *
 * Todos los endpoints requieren autenticación JWT.
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.35.0
 * @since 2026-01-26
 */
@Slf4j
@RestController
@RequestMapping("/api/ai/chatbot-disponibilidad")
@RequiredArgsConstructor
@Tag(name = "AI - Chatbot Disponibilidad", description = "Asistente IA para búsqueda de citas médicas")
public class ChatbotDisponibilidadController {

    private final DisponibilidadCitasUseCase disponibilidadCitasUseCase;
    private final JwtUtils jwtUtils;

    @Operation(
        summary = "Iniciar conversación de búsqueda de disponibilidad",
        description = "El paciente inicia una conversación con el chatbot para buscar disponibilidad médica"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Conversación iniciada exitosamente",
            content = @Content(schema = @Schema(implementation = ChatResponseDTO.class))
        ),
        @ApiResponse(responseCode = "400", description = "Datos inválidos"),
        @ApiResponse(responseCode = "401", description = "No autenticado"),
        @ApiResponse(responseCode = "500", description = "Error del servidor LLM")
    })
    @PostMapping("/iniciar")
    public ResponseEntity<ChatResponseDTO> iniciarConversacion(
        @Valid @RequestBody ChatRequestDTO request,
        Authentication authentication
    ) {
        log.info("Iniciando conversación chatbot. Usuario: {}", authentication.getName());

        Long usuarioId = jwtUtils.getUserIdFromAuthentication(authentication);

        DisponibilidadCitasUseCase.ConversacionDisponibilidadDTO resultado =
            disponibilidadCitasUseCase.iniciarConversacion(
                request.getDniPaciente(),
                request.getMensaje(),
                usuarioId
            );

        ChatResponseDTO response = ChatResponseDTO.builder()
            .sessionId(resultado.sessionId())
            .respuesta(resultado.respuestaInicial())
            .sugerencias(resultado.sugerenciasIniciales())
            .estado("ACTIVA")
            .build();

        log.info("Conversación iniciada. SessionId: {}", resultado.sessionId());

        return ResponseEntity.ok(response);
    }

    @Operation(
        summary = "Continuar conversación existente",
        description = "El paciente envía un nuevo mensaje en una conversación activa"
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Respuesta del chatbot"),
        @ApiResponse(responseCode = "404", description = "Sesión no encontrada o expirada"),
        @ApiResponse(responseCode = "500", description = "Error del servidor LLM")
    })
    @PostMapping("/{sessionId}/continuar")
    public ResponseEntity<ChatResponseDTO> continuarConversacion(
        @PathVariable String sessionId,
        @Valid @RequestBody ChatRequestDTO request
    ) {
        log.info("Continuando conversación. SessionId: {}", sessionId);

        DisponibilidadCitasUseCase.RespuestaDisponibilidadDTO resultado =
            disponibilidadCitasUseCase.continuarConversacion(sessionId, request.getMensaje());

        ChatResponseDTO response = ChatResponseDTO.builder()
            .sessionId(sessionId)
            .respuesta(resultado.respuesta())
            .sugerencias(resultado.sugerencias())
            .estado("ACTIVA")
            .requiereAccion(resultado.requiereAccionUsuario())
            .build();

        return ResponseEntity.ok(response);
    }

    @Operation(
        summary = "Confirmar cita seleccionada",
        description = "El paciente confirma una de las sugerencias de disponibilidad del chatbot"
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Cita confirmada exitosamente"),
        @ApiResponse(responseCode = "404", description = "Sesión o disponibilidad no encontrada"),
        @ApiResponse(responseCode = "409", description = "Disponibilidad ya reservada"),
        @ApiResponse(responseCode = "500", description = "Error al confirmar cita")
    })
    @PostMapping("/{sessionId}/confirmar-cita")
    public ResponseEntity<Map<String, Object>> confirmarCita(
        @PathVariable String sessionId,
        @RequestParam Long disponibilidadId
    ) {
        log.info("Confirmando cita. SessionId: {}, DisponibilidadId: {}", sessionId, disponibilidadId);

        DisponibilidadCitasUseCase.ConfirmacionCitaDTO confirmacion =
            disponibilidadCitasUseCase.confirmarCita(sessionId, disponibilidadId);

        Map<String, Object> response = Map.of(
            "citaId", confirmacion.citaId(),
            "mensaje", confirmacion.confirmacion(),
            "proximosPasos", confirmacion.proximosPasos(),
            "estado", "COMPLETADA"
        );

        return ResponseEntity.ok(response);
    }

    @Operation(
        summary = "Obtener historial de conversación",
        description = "Recupera todos los mensajes de una sesión (para revisión o auditoría)"
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Historial recuperado"),
        @ApiResponse(responseCode = "404", description = "Sesión no encontrada")
    })
    @GetMapping("/{sessionId}/historial")
    public ResponseEntity<Map<String, Object>> obtenerHistorial(@PathVariable String sessionId) {
        log.info("Obteniendo historial. SessionId: {}", sessionId);

        var mensajes = disponibilidadCitasUseCase.obtenerHistorial(sessionId);

        Map<String, Object> response = Map.of(
            "sessionId", sessionId,
            "totalMensajes", mensajes.size(),
            "mensajes", mensajes
        );

        return ResponseEntity.ok(response);
    }

    @Operation(
        summary = "Finalizar conversación",
        description = "Cierra una conversación y libera recursos (memoria, caché)"
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Conversación finalizada"),
        @ApiResponse(responseCode = "404", description = "Sesión no encontrada")
    })
    @DeleteMapping("/{sessionId}")
    public ResponseEntity<Map<String, String>> finalizarConversacion(@PathVariable String sessionId) {
        log.info("Finalizando conversación. SessionId: {}", sessionId);

        disponibilidadCitasUseCase.finalizarConversacion(sessionId);

        return ResponseEntity.ok(Map.of(
            "mensaje", "Conversación finalizada exitosamente",
            "sessionId", sessionId
        ));
    }
}
