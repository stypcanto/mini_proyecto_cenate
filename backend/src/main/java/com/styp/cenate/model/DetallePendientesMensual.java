package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "detalle_pendientes_mensual")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetallePendientesMensual {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_det_pend")
    private Long idDetPend;

    @Column(name = "dni_medico")
    private String dniMedico;

    @Column(name = "profesional")
    private String profesional;

    @Column(name = "fecha_cita")
    private LocalDate fechaCita;

    @Column(name = "subactividad")
    private String subactividad;

    @Column(name = "servicio")
    private String servicio;

    @Column(name = "doc_paciente")
    private String docPaciente;

    @Column(name = "paciente")
    private String paciente;

    @Column(name = "abandono")
    private String abandono;

    @Column(name = "hora_cita")
    private LocalTime horaCita;

    @Column(name = "turno")
    private String turno;
}
