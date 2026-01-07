// ============================================================================
// 🧩 ModuloSistema.java – Entidad JPA (MBAC – CENATE 2025)
// ----------------------------------------------------------------------------
// Representa los módulos principales del sistema MBAC CENATE.
// Cada módulo agrupa varias páginas y contextos funcionales.
// ============================================================================

package com.styp.cenate.model;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "dim_modulos_sistema")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"paginas", "contextos"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class ModuloSistema {

    // ==========================================================
    // 🆔 Identificador principal
    // ==========================================================
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "id_modulo")
    private Integer idModulo;

    // ==========================================================
    // 📋 Datos básicos
    // ==========================================================
    @Column(name = "nombre_modulo", nullable = false, length = 255)
    private String nombreModulo;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "icono", length = 255)
    private String icono;

    @Column(name = "ruta_base", length = 255)
    private String rutaBase;

    @Builder.Default
    @Column(name = "activo", nullable = false)
    private Boolean activo = true;
    
    @Column(name="orden", nullable = true)
    private Integer orden;

    // ==========================================================
    // 🕓 Auditoría
    // ==========================================================
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ==========================================================
    // 🔗 Relaciones
    // ==========================================================
    /** Páginas asociadas al módulo (dim_paginas_modulo) */
    @OneToMany(mappedBy = "modulo", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
//    private List<PaginaModulo> paginas;
    @Builder.Default
    private Set<PaginaModulo> paginas = new LinkedHashSet<>();

    
    /** Contextos funcionales asociados al módulo (dim_contextos_modulo) */
    @OneToMany(mappedBy = "modulo", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
//    private List<ContextoModulo> contextos;
    @Builder.Default
    private Set<ContextoModulo> contextos = new LinkedHashSet<>();

    
    
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
    public String getNombreLimpio() {
        return nombreModulo != null ? nombreModulo.trim() : "Sin nombre";
    }
}