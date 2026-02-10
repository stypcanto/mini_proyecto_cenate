package com.styp.cenate.dto;

import lombok.*;
import java.time.LocalDate;

/**
 * 📋 AtencionClinica107FiltroDTO - Request DTO para filtros
 * Propósito: Recibe parámetros de filtrado desde el frontend
 * Módulo: 107
 * 
 * ⚠️ NOTA IMPORTANTE: red y macrorregion NO son filtrables en backend (dinámico)
 * Esos datos se muestran en el registro pero no se usan para filtrado en queries
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtencionClinica107FiltroDTO {
    // 📌 Filtros Disponibles
    
    // Bolsa
    private Long idBolsa; // OBLIGATORIO: 1 para Módulo 107
    
    // Fecha
    private LocalDate fechaDesde;
    private LocalDate fechaHasta;
    
    // IPRESS
    private Long idIpress;
    private String codigoIpress;
    
    // Paciente
    private String pacienteDni;
    private String pacienteNombre;
    private String tipoDocumento;
    
    // Estado
    private Long estadoGestionCitasId;
    private String estado; // PENDIENTE, ATENDIDO
    
    // 🆕 Condición Médica (Pendiente, Atendido, Deserción)
    private String condicionMedica;
    
    // Derivación
    private String derivacionInterna;
    
    // Especialidad
    private String especialidad;
    
    // Tipo de Cita
    private String tipoCita;
    
    // Búsqueda General
    private String searchTerm;
    
    // 📊 Paginación
    private Integer pageNumber = 0;
    private Integer pageSize = 10;
    private String sortBy = "fechaSolicitud";
    private Boolean sortDesc = true;
}
