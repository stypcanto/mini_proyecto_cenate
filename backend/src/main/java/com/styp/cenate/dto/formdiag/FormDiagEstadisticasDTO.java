package com.styp.cenate.dto.formdiag;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * DTO para responder con estadísticas detalladas del formulario de diagnóstico
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FormDiagEstadisticasDTO {

    // ==================== Datos Generales ====================
    private Integer idFormulario;
    private Long idIpress;
    private String nombreIpress;
    private String codigoIpress;
    private Long idRed;
    private String nombreRed;
    private String nombreMacroregion;
    private Integer anio;
    private String estado;
    private LocalDateTime fechaEnvio;

    // ==================== Resumen General ====================
    private Integer totalPreguntas;
    private Integer preguntasSi;
    private Integer preguntasNo;
    private Double porcentajeSi;

    // ==================== Infraestructura Física ====================
    private InfraestructuraFisicaStats infraFisica;

    // ==================== Infraestructura Tecnológica ====================
    private InfraestructuraTecStats infraTec;

    // ==================== Conectividad ====================
    private ConectividadStats conectividad;

    // ==================== Equipamiento ====================
    private List<EquipamientoStats> equipamientoInformatico;
    private List<EquipamientoStats> equipamientoBiomedico;
    private EquipamientoResumenStats equipamientoResumen;

    // ==================== Servicios de Telesalud ====================
    private List<ServicioStats> servicios;
    private ServicioResumenStats servicioResumen;

    // ==================== Necesidades ====================
    private List<NecesidadStats> necesidades;
    private NecesidadResumenStats necesidadResumen;

    // ==================== Recursos Humanos ====================
    private RecursosHumanosStats rrhh;

    // ==================== Firma Digital ====================
    private FirmaStats firma;

    // ==================== Nested Classes ====================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InfraestructuraFisicaStats {
        private Integer totalPreguntas;
        private Integer respuestasSi;
        private Integer respuestasNo;
        private Double porcentajeCumplimiento;
        private Map<String, Boolean> detalles; // pregunta → respuesta (Si/No)
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InfraestructuraTecStats {
        private Integer totalPreguntas;
        private Integer respuestasSi;
        private Integer respuestasNo;
        private Double porcentajeCumplimiento;
        private Map<String, Boolean> detalles; // pregunta → respuesta
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConectividadStats {
        private Boolean tieneInternet;
        private Boolean esEstable;
        private String tipoConexion;
        private String proveedor;
        private Integer velocidadContratada;
        private Integer velocidadReal;
        private Boolean tieneEnergyAlt;
        private Integer numPuntosRed;
        private Boolean tieneWifi;
        private List<SistemaDisponible> sistemas;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SistemaDisponible {
        private String nombre;
        private Boolean disponible;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EquipamientoStats {
        private Integer id;
        private String nombreEquipamiento;
        private String tipoEquipamiento;
        private Boolean disponible;
        private Integer cantidad;
        private String estado;
        private String observaciones;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EquipamientoResumenStats {
        private Integer totalEquipos;
        private Integer equiposDisponibles;
        private Integer equiposNoDisponibles;
        private Double porcentajeDisponibilidad;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ServicioStats {
        private Integer id;
        private String nombreServicio;
        private Boolean disponible;
        private String observaciones;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ServicioResumenStats {
        private Integer totalServicios;
        private Integer serviciosDisponibles;
        private Integer serviciosNoDisponibles;
        private Double porcentajeDisponibilidad;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NecesidadStats {
        private Integer id;
        private String categoria;
        private String descripcion;
        private Integer cantidadRequerida;
        private String prioridad;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NecesidadResumenStats {
        private Integer totalNecesidades;
        private Integer necesidadesAlta;
        private Integer necesidadesMedia;
        private Integer necesidadesBaja;
        private Integer infraestructura;
        private Integer equipamiento;
        private Integer rrhh;
        private Integer otros;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecursosHumanosStats {
        private Integer totalPreguntas;
        private Integer respuestasSi;
        private Integer respuestasNo;
        private Double porcentajeSi;
        private Boolean tieneCoordinador;
        private String coordinadorNombre;
        private String coordinadorCorreo;
        private Boolean tienePersonalApoyo;
        private List<PersonalApoyoStats> personalApoyoDetalle;
        private Boolean tieneCapacitacionTic;
        private Boolean conoceNormativa;
        private Integer capacitacionesAnio;
        private String necesidadesCapacitacion;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PersonalApoyoStats {
        private String categoria;
        private Integer cantidad;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FirmaStats {
        private Boolean estaFirmado;
        private String firmanteNombre;
        private String firmanteRol;
        private LocalDateTime fechaFirma;
        private String certificado;
    }
}
