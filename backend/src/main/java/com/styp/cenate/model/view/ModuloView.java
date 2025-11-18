// ========================================================================
// 🧩 ModuloView.java
// ------------------------------------------------------------------------
// Mapea la vista SQL "vw_modulos_accesibles" del esquema público.
// Solo lectura (@Immutable) → lista los módulos visibles para un usuario.
// Compatible con Hibernate y Lombok (Spring Boot 3.x / Java 17).
// ========================================================================

package com.styp.cenate.model.view;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Immutable;
import java.time.LocalDateTime;

@Entity
@Table(name = "vw_modulos_accesibles")
@Immutable
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModuloView {

    // 🆔 Identificador del módulo
    @Id
    @Column(name = "id_modulo")
    private Integer idModulo;

    // 📛 Nombre del módulo (ej. Gestión de Citas, Analítica y Reportes)
    @Column(name = "nombre_modulo", length = 100)
    private String nombreModulo;

    // 📝 Descripción del módulo
    @Column(name = "descripcion")
    private String descripcion;

    // 🎨 Icono asociado (Lucide Icons)
    @Column(name = "icono", length = 100)
    private String icono;

    // 🧭 Ruta base del módulo en el frontend
    @Column(name = "ruta_base", length = 200)
    private String rutaBase;

    // ⚙️ Estado del módulo
    @Column(name = "activo")
    private Boolean activo;

    // 🕒 Auditoría
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // 👤 Usuario relacionado (solo informativo, no clave)
    @Column(name = "id_user")
    private Long idUser;
}