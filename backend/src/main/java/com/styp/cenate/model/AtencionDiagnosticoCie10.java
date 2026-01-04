// ========================================================================
// AtencionDiagnosticoCie10.java - Diagnósticos CIE-10 de una atención
// ------------------------------------------------------------------------
// CENATE 2026 | Modelo para múltiples diagnósticos CIE-10 por atención
// ========================================================================

package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.ZonedDateTime;

@Entity
@Table(name = "atencion_diagnosticos_cie10")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtencionDiagnosticoCie10 {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_atencion_diagnostico")
    private Long idAtencionDiagnostico;

    @Column(name = "id_atencion", nullable = false)
    private Long idAtencion;

    @Column(name = "cie10_codigo", nullable = false, length = 20)
    private String cie10Codigo;

    @Column(name = "es_principal", nullable = false)
    private Boolean esPrincipal;

    @Column(name = "orden", nullable = false)
    private Short orden;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt;

    // Relación con AtencionClinica
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_atencion", insertable = false, updatable = false)
    private AtencionClinica atencionClinica;
}
