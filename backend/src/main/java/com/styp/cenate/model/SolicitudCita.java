package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;

@Entity
@Table(name = "solicitud_cita")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SolicitudCita {

    // PK -------------------------------------------------------
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_solicitud")
    private Long idSolicitud;

    
    @Column(name = "periodo", length = 6, nullable = false)
    private String periodo;                // p.e. 202501

    @Column(name = "fecha_cita")
    private LocalDate fechaCita;

    @Column(name = "hora_cita")
    private LocalTime horaCita;

    @Column(name = "doc_paciente", length = 15)
    private String docPaciente;

    @Column(name = "nombres_paciente", columnDefinition = "text")
    private String nombresPaciente;

    @Column(name = "sexo", columnDefinition = "bpchar(1)")
    private String sexo;

    @Column(name = "edad")
    private Integer edad;

    @Column(name = "telefono", length = 15)
    private String telefono;

    @Column(name = "fecha_solicitud", columnDefinition = "timestamptz")
    private OffsetDateTime fechaSolicitud;

    @Column(name = "estado_solicitud", length = 20)
    private String estadoSolicitud;

    @Column(name = "observacion", columnDefinition = "text")
    private String observacion;

    @Column(name = "fecha_actualiza", columnDefinition = "timestamptz")
    private OffsetDateTime fechaActualiza;

    // Relaciones (FK) ------------------------------------------
    // dim_personal_cnt -> PersonalCnt
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pers", foreignKey = @ForeignKey(name = "fk_solicitud_pers"))
    private PersonalCnt personal;

    // dim_area_hosp -> AreaHospitalaria
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_area_hosp", foreignKey = @ForeignKey(name = "fk_solicitud_area"))
    private AreaHospitalaria areaHospitalaria;

    // dim_servicio_essi -> ServicioEssi
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_servicio", foreignKey = @ForeignKey(name = "fk_solicitud_servicio"))
    private DimServicioEssi servicio;

    // dim_actividad_essi -> ActividadEssi
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_actividad", foreignKey = @ForeignKey(name = "fk_solicitud_actividad"))
    private ActividadEssi actividad;

    // dim_subactividad_essi -> SubactividadEssi
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_subactividad", foreignKey = @ForeignKey(name = "fk_solicitud_subactividad"))
    private SubactividadEssi subactividad;
}
