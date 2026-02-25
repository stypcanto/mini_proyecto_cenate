package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "consolidado_pendientes_mensual")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsolidadoPendientesMensual {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cons_pend")
    private Long idConsPend;

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

    @Column(name = "abandono")
    private Integer abandono;
}
