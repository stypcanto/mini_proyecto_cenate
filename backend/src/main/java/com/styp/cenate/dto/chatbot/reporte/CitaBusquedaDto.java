package com.styp.cenate.dto.chatbot.reporte;

import java.time.LocalDate;
import java.time.LocalTime;

import lombok.Data;

@Data
public class CitaBusquedaDto {
    private Integer idSolicitud;
    private String periodo;

    private String profesional;
    private String numDocPers;

    private String areaHospitalaria;

    private Integer idServicio;
    private String codServicio;
    private String descServicio;

    private String descActividad;
    private String descSubactividad;

    private LocalDate fechaCita;
    private LocalTime horaCita;

    private String docPaciente;
    private String nombresPaciente;

    private String descEstadoPaciente;
    private String descEstadoBackoffice;

    private Boolean bloqueaSlot;
    private Boolean esFinal;
}
