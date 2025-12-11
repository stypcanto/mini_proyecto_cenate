package com.styp.cenate.model.chatbot;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "dim_estado_cita", schema = "public")
@Getter
@Setter
public class DimEstadoCita {

    @Id
    @Column(name = "id_estado_cita")
    private Long idEstadoCita;   // en tu DDL está como int8

    @Column(name = "cod_estado_cita")
    private String codEstadoCita;

    @Column(name = "desc_estado_paciente")
    private String descEstadoPaciente;

    @Column(name = "desc_estado_backoffice")
    private String descEstadoBackoffice;

    @Column(name = "cod_estado_bot")
    private String codEstadoBot;

    @Column(name = "cod_estado_essi")
    private String codEstadoEssi;

    @Column(name = "bloquea_slot")
    private Boolean bloqueaSlot;
}
