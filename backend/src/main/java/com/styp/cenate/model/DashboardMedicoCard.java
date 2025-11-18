// ============================================================================
// 🧩 DashboardMedicoCard.java – Entidad JPA (CMS Dashboard Médico – CENATE 2025)
// ----------------------------------------------------------------------------
// Representa las cards personalizables del Dashboard Médico.
// Permite gestión dinámica de cards mediante CMS en módulo de Administración.
// ============================================================================

package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "dashboard_medico_cards")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class DashboardMedicoCard {

    // ==========================================================
    // 🆔 Identificador principal
    // ==========================================================
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "id")
    private Integer id;

    // ==========================================================
    // 📋 Datos básicos de la card
    // ==========================================================
    @Column(name = "titulo", nullable = false, length = 255)
    private String titulo;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "link", nullable = false, length = 500)
    private String link;

    @Column(name = "icono", nullable = false, length = 100)
    private String icono;

    @Column(name = "color", length = 50)
    @Builder.Default
    private String color = "#0A5BA9";

    @Column(name = "orden")
    @Builder.Default
    private Integer orden = 0;

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;

    @Column(name = "target_blank", nullable = false)
    @Builder.Default
    private Boolean targetBlank = true; // Siempre true por defecto

    // ==========================================================
    // 🕓 Auditoría
    // ==========================================================
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ==========================================================
    // ⚙️ Hooks de ciclo de vida
    // ==========================================================
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (color == null) color = "#0A5BA9";
        if (orden == null) orden = 0;
        if (activo == null) activo = true;
        if (targetBlank == null) targetBlank = true; // Siempre true por defecto
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // ==========================================================
    // 🧩 Métodos utilitarios
    // ==========================================================
    public String getTituloLimpio() {
        return titulo != null ? titulo.trim() : "Sin título";
    }

    public boolean isLinkExterno() {
        return link != null && (link.startsWith("http://") || link.startsWith("https://"));
    }
}

