package com.styp.cenate.model.form107;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.time.LocalDate;

@Entity
@Table(name = "bolsa_107_carga", schema = "public",
       uniqueConstraints = @UniqueConstraint(name = "bolsa_107_carga_fecha_reporte_hash_archivo_key",
                                             columnNames = {"fecha_reporte", "hash_archivo"}))
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Bolsa107Carga {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_carga")
  private Long idCarga;

  @Column(name = "fecha_reporte", nullable = false)
  private LocalDate fechaReporte;

  @Column(name = "nombre_archivo", nullable = false, columnDefinition = "text")
  private String nombreArchivo;

  @Column(name = "hash_archivo", nullable = false, columnDefinition = "text")
  private String hashArchivo;

  @Column(name = "total_filas")
  private Integer totalFilas;

  @Column(name = "filas_ok")
  private Integer filasOk;

  @Column(name = "filas_error")
  private Integer filasError;

  @Column(name = "estado_carga", nullable = false, columnDefinition = "text")
  private String estadoCarga;

  @Column(name = "usuario_carga", columnDefinition = "text")
  private String usuarioCarga;

  @Column(name = "created_at", nullable = false)
  private OffsetDateTime createdAt;

  @PrePersist
  void prePersist() {
    if (fechaReporte == null) fechaReporte = LocalDate.now();
    if (estadoCarga == null) estadoCarga = "RECIBIDO";
    if (createdAt == null) createdAt = OffsetDateTime.now();
  }
}
