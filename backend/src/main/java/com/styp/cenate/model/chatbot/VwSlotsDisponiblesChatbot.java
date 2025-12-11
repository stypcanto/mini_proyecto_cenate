package com.styp.cenate.model.chatbot;

import java.time.LocalDate;
import java.time.LocalTime;

import org.hibernate.annotations.Immutable;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "vw_slots_disponibles_chatbot")
@Immutable
@Getter
@Setter
public class VwSlotsDisponiblesChatbot {

    @Id
    @Column(name = "pk_slot")
    private String pkSlot;

    @Column(name = "periodo")
    private String periodo;

    @Column(name = "id_area_hosp")
    private Long idAreaHosp;

    @Column(name = "area")
    private String area;

    @Column(name = "id_servicio")
    private Long idServicio;

    @Column(name = "servicio")
    private String servicio;

    @Column(name = "id_actividad")
    private Integer idActividad;

    @Column(name = "actividad")
    private String actividad;

    @Column(name = "id_subactividad")
    private Integer idSubactividad;

    @Column(name = "subactividad")
    private String subactividad;

    @Column(name = "id_tip_turno")
    private Integer idTipTurno;

    @Column(name = "tipo_turno")
    private String tipoTurno;

    @Column(name = "id_pers")
    private Long idPers;

    @Column(name = "num_doc_pers")
    private String numDocPers;

    @Column(name = "profesional")
    private String profesional;

    @Column(name = "turno")
    private String turno;

    @Column(name = "fecha_cita")
    private LocalDate fechaCita;

    @Column(name = "hora_cita")
    private LocalTime horaCita;

    @Column(name = "cod_servicio")
    private String codServicio;
}
