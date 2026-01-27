package com.styp.cenate.ai.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Contexto completo de una conversación con el LLM.
 *
 * Mantiene el historial de mensajes, metadatos del usuario,
 * y estado de la conversación para permitir interacciones multi-turno.
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.35.0
 * @since 2026-01-26
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversacionContext {

    /**
     * ID único de la sesión de conversación.
     */
    private String sessionId;

    /**
     * ID del usuario de CENATE (para auditoría).
     */
    private Long usuarioId;

    /**
     * DNI del paciente (si aplica).
     */
    private String dniPaciente;

    /**
     * Tipo de conversación (DISPONIBILIDAD_CITAS, DIAGNOSTICO, ANALISIS_ECG, etc.).
     */
    private TipoConversacion tipo;

    /**
     * Historial de mensajes (ordenado cronológicamente).
     */
    @Builder.Default
    private List<MensajeLLM> mensajes = new ArrayList<>();

    /**
     * Timestamp de inicio de la conversación.
     */
    @Builder.Default
    private LocalDateTime iniciadoEn = LocalDateTime.now();

    /**
     * Timestamp de última interacción.
     */
    @Builder.Default
    private LocalDateTime ultimaInteraccion = LocalDateTime.now();

    /**
     * Metadatos adicionales de contexto.
     * Ejemplos: especialidadBuscada, ipressSeleccionada, diagnosticoTemporal, etc.
     */
    @Builder.Default
    private Map<String, Object> metadatos = new HashMap<>();

    /**
     * Estado de la conversación (ACTIVA, COMPLETADA, TIMEOUT, ERROR).
     */
    @Builder.Default
    private EstadoConversacion estado = EstadoConversacion.ACTIVA;

    /**
     * Número total de mensajes en la conversación.
     */
    public int getTotalMensajes() {
        return mensajes.size();
    }

    /**
     * Agrega un mensaje al historial.
     */
    public void agregarMensaje(MensajeLLM mensaje) {
        this.mensajes.add(mensaje);
        this.ultimaInteraccion = LocalDateTime.now();
    }

    /**
     * Tipo de conversación.
     */
    public enum TipoConversacion {
        DISPONIBILIDAD_CITAS,    // Chatbot de disponibilidad
        DIAGNOSTICO_ASISTENTE,   // Asistente de diagnóstico
        ANALISIS_TELE_ECG,       // Análisis de imágenes ECG
        GENERACION_REPORTE,      // Generación de reportes médicos
        GENERAL                  // Consulta general
    }

    /**
     * Estado de la conversación.
     */
    public enum EstadoConversacion {
        ACTIVA,      // Conversación en curso
        COMPLETADA,  // Conversación finalizada exitosamente
        TIMEOUT,     // Conversación expirada por inactividad
        ERROR        // Conversación terminada por error
    }
}
