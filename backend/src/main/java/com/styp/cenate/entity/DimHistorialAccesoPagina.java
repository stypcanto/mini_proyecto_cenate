package com.styp.cenate.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * DimHistorialAccesoPagina - Registro de accesos a páginas por usuarios
 * Auditoría de navegación: quién, cuándo, dónde
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(
  name = "dim_historial_acceso_paginas",
  indexes = {
    @Index(name = "idx_acceso_usuario", columnList = "id_usuario, created_at DESC"),
    @Index(name = "idx_acceso_ruta", columnList = "id_pagina, created_at DESC")
  }
)
public class DimHistorialAccesoPagina {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_acceso_pagina")
  private Long idAccesoPagina;

  @Column(name = "id_usuario", nullable = false)
  private Integer idUsuario;

  @Column(name = "id_personal")
  private Integer idPersonal;

  @Column(name = "id_pagina", nullable = false)
  private Integer idPagina;

  @Column(name = "nombre_pagina", nullable = false, length = 255)
  private String nombrePagina;

  @Column(name = "tipo_acceso", length = 50)
  @Builder.Default
  private String tipoAcceso = "CLICK_MENU"; // CLICK_MENU, NAVEGACION_DIRECTA, ENLACE, BOTTON_DIRECTO

  @Column(name = "created_at", nullable = false, updatable = false)
  @Builder.Default
  private LocalDateTime createdAt = LocalDateTime.now();

  @PrePersist
  protected void onCreate() {
    if (createdAt == null) {
      createdAt = LocalDateTime.now();
    }
  }
}
