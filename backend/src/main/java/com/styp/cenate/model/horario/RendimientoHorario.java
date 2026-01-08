package com.styp.cenate.model.horario;

import java.time.OffsetDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "rendimiento_horario")
@Data
public class RendimientoHorario {

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_rendimiento")
    private Long idRendimiento;

    @Column(name = "id_area_hosp", nullable = false)
    private Long idAreaHosp;

    @Column(name = "id_servicio", nullable = false)
    private Long idServicio;

    @Column(name = "id_actividad", nullable = false)
    private Long idActividad;

    @Column(name = "id_subactividad", nullable = false)
    private Long idSubactividad;

    @Column(name = "pacientes_por_hora", nullable = false)
    private Integer pacientesPorHora;

    @Column(name = "adicional", nullable = false)
    private Integer adicional;

    @Column(name = "estado", nullable = false, length = 1)
    private String estado; // A | I

    @Column(name = "fecha_registro", insertable = false, updatable = false)
    private OffsetDateTime fechaRegistro;

}
