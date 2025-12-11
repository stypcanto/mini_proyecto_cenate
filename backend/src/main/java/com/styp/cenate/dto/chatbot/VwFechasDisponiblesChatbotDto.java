package com.styp.cenate.dto.chatbot;

import java.time.LocalDate;

import lombok.Data;

@Data
public class VwFechasDisponiblesChatbotDto {

    private String pkFecha;
    private String periodo;
    private Integer idServicio;
    private String servicio;
    private LocalDate fechaCita;
    private Integer idTipTurno;
    private String tipoTurno;
    private String descTipTurno;
    private String codServicio;
}
