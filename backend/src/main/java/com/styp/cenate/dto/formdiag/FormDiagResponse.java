package com.styp.cenate.dto.formdiag;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO para responder con los datos del formulario de diagnóstico
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FormDiagResponse {

    private Integer idFormulario;
    private Long idIpress;
    private String nombreIpress;
    private String codigoIpress;
    private Long idRed;
    private String nombreRed;
    private String nombreMacroregion;
    private Integer anio;
    private String estado;
    private String usuarioRegistro;
    private String observaciones;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaEnvio;

    private DatosGeneralesDto datosGenerales;
    private RecursosHumanosDto recursosHumanos;
    private InfraestructuraDto infraestructura;
    private List<EquipamientoDto> equipamiento;
    private ConectividadDto conectividad;
    private List<ServicioDto> servicios;
    private NecesidadesDto necesidades;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DatosGeneralesDto {
        private String directorNombre;
        private String directorCorreo;
        private String directorTelefono;
        private String responsableNombre;
        private String responsableCorreo;
        private String responsableTelefono;
        private Long poblacionAdscrita;
        private Long atencionesMenuales;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecursosHumanosDto {
        private Boolean coordTelesalud;
        private String coordNombreCompleto;
        private String coordCorreo;
        private String coordCelular;
        private Boolean personalApoyo;
        private Boolean capacitacionTic;
        private Boolean normativa;
        private Boolean alfabetizacion;
        private Boolean planCapacitacion;
        private Integer capacitacionesAnio;
        private String necesidadesCapacitacion;
        private List<PersonalApoyoDto> personalApoyoDetalle;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PersonalApoyoDto {
        private Integer id;
        private Integer idCategoria;
        private String nombreCategoria;
        private Integer cantidad;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InfraestructuraDto {
        // Física
        private Boolean espacioFisico;
        private Boolean privacidad;
        private Boolean escritorio;
        private Boolean sillas;
        private Boolean estantes;
        private Boolean archivero;
        private Boolean iluminacion;
        private Boolean ventilacion;
        private Boolean aireAcondicionado;
        private Integer numAmbientes;
        // Tecnológica
        private Boolean hardware;
        private Boolean software;
        private Boolean redes;
        private Boolean almacenamiento;
        private Boolean serviciosTec;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EquipamientoDto {
        private Integer id;
        private Integer idEquipamiento;
        private String nombreEquipamiento;
        private String tipoEquipamiento;
        private Boolean disponible;
        private Integer cantidad;
        private Integer idEstadoEquipo;
        private String estado;
        private String observaciones;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConectividadDto {
        // Conectividad
        private Boolean internet;
        private Boolean estable;
        private Boolean energiaAlt;
        private Boolean puntosRed;
        private Boolean wifi;
        private String tipoConexion;
        private String proveedor;
        private Integer velocidadContratada;
        private Integer velocidadReal;
        private Integer numPuntosRed;
        // Sistemas
        private Boolean essi;
        private Boolean pacs;
        private Boolean anatpat;
        private Boolean videoconferencia;
        private Boolean citasLinea;
        private String otroSistema;
        // Seguridad
        private Boolean confidencialidad;
        private Boolean integridad;
        private Boolean disponibilidad;
        private Boolean contingencia;
        private Boolean backup;
        private Boolean consentimiento;
        private Boolean ley29733;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ServicioDto {
        private Integer id;
        private Integer idServicio;
        private String nombreServicio;
        private Boolean disponible;
        private String observaciones;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NecesidadesDto {
        private List<NecesidadItemDto> necesidades;
        private List<CapacitacionDto> capacitacion;
        private String necesidadesConectividad;
        private String necesidadesCapacitacion;
        private String observacionesGenerales;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NecesidadItemDto {
        private Integer id;
        private Integer idNecesidad;
        private String nombreNecesidad;
        private String categoria;
        private Integer cantidadRequerida;
        private Integer idPrioridad;
        private String prioridad;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CapacitacionDto {
        private Integer id;
        private String temaCapacitacion;
        private String poblacionObjetivo;
        private Integer numParticipantes;
        private Integer idPrioridad;
        private String prioridad;
    }
}
