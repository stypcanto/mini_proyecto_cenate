package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * 🖋️ Entidad que representa la información de firma digital del personal.
 * Tabla: firma_digital_personal
 *
 * @author Ing. Styp Canto Rondon
 * @version 1.0.0
 * @since 2025-12-30
 */
@Entity
@Table(name = "firma_digital_personal", schema = "public")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "personal")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class FirmaDigitalPersonal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "id_firma_personal")
    private Long idFirmaPersonal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_personal", nullable = false)
    private PersonalCnt personal;

    @Column(name = "entrego_token", nullable = false)
    @Builder.Default
    private Boolean entregoToken = false;

    @Column(name = "numero_serie_token", length = 100)
    private String numeroSerieToken;

    @Column(name = "fecha_entrega_token")
    private LocalDate fechaEntregaToken;

    @Column(name = "fecha_inicio_certificado")
    private LocalDate fechaInicioCertificado;

    @Column(name = "fecha_vencimiento_certificado")
    private LocalDate fechaVencimientoCertificado;

    @Column(name = "motivo_sin_token", length = 50)
    private String motivoSinToken; // YA_TIENE, NO_REQUIERE, PENDIENTE

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "stat_firma", nullable = false, length = 1)
    @Builder.Default
    private String statFirma = "A";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime updatedAt;

    // ==========================================================
    // 🧩 Métodos utilitarios
    // ==========================================================

    /**
     * Verifica si el registro está activo
     */
    public boolean isActivo() {
        return "A".equalsIgnoreCase(statFirma);
    }

    /**
     * Verifica si el token fue entregado
     */
    public boolean tieneTokenEntregado() {
        return Boolean.TRUE.equals(entregoToken);
    }

    /**
     * Verifica si el certificado está vigente (no vencido)
     */
    public boolean tieneCertificadoVigente() {
        if (fechaVencimientoCertificado == null) {
            return false;
        }
        return fechaVencimientoCertificado.isAfter(LocalDate.now());
    }

    /**
     * Valida que las fechas sean coherentes
     */
    public boolean validarFechas() {
        if (fechaInicioCertificado != null && fechaVencimientoCertificado != null) {
            return fechaVencimientoCertificado.isAfter(fechaInicioCertificado);
        }
        return true;
    }

    /**
     * Verifica si la firma digital está en estado PENDIENTE
     */
    public boolean esPendienteEntrega() {
        return "PENDIENTE".equalsIgnoreCase(motivoSinToken);
    }

    /**
     * Verifica si se puede actualizar la entrega (solo si está PENDIENTE)
     */
    public boolean puedeActualizarEntrega() {
        return esPendienteEntrega() && "A".equalsIgnoreCase(statFirma);
    }

    /**
     * Obtiene el estado del certificado
     *
     * @return SIN_CERTIFICADO, VIGENTE o VENCIDO
     */
    public String obtenerEstadoCertificado() {
        if (fechaVencimientoCertificado == null) {
            return "SIN_CERTIFICADO";
        }
        if (tieneCertificadoVigente()) {
            return "VIGENTE";
        }
        return "VENCIDO";
    }

    /**
     * Obtiene descripción legible del motivo
     */
    public String obtenerDescripcionMotivo() {
        if (motivoSinToken == null) {
            return "—";
        }
        return switch (motivoSinToken) {
            case "YA_TIENE" -> "Ya cuenta con certificado digital";
            case "NO_REQUIERE" -> "No requiere firma digital";
            case "PENDIENTE" -> "Pendiente de entrega";
            default -> motivoSinToken;
        };
    }

    /**
     * Calcula días restantes para vencimiento
     *
     * @return días restantes o null si no tiene certificado
     */
    public Long diasRestantesVencimiento() {
        if (fechaVencimientoCertificado == null) {
            return null;
        }
        LocalDate hoy = LocalDate.now();
        return java.time.temporal.ChronoUnit.DAYS.between(hoy, fechaVencimientoCertificado);
    }

    /**
     * Verifica si el certificado vence pronto (en los próximos N días)
     *
     * @param dias número de días para considerar "pronto a vencer"
     * @return true si vence en los próximos N días
     */
    public boolean venceProximamente(int dias) {
        Long diasRestantes = diasRestantesVencimiento();
        if (diasRestantes == null) {
            return false;
        }
        return diasRestantes > 0 && diasRestantes <= dias;
    }
}
