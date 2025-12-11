package com.styp.cenate.model.chatbot;

import java.time.LocalDate;

import org.hibernate.annotations.Immutable;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "vw_fechas_disponibles_chatbot")
@Immutable
@Getter
@Setter
public class VwFechasDisponiblesChatbot {

    @Id
    @Column(name = "pk_fecha")
    private String pkFecha;

    @Column(name = "periodo")
    private String periodo;

    @Column(name = "id_servicio")
    private Integer idServicio;

    @Column(name = "servicio")
    private String servicio;

    @Column(name = "fecha_cita")
    private LocalDate fechaCita;

    @Column(name = "id_tip_turno")
    private Integer idTipTurno;

    @Column(name = "tipo_turno")
    private String tipoTurno;

    @Column(name = "desc_tip_turno")
    private String descTipTurno;

    @Column(name = "cod_servicio")
    private String codServicio;
}
