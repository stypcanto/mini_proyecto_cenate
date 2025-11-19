package com.styp.cenate.model.segu;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "segu_permisos_rol_modulo", schema = "public")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SeguPermisosRolModulo {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_permiso")
    private Integer idPermiso;
    
    @Column(name = "id_rol", nullable = false)
    private Integer idRol;
    
    @Column(name = "id_modulo", nullable = false)
    private Integer idModulo;
    
    @Column(name = "puede_acceder", nullable = false)
    private Boolean puedeAcceder = true;
    
    @Column(name = "puede_ver", nullable = false)
    private Boolean puedeVer = false;
    
    @Column(name = "puede_crear", nullable = false)
    private Boolean puedeCrear = false;
    
    @Column(name = "puede_editar", nullable = false)
    private Boolean puedeEditar = false;
    
    @Column(name = "puede_eliminar", nullable = false)
    private Boolean puedeEliminar = false;
    
    @Column(name = "puede_exportar", nullable = false)
    private Boolean puedeExportar = false;
    
    @Column(name = "puede_importar", nullable = false)
    private Boolean puedeImportar = false;
    
    @Column(name = "puede_aprobar", nullable = false)
    private Boolean puedeAprobar = false;
    
    @Column(name = "activo", nullable = false)
    private Boolean activo = true;
    
    @Column(name = "autorizado_por", length = 150)
    private String autorizadoPor;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();
}