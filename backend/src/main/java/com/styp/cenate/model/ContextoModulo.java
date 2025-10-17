package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entidad que representa el contexto de un módulo.
 * Define la entidad principal sobre la cual se aplican los permisos modulares.
 * 
 * Ejemplos de contextos:
 * - Módulo de Citas: entidad_principal = "Cita"
 * - Módulo de Personal: entidad_principal = "PersonalCnt"
 * - Módulo de IPRESS: entidad_principal = "Ipress"
 * 
 * @author CENATE Development Team
 * @version 1.0
 */
@Entity
@Table(name = "dim_contexto_modulo")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContextoModulo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_contexto")
    private Integer idContexto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_modulo", nullable = false)
    private ModuloSistema modulo;

    @Column(name = "entidad_principal", nullable = false, length = 255)
    private String entidadPrincipal;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "activo")
    @Builder.Default
    private Boolean activo = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

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
