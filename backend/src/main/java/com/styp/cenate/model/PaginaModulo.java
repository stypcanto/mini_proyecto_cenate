// ============================================================================
// 🧩 PaginaModulo.java – Entidad JPA (MBAC – CENATE 2025)
// ----------------------------------------------------------------------------
// Representa las páginas del sistema dentro de un módulo y sus permisos
// asociados a roles/usuarios. Se vincula con PermisoModular.
// ============================================================================
package com.styp.cenate.model;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "dim_paginas_modulo")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaginaModulo {
	

    // ============================================================
    // 🔹 Identificadores y relaciones
    // ============================================================
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pagina")
    private Integer idPagina;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_modulo", nullable = false)
    @JsonBackReference
    private ModuloSistema modulo;

    // ============================================================
    // 🔹 Propiedades base
    // ============================================================
    @Column(name = "nombre_pagina", nullable = false, length = 255)
    private String nombrePagina;

    @Column(name = "ruta_pagina", nullable = false, length = 255)
    private String rutaPagina;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Builder.Default
    @Column(name = "activo", nullable = false)
    private Boolean activo = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
   
    @Column(name = "orden")
    private Integer orden;
    

    // ============================================================
    // 🔗 Relación con Permisos Modulares
    // ============================================================
    @OneToMany(mappedBy = "pagina", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<PermisoModular> permisos;

    // ============================================================
    // 🔹 Hooks de ciclo de vida
    // ============================================================
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }


	@PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
}