package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * Entidad que representa los tipos de atención en telemedicina
 * (TELCONSULTA, TELMONIT, TELINTERC, TELAPOYO, ORIENT-TEL, SEGUIM)
 *
 * @author Claude Code + Styp Canto Rondón
 * @version 2.0.0
 * @since 2026-01-03
 */
@Entity
@Table(name = "dim_tipo_atencion_telemedicina")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TipoAtencionTelemedicina {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipo_atencion")
    private Long idTipoAtencion;

    @Column(name = "cod_tipo_atencion", nullable = false, unique = true, length = 20)
    private String codTipoAtencion;

    @Column(name = "desc_tipo_atencion", nullable = false, length = 100)
    private String descTipoAtencion;

    @Column(name = "sigla", nullable = false, length = 20)
    private String sigla;

    @Column(name = "requiere_profesional", nullable = false)
    private Boolean requiereProfesional;

    @Column(name = "estado", nullable = false, length = 1)
    private String estado; // 'A' = Activo, 'I' = Inactivo

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    /**
     * Método ejecutado antes de persistir la entidad
     */
    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.estado == null) {
            this.estado = "A";
        }
        if (this.requiereProfesional == null) {
            this.requiereProfesional = true;
        }
    }

    /**
     * Método ejecutado antes de actualizar la entidad
     */
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

    /**
     * Verifica si el tipo de atención está activo
     *
     * @return true si estado = 'A', false en caso contrario
     */
    public boolean isActivo() {
        return "A".equals(this.estado);
    }

    /**
     * Activa el tipo de atención
     */
    public void activar() {
        this.estado = "A";
    }

    /**
     * Inactiva el tipo de atención
     */
    public void inactivar() {
        this.estado = "I";
    }

    /**
     * Verifica si requiere profesional de salud
     *
     * @return true si requiere profesional
     */
    public boolean requiereProfesional() {
        return this.requiereProfesional != null && this.requiereProfesional;
    }
}
