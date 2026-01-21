package com.styp.cenate.dto.solicitudturno;

import java.time.OffsetDateTime;
import java.util.List;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SolicitudTurnoDetalleFullResponse {

  private Long idSolicitud;

  private Long idPeriodo;
  private String periodo;              // "202601"
  private String periodoDescripcion;   // "Enero 2026"
  private String fechaInicio;          // "2026-01-01"
  private String fechaFin;             // "2026-01-31"

  private String estado;

  private OffsetDateTime fechaCreacion;
  private OffsetDateTime fechaActualizacion;
  private OffsetDateTime fechaEnvio;

  private Integer totalTurnosSolicitados;
  private Integer totalEspecialidades;

  private Long idIpress;
  private String nombreIpress;
  private String codigoRenaes;

  private Long idUsuarioCreador;
  private String nombreUsuarioCreador;

  private List<DetalleFull> detalles;

  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  @Builder
  public static class DetalleFull {
    private Long idDetalle;

    private Long idServicio;
    private String nombreServicio;
    private String codigoServicio;

    private Boolean requiere;

    private Integer turnos;      // total
    private Integer turnoTM;
    private Integer turnoManana;
    private Integer turnoTarde;

    private Boolean tc;
    private Boolean tl;

    private String observacion;
    private String estado;

    private OffsetDateTime fechaCreacion;
    private OffsetDateTime fechaActualizacion;

    private List<FechaDetalleFull> fechasDetalle;
  }

  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  @Builder
  public static class FechaDetalleFull {
    private Long idDetalleFecha;
    private String fecha;  // yyyy-MM-dd
    private String bloque; // MANANA|TARDE
    private OffsetDateTime createdAt;
  }
}
