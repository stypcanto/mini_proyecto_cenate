package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "gestion_paciente")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GestionPaciente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_gestion")
    private Long idGestion;

    // Relación con Asegurado (FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pk_asegurado", referencedColumnName = "pk_asegurado", nullable = false)
    private Asegurado asegurado;

    @Column(name = "condicion", length = 50)
    private String condicion;

    @Column(name = "gestora", length = 100)
    private String gestora;

    @Column(name = "observaciones", columnDefinition = "text")
    private String observaciones;

    @Column(name = "origen", length = 100)
    private String origen;

    @Column(name = "seleccionado_telemedicina")
    private Boolean seleccionadoTelemedicina;

    @Column(name = "fecha_creacion", columnDefinition = "timestamptz", updatable = false)
    private OffsetDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion", columnDefinition = "timestamptz")
    private OffsetDateTime fechaActualizacion;

    @PrePersist
    protected void onCreate() {
        fechaCreacion = OffsetDateTime.now();
        fechaActualizacion = OffsetDateTime.now();
        if (condicion == null) {
            condicion = "Pendiente";
        }
        if (seleccionadoTelemedicina == null) {
            seleccionadoTelemedicina = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = OffsetDateTime.now();
    }
}
