package com.styp.cenate.dto.teleekgs;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO para respuesta de registros de auditoría de ECGs
 *
 * Contiene información de cada acción realizada sobre una imagen
 * Utilizado para:
 * - Mostrar historial de accesos a una imagen
 * - Auditoría y compliance
 * - Análisis de patrones de acceso
 *
 * @author Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-13
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeleECGAuditoriaDTO {

    /**
     * ID único del registro de auditoría
     */
    @JsonProperty("id_auditoria")
    private Long idAuditoria;

    /**
     * ID de la imagen ECG
     */
    @JsonProperty("id_imagen")
    private Long idImagen;

    /**
     * Usuario que realizó la acción
     */
    @JsonProperty("id_usuario")
    private Long idUsuario;

    /**
     * Nombre del usuario
     */
    @JsonProperty("nombre_usuario")
    private String nombreUsuario;

    /**
     * Rol del usuario en el momento de la acción
     */
    @JsonProperty("rol_usuario")
    private String rolUsuario;

    /**
     * TIPO DE ACCIÓN
     * Valores: CARGADA, DESCARGADA, VISUALIZADA, PROCESADA, RECHAZADA, VINCULADA, MODIFICADA, ELIMINADA
     */
    @JsonProperty("accion")
    private String accion;

    /**
     * Acción en formato legible con emoji
     */
    @JsonProperty("accion_formato")
    private String accionFormato;

    /**
     * Descripción detallada de la acción
     */
    @JsonProperty("descripcion")
    private String descripcion;

    /**
     * Dirección IP del usuario
     */
    @JsonProperty("ip_usuario")
    private String ipUsuario;

    /**
     * Navegador/dispositivo
     */
    @JsonProperty("navegador")
    private String navegador;

    /**
     * Ruta solicitada
     */
    @JsonProperty("ruta_solicitada")
    private String rutaSolicitada;

    /**
     * Timestamp de la acción
     */
    @JsonProperty("fecha_accion")
    private LocalDateTime fechaAccion;

    /**
     * Fecha de acción en formato legible
     */
    @JsonProperty("fecha_accion_formato")
    private String fechaAccionFormato;

    /**
     * Resultado: EXITOSA, FALLIDA, SOSPECHOSA
     */
    @JsonProperty("resultado")
    private String resultado;

    /**
     * Código de error (si aplica)
     */
    @JsonProperty("codigo_error")
    private String codigoError;

    /**
     * Datos adicionales (JSON)
     */
    @JsonProperty("datos_adicionales")
    private String datosAdicionales;

    /**
     * Helper: obtener descripción de acción con emoji
     */
    public static String formatoAccion(String accion) {
        return switch (accion) {
            case "CARGADA" -> "📤 CARGADA";
            case "DESCARGADA" -> "📥 DESCARGADA";
            case "VISUALIZADA" -> "👁️ VISUALIZADA";
            case "PROCESADA" -> "✅ PROCESADA";
            case "RECHAZADA" -> "❌ RECHAZADA";
            case "VINCULADA" -> "🔗 VINCULADA";
            case "MODIFICADA" -> "✏️ MODIFICADA";
            case "ELIMINADA" -> "🗑️ ELIMINADA";
            default -> accion;
        };
    }

    /**
     * Helper: obtener color para la acción (para UI)
     */
    public static String getColorAccion(String accion) {
        return switch (accion) {
            case "CARGADA" -> "blue";
            case "DESCARGADA" -> "green";
            case "VISUALIZADA" -> "cyan";
            case "PROCESADA" -> "green";
            case "RECHAZADA" -> "red";
            case "VINCULADA" -> "purple";
            case "MODIFICADA" -> "orange";
            case "ELIMINADA" -> "red";
            default -> "gray";
        };
    }
}
