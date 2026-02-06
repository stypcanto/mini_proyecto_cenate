package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * ✅ v1.47.0: Entidad para registrar enfermedades crónicas del asegurado
 * Relación: Un asegurado puede tener múltiples enfermedades
 * Tipos: Hipertensión, Diabetes, Otro (con descripción)
 */
@Entity
@Table(name = "asegurado_enfermedad_cronica")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AseguradoEnfermedadCronica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_asegurado_enfermedad")
    private Long idAseguradoEnfermedad;

    @Column(name = "pk_asegurado", nullable = false)
    private String pkAsegurado;

    @Column(name = "tipo_enfermedad", nullable = false, length = 100)
    private String tipoEnfermedad; // "Hipertensión", "Diabetes", "Otro"

    @Column(name = "descripcion_otra", length = 500)
    private String descripcionOtra; // Detalles si es "Otro"

    @Column(name = "fecha_registro", nullable = false)
    private LocalDateTime fechaRegistro;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;

    @PrePersist
    protected void onCreate() {
        fechaRegistro = LocalDateTime.now();
        fechaActualizacion = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }
}
