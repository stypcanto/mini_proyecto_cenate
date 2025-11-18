// ============================================================================
// 🧩 PermisoModular.java – Entidad JPA (MBAC – CENATE 2025)
// ----------------------------------------------------------------------------
// Representa la tabla permisos_modulares del sistema MBAC.
// Define las acciones que un usuario o rol puede realizar en una página.
// ============================================================================
package com.styp.cenate.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "permisos_modulares",
        uniqueConstraints = @UniqueConstraint(columnNames = {"id_user", "id_rol", "id_pagina"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PermisoModular {

    // ============================================================
    // 🔹 Identificadores y relaciones
    // ============================================================
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_permiso")
    private Integer idPermiso;

    @Column(name = "id_user", nullable = false)
    private Long idUser;

    @Column(name = "id_rol", nullable = false)
    private Integer idRol;

    @Column(name = "id_modulo", nullable = false)
    private Integer idModulo;

    @Column(name = "id_pagina", nullable = false)
    private Integer idPagina;

    // ============================================================
    // 🔗 Relación con PaginaModulo
    // ============================================================
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pagina", insertable = false, updatable = false)
    @JsonBackReference
    private PaginaModulo pagina;

    // ============================================================
    // 🔹 Acción y permisos MBAC
    // ============================================================
    @Column(name = "accion", nullable = false, length = 50)
    private String accion;

    @Builder.Default
    @Column(name = "puede_ver", nullable = false)
    private Boolean puedeVer = false;

    @Builder.Default
    @Column(name = "puede_crear", nullable = false)
    private Boolean puedeCrear = false;

    @Builder.Default
    @Column(name = "puede_editar", nullable = false)
    private Boolean puedeEditar = false;

    @Builder.Default
    @Column(name = "puede_eliminar", nullable = false)
    private Boolean puedeEliminar = false;

    @Builder.Default
    @Column(name = "puede_exportar", nullable = false)
    private Boolean puedeExportar = false;

    @Builder.Default
    @Column(name = "puede_aprobar", nullable = false)
    private Boolean puedeAprobar = false;

    // ============================================================
    // 🔹 Estado y auditoría
    // ============================================================
    @Builder.Default
    @Column(name = "activo", nullable = false)
    private Boolean activo = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ============================================================
    // 🔹 Hooks de ciclo de vida
    // ============================================================
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}