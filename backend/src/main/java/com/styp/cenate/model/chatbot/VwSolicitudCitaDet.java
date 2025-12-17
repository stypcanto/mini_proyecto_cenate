package com.styp.cenate.model.chatbot;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;

import org.hibernate.annotations.Immutable;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Immutable
@Table(name = "vw_solicitud_cita_det")
public class VwSolicitudCitaDet {

    @Id
    @Column(name = "id_solicitud")
    private Integer idSolicitud;

    @Column(name = "periodo")
    private String periodo;

    @Column(name = "periodo_fecha_inicio")
    private LocalDate periodoFechaInicio;

    @Column(name = "periodo_fecha_fin")
    private LocalDate periodoFechaFin;

    @Column(name = "estado_periodo")
    private String estadoPeriodo;

    @Column(name = "id_pers")
    private Integer idPers;

    @Column(name = "num_doc_pers")
    private String numDocPers;

    @Column(name = "profesional")
    private String profesional;

    @Column(name = "id_area_hosp")
    private Integer idAreaHosp;

    @Column(name = "area_hospitalaria")
    private String areaHospitalaria;

    @Column(name = "id_servicio")
    private Integer idServicio;

    @Column(name = "cod_servicio")
    private String codServicio;

    @Column(name = "desc_servicio")
    private String descServicio;

    @Column(name = "id_actividad")
    private Integer idActividad;

    @Column(name = "cod_actividad")
    private String codActividad;

    @Column(name = "desc_actividad")
    private String descActividad;

    @Column(name = "id_subactividad")
    private Integer idSubactividad;

    @Column(name = "cod_subactividad")
    private String codSubactividad;

    @Column(name = "desc_subactividad")
    private String descSubactividad;

    @Column(name = "fecha_cita")
    private LocalDate fechaCita;

    @Column(name = "hora_cita")
    private LocalTime horaCita;

    @Column(name = "doc_paciente")
    private String docPaciente;

    @Column(name = "nombres_paciente")
    private String nombresPaciente;

    @Column(name = "sexo")
    private String sexo;

    @Column(name = "edad")
    private Integer edad;

    @Column(name = "telefono")
    private String telefono;

    @Column(name = "fecha_solicitud")
    private OffsetDateTime fechaSolicitud;

    @Column(name = "fecha_actualiza")
    private OffsetDateTime fechaActualiza;

    @Column(name = "observacion")
    private String observacion;

    @Column(name = "id_estado_cita")
    private Long idEstadoCita;

    @Column(name = "cod_estado_cita")
    private String codEstadoCita;

    @Column(name = "desc_estado_paciente")
    private String descEstadoPaciente;

    @Column(name = "desc_estado_backoffice")
    private String descEstadoBackoffice;

    @Column(name = "bloquea_slot")
    private Boolean bloqueaSlot;

    @Column(name = "es_final")
    private Boolean esFinal;

    @Column(name = "id_area")
    private Long idArea;

    @Column(name = "area")
    private String area;
}
