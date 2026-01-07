package com.styp.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO para respuesta de Información IPRESS
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-06
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InformacionIpressResponse {

    private Long idInformacionIpress;

    private Long idLineamiento;

    private String codigoLineamiento;

    private String tituloLineamiento;

    private Long idIpress;

    private String descIpress;

    private String nombreRed;

    private String contenido;

    private String requisitos;

    private LocalDateTime fechaImplementacion;

    private String estadoCumplimiento;

    private String observaciones;

    private String responsable;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private boolean cumple;
}
