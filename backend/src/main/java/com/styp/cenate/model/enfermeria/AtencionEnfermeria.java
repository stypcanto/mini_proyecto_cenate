package com.styp.cenate.model.enfermeria;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.Map;

@Entity
@Table(name = "atenciones_enfermeria")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AtencionEnfermeria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_atencion_enf")
    private Long idAtencionEnf;

    @Column(name = "id_paciente", nullable = false)
    private Long idPaciente;

    @Column(name = "id_atencion_medica_ref")
    private Long idAtencionMedicaRef;

    @Column(name = "id_cita_ref")
    private Long idCitaRef;

    @Column(name = "fecha_atencion")
    private LocalDateTime fechaAtencion;

    @Column(name = "motivo_consulta", columnDefinition = "TEXT")
    private String motivoConsulta;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "signos_vitales", columnDefinition = "jsonb")
    private Map<String, Object> signosVitales;

    @Column(name = "id_usuario_enfermera", nullable = false)
    private Long idUsuarioEnfermera; // ID del PersonalProf

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
