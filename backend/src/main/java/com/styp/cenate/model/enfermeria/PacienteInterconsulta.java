package com.styp.cenate.model.enfermeria;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "pacientes_interconsulta")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PacienteInterconsulta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_interconsulta")
    private Long idInterconsulta;

    @Column(name = "id_paciente", nullable = false)
    private Long idPaciente;

    @Column(name = "id_atencion_origen", nullable = false)
    private Long idAtencionOrigen; // FK a AtencionEnfermeria

    @Builder.Default
    @Column(name = "origen", length = 20)
    private String origen = "ENFERMERIA";

    @Column(name = "especialidad_destino", nullable = false, length = 100)
    private String especialidadDestino;

    @Column(name = "motivo_derivacion", columnDefinition = "TEXT")
    private String motivoDerivacion;

    @Builder.Default
    @Column(name = "estado", length = 20)
    private String estado = "PENDIENTE";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
