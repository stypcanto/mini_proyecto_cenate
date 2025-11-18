// ============================================================================
// 🧩 ContextoModulo.java – Entidad JPA (MBAC – CENATE 2025)
// ----------------------------------------------------------------------------
// Representa el contexto funcional asociado a un módulo del sistema CENATE.
// Define la entidad principal sobre la cual se aplican los permisos modulares.
// ============================================================================

package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "dim_contexto_modulo")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "modulo")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class ContextoModulo {

    // ==========================================================
    // 🆔 Identificador principal
    // ==========================================================
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "id_contexto")
    private Integer idContexto;

    // ==========================================================
    // 🔗 Relación con módulo
    // ==========================================================
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_modulo", nullable = false)
    private ModuloSistema modulo;

    // ==========================================================
    // 📋 Datos del contexto
    // ==========================================================
    @Column(name = "entidad_principal", nullable = false, length = 255)
    private String entidadPrincipal;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Builder.Default
    @Column(name = "activo", nullable = false)
    private Boolean activo = true;

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
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // ==========================================================
    // 🧩 Métodos utilitarios
    // ==========================================================
    public String getNombreContexto() {
        return entidadPrincipal != null ? entidadPrincipal.trim() : "Desconocido";
    }
}