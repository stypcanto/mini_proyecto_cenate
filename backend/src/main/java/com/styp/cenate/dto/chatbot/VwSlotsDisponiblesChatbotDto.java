package com.styp.cenate.dto.chatbot;

import java.time.LocalDate;
import java.time.LocalTime;

import lombok.Data;

@Data
public class VwSlotsDisponiblesChatbotDto {

    private String pkSlot;
    private String periodo;
    private Long idAreaHosp;
    private String area;
    private Long idServicio;
    private String servicio;
    private Integer idActividad;
    private String actividad;
    private Integer idSubactividad;
    private String subactividad;
    private Integer idTipTurno;
    private String tipoTurno;
    private Long idPers;
    private String numDocPers;
    private String profesional;
    private String turno;
    private LocalDate fechaCita;
    private LocalTime horaCita;
    private String codServicio;
}
