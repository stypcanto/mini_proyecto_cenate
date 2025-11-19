package com.styp.cenate.dto.segu;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermisoRolModuloViewDTO {
    
    @JsonProperty("idPermiso")
    private Integer idPermiso;
    
    @JsonProperty("idRol")
    private Integer idRol;
    
    @JsonProperty("nombreRol")
    private String nombreRol;
    
    @JsonProperty("idModulo")
    private Integer idModulo;
    
    @JsonProperty("nombreModulo")
    private String nombreModulo;
    
    @JsonProperty("puedeAcceder")
    private Boolean puedeAcceder;
    
    @JsonProperty("puedeVer")
    private Boolean puedeVer;
    
    @JsonProperty("puedeCrear")
    private Boolean puedeCrear;
    
    @JsonProperty("puedeEditar")
    private Boolean puedeEditar;
    
    @JsonProperty("puedeEliminar")
    private Boolean puedeEliminar;
    
    @JsonProperty("puedeExportar")
    private Boolean puedeExportar;
    
    @JsonProperty("puedeImportar")
    private Boolean puedeImportar;
    
    @JsonProperty("puedeAprobar")
    private Boolean puedeAprobar;
    
    @JsonProperty("activo")
    private Boolean activo;
    
    @JsonProperty("fechaCreacion")
    private LocalDateTime fechaCreacion;
    
    @JsonProperty("fechaActualizacion")
    private LocalDateTime fechaActualizacion;
}