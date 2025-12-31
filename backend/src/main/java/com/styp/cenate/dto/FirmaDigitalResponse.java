package com.styp.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * 📤 DTO para respuestas de firma digital.
 * Incluye información adicional para el frontend.
 *
 * @author Ing. Styp Canto Rondon
 * @version 1.0.0
 * @since 2025-12-30
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FirmaDigitalResponse {

    private Long idFirmaPersonal;

    private Long idPersonal;

    /**
     * Nombre completo del personal (obtenido desde PersonalCnt)
     */
    private String nombreCompleto;

    /**
     * DNI del personal (obtenido desde PersonalCnt)
     */
    private String dni;

    /**
     * ID del régimen laboral (para edición)
     */
    private Long idRegimenLaboral;

    /**
     * Régimen laboral del personal (obtenido desde RegimenLaboral)
     */
    private String regimenLaboral;

    /**
     * Profesión del personal (obtenido desde PersonalProf -> Profesion)
     */
    private String profesion;

    /**
     * Especialidad médica del personal (si aplica)
     */
    private String especialidad;

    /**
     * ID de la IPRESS donde labora
     */
    private Long idIpress;

    /**
     * Nombre de la IPRESS donde labora
     */
    private String nombreIpress;

    private Boolean entregoToken;

    private String numeroSerieToken;

    private LocalDate fechaEntregaToken;

    private LocalDate fechaInicioCertificado;

    private LocalDate fechaVencimientoCertificado;

    /**
     * Motivo sin token: YA_TIENE, NO_REQUIERE, PENDIENTE
     */
    private String motivoSinToken;

    /**
     * Descripción legible del motivo
     */
    private String descripcionMotivo;

    private String observaciones;

    /**
     * Estado del certificado: SIN_CERTIFICADO, VIGENTE, VENCIDO
     */
    private String estadoCertificado;

    /**
     * Días restantes hasta el vencimiento (null si no tiene certificado)
     */
    private Long diasRestantesVencimiento;

    /**
     * Indica si el certificado vence pronto (próximos 30 días)
     */
    private Boolean venceProximamente;

    /**
     * Indica si el registro está activo
     */
    private Boolean activo;

    /**
     * Indica si está pendiente de entrega
     */
    private Boolean esPendiente;

    private String statFirma;

    private OffsetDateTime createdAt;

    private OffsetDateTime updatedAt;

    // ==========================================================
    // 🎨 Métodos helper para el frontend
    // ==========================================================

    /**
     * Obtiene clase CSS según estado del certificado
     * Para usar en badges del frontend
     */
    public String getEstadoCssClass() {
        if (estadoCertificado == null) {
            return "badge-secondary";
        }
        return switch (estadoCertificado) {
            case "VIGENTE" -> "badge-success";
            case "VENCIDO" -> "badge-danger";
            case "SIN_CERTIFICADO" -> "badge-warning";
            default -> "badge-secondary";
        };
    }

    /**
     * Obtiene ícono según estado del certificado
     * Para usar en UI
     */
    public String getEstadoIcon() {
        if (estadoCertificado == null) {
            return "❓";
        }
        return switch (estadoCertificado) {
            case "VIGENTE" -> "✅";
            case "VENCIDO" -> "❌";
            case "SIN_CERTIFICADO" -> "⚠️";
            default -> "❓";
        };
    }

    /**
     * Verifica si debe mostrar alerta de vencimiento
     */
    public boolean debeAlertar() {
        return Boolean.TRUE.equals(venceProximamente) || "VENCIDO".equals(estadoCertificado);
    }

    /**
     * Obtiene mensaje de alerta
     */
    public String getMensajeAlerta() {
        if ("VENCIDO".equals(estadoCertificado)) {
            return "Certificado VENCIDO";
        }
        if (Boolean.TRUE.equals(venceProximamente)) {
            return String.format("Vence en %d días", diasRestantesVencimiento);
        }
        return null;
    }
}
