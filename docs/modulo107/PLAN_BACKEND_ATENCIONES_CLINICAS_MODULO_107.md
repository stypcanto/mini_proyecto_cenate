# 📋 Plan Backend - Atenciones Clínicas Módulo 107
**CENATE 2026 | Estrategia de implementación backend para tabla de atenciones clínicas**

---

## 🎯 Objetivo General

Implementar un sistema de consulta optimizado para atenciones clínicas del Módulo 107 con filtros avanzados, paginación y estadísticas en tiempo real.

---

## 📊 Análisis: ¿VISTA SQL vs JPA + ENTITY?

### **RECOMENDACIÓN: VISTA SQL + JPA (Enfoque Híbrido)**

#### ✅ **Por qué VISTA en lugar de tablas simples:**

1. **Rendimiento Optimizado**
   - Las atenciones requieren JOINs múltiples (paciente, bolsa, ipress, red, macrorregión, derivación)
   - Una vista pre-materializada ejecuta el JOIN una sola vez en BD
   - Reduce carga en ORM (Hibernate)
   - Queries más rápidas para filtros complejos

2. **Complejidad de Datos Distribuida**
   ```
   Tabla actual: dim_solicitud_bolsa (base)
   Necesita JOINs con:
   - dim_paciente (datos paciente)
   - dim_bolsa (tipo bolsa)
   - dim_ipress (centro asistencial)
   - dim_red (red de salud)
   - dim_macroregion (macrorregión)
   - dim_derivacion_interna (especialidad)
   ```

3. **Estadísticas en Tiempo Real**
   - Vista permite aggregates (COUNT, GROUP BY) eficientes
   - Ej: `SELECT estado, COUNT(*) FROM vista_atenciones GROUP BY estado`

#### ❌ **Por qué NO usar tabla duplicada:**
- Mantener duplicidad de datos es error-prone
- Sincronización constante = overhead

#### ❌ **Por qué NO JPA puro sin vista:**
- Lazy loading + múltiples tablas = N+1 queries
- Specification API de Spring Data = lenta para filtros complejos

---

## 🏗️ Arquitectura Propuesta

```
┌─────────────────────────────────────────┐
│  Frontend (React)                        │
│  - Modulo107AtencionesClinics.jsx       │
└────────────┬────────────────────────────┘
             │ HTTP GET
┌────────────▼──────────────────────────────┐
│  Controller Layer                         │
│  - AtencionClinicaPublicController.java  │
│    GET /api/atenciones-clinicas/listar   │
│    GET /api/atenciones-clinicas/stats    │
└────────────┬──────────────────────────────┘
             │
┌────────────▼──────────────────────────────┐
│  Service Layer                            │
│  - AtencionClinicaService.java           │
│    - listarConFiltros()                  │
│    - obtenerEstadisticas()               │
│    - aplicarFiltros()                    │
└────────────┬──────────────────────────────┘
             │ JPA Query
┌────────────▼──────────────────────────────┐
│  Repository Layer                         │
│  - AtencionClinicaRepository.java        │
│    @Query("SELECT new DTO FROM vw_...")  │
└────────────┬──────────────────────────────┘
             │ SQL
┌────────────▼──────────────────────────────┐
│  PostgreSQL Database                      │
│  - vw_atenciones_clinicas (VIEW)         │
│    (contiene todos los JOINs)            │
└──────────────────────────────────────────┘
```

---

## 📁 Estructura de Ficheros a Crear

```
backend/src/main/java/com/styp/cenate/
├── api/
│   └── atenciones_clinicas/
│       └── AtencionClinicaPublicController.java    [NUEVO]
├── model/
│   ├── AtencionClinica.java                        [NUEVO ENTITY - MAPEA VISTA]
│   └── dto/
│       ├── AtencionClinicaDTO.java                 [NUEVO]
│       ├── AtencionClinicaFiltroDTO.java           [NUEVO]
│       └── EstadisticasAtencionDTO.java            [NUEVO]
├── repository/
│   └── AtencionClinicaRepository.java              [NUEVO]
├── service/
│   ├── atenciones_clinicas/
│   │   ├── AtencionClinicaService.java             [NUEVO INTERFACE]
│   │   └── AtencionClinicaServiceImpl.java          [NUEVO]
│   └── specification/
│       └── AtencionClinicaSpecification.java       [NUEVO]
└── sql/
    └── V999__create_vista_atenciones_clinicas.sql  [NUEVO MIGRATION]

backend/src/main/resources/
└── db/migration/
    └── V999__create_vista_atenciones_clinicas.sql  [CREAR VISTA]
```

---

## 🗄️ Paso 1: Crear VISTA en PostgreSQL

**Archivo:** `backend/src/main/resources/db/migration/V999__create_vista_atenciones_clinicas.sql`

```sql
-- ============================================================================
-- VW_ATENCIONES_CLINICAS - Vista consolidada de atenciones del Módulo 107
-- ============================================================================
-- Consolida datos de múltiples tablas para consulta optimizada
-- Permite filtros por: Estado, TipoDoc, Documento, Fechas, Macrorregión, Red, IPRESS, Derivación

CREATE OR REPLACE VIEW vw_atenciones_clinicas AS
SELECT
    -- 🆔 Identificación
    sb.id_solicitud,
    sb.numero_solicitud,
    sb.id_bolsa,
    sb.activo,
    
    -- 👤 Datos del Paciente
    dp.id_paciente AS paciente_id,
    CONCAT(dp.nombres, ' ', dp.apellido_paterno, ' ', dp.apellido_materno) AS paciente_nombre,
    dp.numero_documento AS paciente_dni,
    td.descripcion AS tipo_documento,
    dp.sexo AS paciente_sexo,
    dp.fecha_nacimiento,
    EXTRACT(YEAR FROM AGE(dp.fecha_nacimiento)) AS paciente_edad,
    dp.telefono AS paciente_telefono,
    
    -- 🏥 Contexto Asistencial
    ir.codigo_adscripcion,
    ir.id_ipress,
    COALESCE(di.nombre, 'SIN DERIVACIÓN') AS derivacion_interna,
    
    -- 📌 Estado y Trazabilidad
    sb.estado,
    sb.fecha_solicitud,
    sb.fecha_actualizacion,
    sb.responsable_gestora_id,
    sb.fecha_asignacion,
    
    -- 🌍 Ubicación
    mr.nombre AS macrorregion,
    r.nombre AS red,
    ir.nombre AS ipress_nombre,
    
    -- Metadata
    sb.created_at,
    sb.updated_at

FROM dim_solicitud_bolsa sb
LEFT JOIN dim_paciente dp ON sb.id_paciente = dp.id_paciente
LEFT JOIN dim_tipo_documento td ON dp.id_tipo_documento = td.id_tipo_documento
LEFT JOIN dim_ipress ir ON sb.id_ipress = ir.id_ipress
LEFT JOIN dim_red r ON ir.id_red = r.id_red
LEFT JOIN dim_macroregion mr ON r.id_macroregion = mr.id_macroregion
LEFT JOIN dim_derivacion_interna di ON sb.id_derivacion_interna = di.id_derivacion_interna
WHERE sb.estado IN ('PENDIENTE', 'ATENDIDO')
ORDER BY sb.fecha_solicitud DESC;

-- Index para optimizar filtros comunes
CREATE INDEX IF NOT EXISTS idx_vw_atencion_estado ON dim_solicitud_bolsa(estado);
CREATE INDEX IF NOT EXISTS idx_vw_atencion_fecha ON dim_solicitud_bolsa(fecha_solicitud);
CREATE INDEX IF NOT EXISTS idx_vw_atencion_ipress ON dim_solicitud_bolsa(id_ipress);
CREATE INDEX IF NOT EXISTS idx_vw_atencion_dni ON dim_paciente(numero_documento);
```

---

## 🧬 Paso 2: Crear ENTITY (Mapeo de Vista)

**Archivo:** `backend/src/main/java/com/styp/cenate/model/AtencionClinica.java`

```java
package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 📋 AtencionClinica - Mapeo de vista vw_atenciones_clinicas
 * Propósito: Solo lectura desde vista materializada para optimizar queries
 * No se persiste directamente, solo se consulta
 */
@Entity
@Table(name = "vw_atenciones_clinicas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtencionClinica {

    // 🆔 Identificación
    @Id
    @Column(name = "id_solicitud")
    private Long idSolicitud;

    @Column(name = "numero_solicitud")
    private String numeroSolicitud;

    @Column(name = "id_bolsa")
    private Long idBolsa;

    @Column(name = "activo")
    private Boolean activo;

    // 👤 Datos del Paciente
    @Column(name = "paciente_id")
    private Long pacienteId;

    @Column(name = "paciente_nombre")
    private String pacienteNombre;

    @Column(name = "paciente_dni")
    private String pacienteDni;

    @Column(name = "tipo_documento")
    private String tipoDocumento;

    @Column(name = "paciente_sexo")
    private String pacienteSexo;

    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;

    @Column(name = "paciente_edad")
    private Integer pacienteEdad;

    @Column(name = "paciente_telefono")
    private String pacienteTelefono;

    // 🏥 Contexto Asistencial
    @Column(name = "codigo_adscripcion")
    private String codigoAdscripcion;

    @Column(name = "id_ipress")
    private Long idIpress;

    @Column(name = "derivacion_interna")
    private String derivacionInterna;

    // 📌 Estado y Trazabilidad
    @Column(name = "estado")
    private String estado;

    @Column(name = "fecha_solicitud")
    private LocalDate fechaSolicitud;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @Column(name = "responsable_gestora_id")
    private Long responsableGestoraId;

    @Column(name = "fecha_asignacion")
    private LocalDate fechaAsignacion;

    // 🌍 Ubicación
    @Column(name = "macroregion")
    private String macrorregion;

    @Column(name = "red")
    private String red;

    @Column(name = "ipress_nombre")
    private String ipressNombre;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}
```

---

## 📦 Paso 3: Crear DTOs

**Archivo:** `backend/src/main/java/com/styp/cenate/dto/AtencionClinicaDTO.java`

```java
package com.styp.cenate.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtencionClinicaDTO {
    // 🆔 Identificación
    private Long idSolicitud;
    private String numeroSolicitud;
    private Long idBolsa;
    private Boolean activo;

    // 👤 Datos del Paciente
    private Long pacienteId;
    private String pacienteNombre;
    private String pacienteDni;
    private String tipoDocumento;
    private String pacienteSexo;
    private LocalDate fechaNacimiento;
    private Integer pacienteEdad;
    private String pacienteTelefono;

    // 🏥 Contexto Asistencial
    private String codigoAdscripcion;
    private Long idIpress;
    private String derivacionInterna;

    // 📌 Estado y Trazabilidad
    private String estado;
    private LocalDate fechaSolicitud;
    private LocalDateTime fechaActualizacion;
    private Long responsableGestoraId;
    private LocalDate fechaAsignacion;

    // 🌍 Ubicación
    private String macrorregion;
    private String red;
    private String ipressNombre;
}
```

**Archivo:** `backend/src/main/java/com/styp/cenate/dto/AtencionClinicaFiltroDTO.java`

```java
package com.styp.cenate.dto;

import lombok.*;

/**
 * DTO para recibir filtros desde frontend
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtencionClinicaFiltroDTO {
    private String estado;
    private String tipoDocumento;
    private String documento;
    private String fechaSolicitudInicio;
    private String fechaSolicitudFin;
    private String macrorregion;
    private String red;
    private String ipress;
    private String derivacionInterna;
    private String searchTerm;
    private Integer page;
    private Integer size;
}
```

**Archivo:** `backend/src/main/java/com/styp/cenate/dto/EstadisticasAtencionDTO.java`

```java
package com.styp.cenate.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EstadisticasAtencionDTO {
    private Long total;
    private Long pendientes;
    private Long atendidos;
}
```

---

## 🔄 Paso 4: Crear REPOSITORY

**Archivo:** `backend/src/main/java/com/styp/cenate/repository/AtencionClinicaRepository.java`

```java
package com.styp.cenate.repository;

import com.styp.cenate.model.AtencionClinica;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AtencionClinicaRepository 
    extends JpaRepository<AtencionClinica, Long>, JpaSpecificationExecutor<AtencionClinica> {

    /**
     * Listar todas las atenciones con paginación
     */
    Page<AtencionClinica> findAll(Pageable pageable);

    /**
     * Buscar por estado (PENDIENTE, ATENDIDO)
     */
    @Query("SELECT a FROM AtencionClinica a WHERE a.estado = :estado ORDER BY a.fechaSolicitud DESC")
    Page<AtencionClinica> findByEstado(@Param("estado") String estado, Pageable pageable);

    /**
     * Buscar por número de documento
     */
    @Query("SELECT a FROM AtencionClinica a WHERE a.pacienteDni LIKE %:dni% ORDER BY a.fechaSolicitud DESC")
    Page<AtencionClinica> findByPacienteDni(@Param("dni") String dni, Pageable pageable);

    /**
     * Filtro combinado: tipo documento + documento
     */
    @Query("SELECT a FROM AtencionClinica a WHERE a.tipoDocumento = :tipoDoc AND a.pacienteDni = :dni")
    Page<AtencionClinica> findByTipoDocumentoAndDni(
        @Param("tipoDoc") String tipoDoc, 
        @Param("dni") String dni, 
        Pageable pageable
    );

    /**
     * Filtro de rango de fechas
     */
    @Query("SELECT a FROM AtencionClinica a WHERE a.fechaSolicitud BETWEEN :inicio AND :fin ORDER BY a.fechaSolicitud DESC")
    Page<AtencionClinica> findByFechaSolicitudBetween(
        @Param("inicio") LocalDate inicio, 
        @Param("fin") LocalDate fin, 
        Pageable pageable
    );

    /**
     * Búsqueda por macrorregión
     */
    @Query("SELECT a FROM AtencionClinica a WHERE a.macrorregion = :macroregion ORDER BY a.fechaSolicitud DESC")
    Page<AtencionClinica> findByMacrorregion(@Param("macroregion") String macroregion, Pageable pageable);

    /**
     * Búsqueda por red
     */
    @Query("SELECT a FROM AtencionClinica a WHERE a.red = :red ORDER BY a.fechaSolicitud DESC")
    Page<AtencionClinica> findByRed(@Param("red") String red, Pageable pageable);

    /**
     * Búsqueda por IPRESS
     */
    @Query("SELECT a FROM AtencionClinica a WHERE a.ipressNombre = :ipress ORDER BY a.fechaSolicitud DESC")
    Page<AtencionClinica> findByIpressNombre(@Param("ipress") String ipress, Pageable pageable);

    /**
     * Búsqueda por derivación interna
     */
    @Query("SELECT a FROM AtencionClinica a WHERE a.derivacionInterna = :derivacion ORDER BY a.fechaSolicitud DESC")
    Page<AtencionClinica> findByDerivacionInterna(@Param("derivacion") String derivacion, Pageable pageable);

    /**
     * Búsqueda general por nombre o DNI
     */
    @Query("SELECT a FROM AtencionClinica a WHERE " +
           "LOWER(a.pacienteNombre) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "a.pacienteDni LIKE %:search% OR " +
           "a.numeroSolicitud LIKE %:search% " +
           "ORDER BY a.fechaSolicitud DESC")
    Page<AtencionClinica> buscarGeneral(@Param("search") String search, Pageable pageable);

    /**
     * Estadísticas globales
     */
    @Query("SELECT COUNT(DISTINCT a.idSolicitud) FROM AtencionClinica a WHERE a.estado = 'PENDIENTE'")
    Long contarPendientes();

    @Query("SELECT COUNT(DISTINCT a.idSolicitud) FROM AtencionClinica a WHERE a.estado = 'ATENDIDO'")
    Long contarAtendidos();

    @Query("SELECT COUNT(DISTINCT a.idSolicitud) FROM AtencionClinica a")
    Long contarTotal();
}
```

---

## 🔧 Paso 5: Crear SPECIFICATION (Filtros Complejos)

**Archivo:** `backend/src/main/java/com/styp/cenate/service/specification/AtencionClinicaSpecification.java`

```java
package com.styp.cenate.service.specification;

import com.styp.cenate.model.AtencionClinica;
import org.springframework.data.jpa.domain.Specification;
import java.time.LocalDate;

public class AtencionClinicaSpecification {

    /**
     * Filtra por estado
     */
    public static Specification<AtencionClinica> conEstado(String estado) {
        return (root, query, cb) -> cb.equal(root.get("estado"), estado);
    }

    /**
     * Filtra por tipo de documento
     */
    public static Specification<AtencionClinica> conTipoDocumento(String tipoDocumento) {
        return (root, query, cb) -> cb.equal(root.get("tipoDocumento"), tipoDocumento);
    }

    /**
     * Filtra por número de documento
     */
    public static Specification<AtencionClinica> conDocumento(String documento) {
        return (root, query, cb) -> cb.like(root.get("pacienteDni"), "%" + documento + "%");
    }

    /**
     * Filtra por rango de fechas
     */
    public static Specification<AtencionClinica> conFechaSolicitudEntre(LocalDate inicio, LocalDate fin) {
        return (root, query, cb) -> cb.between(root.get("fechaSolicitud"), inicio, fin);
    }

    /**
     * Filtra por macrorregión
     */
    public static Specification<AtencionClinica> conMacrorregion(String macrorregion) {
        return (root, query, cb) -> cb.equal(root.get("macrorregion"), macrorregion);
    }

    /**
     * Filtra por red
     */
    public static Specification<AtencionClinica> conRed(String red) {
        return (root, query, cb) -> cb.equal(root.get("red"), red);
    }

    /**
     * Filtra por IPRESS
     */
    public static Specification<AtencionClinica> conIpress(String ipress) {
        return (root, query, cb) -> cb.equal(root.get("ipressNombre"), ipress);
    }

    /**
     * Filtra por derivación interna
     */
    public static Specification<AtencionClinica> conDerivacionInterna(String derivacion) {
        return (root, query, cb) -> cb.equal(root.get("derivacionInterna"), derivacion);
    }

    /**
     * Búsqueda general
     */
    public static Specification<AtencionClinica> conBusquedaGeneral(String search) {
        return (root, query, cb) -> cb.or(
            cb.like(cb.lower(root.get("pacienteNombre")), "%" + search.toLowerCase() + "%"),
            cb.like(root.get("pacienteDni"), "%" + search + "%"),
            cb.like(root.get("numeroSolicitud"), "%" + search + "%")
        );
    }

    /**
     * Combina múltiples especificaciones
     */
    public static Specification<AtencionClinica> conFiltros(
        String estado,
        String tipoDocumento,
        String documento,
        LocalDate fechaInicio,
        LocalDate fechaFin,
        String macrorregion,
        String red,
        String ipress,
        String derivacion,
        String search
    ) {
        Specification<AtencionClinica> spec = Specification.where(null);

        if (estado != null && !estado.equals("todos")) {
            spec = spec.and(conEstado(estado));
        }
        if (tipoDocumento != null && !tipoDocumento.equals("todos")) {
            spec = spec.and(conTipoDocumento(tipoDocumento));
        }
        if (documento != null && !documento.isEmpty()) {
            spec = spec.and(conDocumento(documento));
        }
        if (fechaInicio != null && fechaFin != null) {
            spec = spec.and(conFechaSolicitudEntre(fechaInicio, fechaFin));
        }
        if (macrorregion != null && !macrorregion.equals("todas")) {
            spec = spec.and(conMacrorregion(macrorregion));
        }
        if (red != null && !red.equals("todas")) {
            spec = spec.and(conRed(red));
        }
        if (ipress != null && !ipress.equals("todas")) {
            spec = spec.and(conIpress(ipress));
        }
        if (derivacion != null && !derivacion.equals("todas")) {
            spec = spec.and(conDerivacionInterna(derivacion));
        }
        if (search != null && !search.isEmpty()) {
            spec = spec.and(conBusquedaGeneral(search));
        }

        return spec;
    }
}
```

---

## 💼 Paso 6: Crear SERVICE INTERFACE y IMPLEMENTACIÓN

**Archivo:** `backend/src/main/java/com/styp/cenate/service/atenciones_clinicas/AtencionClinicaService.java`

```java
package com.styp.cenate.service.atenciones_clinicas;

import com.styp.cenate.dto.AtencionClinicaDTO;
import com.styp.cenate.dto.AtencionClinicaFiltroDTO;
import com.styp.cenate.dto.EstadisticasAtencionDTO;
import org.springframework.data.domain.Page;

public interface AtencionClinicaService {

    /**
     * Listar atenciones con filtros y paginación
     */
    Page<AtencionClinicaDTO> listarConFiltros(AtencionClinicaFiltroDTO filtro);

    /**
     * Obtener estadísticas globales
     */
    EstadisticasAtencionDTO obtenerEstadisticas();

    /**
     * Obtener detalle de una atención
     */
    AtencionClinicaDTO obtenerDetalle(Long idSolicitud);
}
```

**Archivo:** `backend/src/main/java/com/styp/cenate/service/atenciones_clinicas/AtencionClinicaServiceImpl.java`

```java
package com.styp.cenate.service.atenciones_clinicas;

import com.styp.cenate.dto.AtencionClinicaDTO;
import com.styp.cenate.dto.AtencionClinicaFiltroDTO;
import com.styp.cenate.dto.EstadisticasAtencionDTO;
import com.styp.cenate.model.AtencionClinica;
import com.styp.cenate.repository.AtencionClinicaRepository;
import com.styp.cenate.service.specification.AtencionClinicaSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AtencionClinicaServiceImpl implements AtencionClinicaService {

    private final AtencionClinicaRepository repository;

    @Override
    public Page<AtencionClinicaDTO> listarConFiltros(AtencionClinicaFiltroDTO filtro) {
        log.info("🔍 Listando atenciones con filtros: {}", filtro);

        try {
            // Parsear parámetros
            LocalDate fechaInicio = null;
            LocalDate fechaFin = null;
            if (filtro.getFechaSolicitudInicio() != null && !filtro.getFechaSolicitudInicio().isEmpty()) {
                fechaInicio = LocalDate.parse(filtro.getFechaSolicitudInicio());
            }
            if (filtro.getFechaSolicitudFin() != null && !filtro.getFechaSolicitudFin().isEmpty()) {
                fechaFin = LocalDate.parse(filtro.getFechaSolicitudFin());
            }

            // Pageable
            int page = filtro.getPage() != null ? filtro.getPage() : 0;
            int size = filtro.getSize() != null ? filtro.getSize() : 25;
            Pageable pageable = PageRequest.of(page, size);

            // Especificación con filtros
            var spec = AtencionClinicaSpecification.conFiltros(
                filtro.getEstado(),
                filtro.getTipoDocumento(),
                filtro.getDocumento(),
                fechaInicio,
                fechaFin,
                filtro.getMacrorregion(),
                filtro.getRed(),
                filtro.getIpress(),
                filtro.getDerivacionInterna(),
                filtro.getSearchTerm()
            );

            // Query
            Page<AtencionClinica> resultado = repository.findAll(spec, pageable);

            log.info("✅ Se encontraron {} atenciones", resultado.getTotalElements());

            // Mapear a DTO
            return resultado.map(this::toDTO);

        } catch (Exception e) {
            log.error("❌ Error al listar atenciones: {}", e.getMessage(), e);
            throw new RuntimeException("Error al filtrar atenciones clínicas: " + e.getMessage());
        }
    }

    @Override
    public EstadisticasAtencionDTO obtenerEstadisticas() {
        log.info("📊 Obteniendo estadísticas de atenciones");

        try {
            Long total = repository.contarTotal();
            Long pendientes = repository.contarPendientes();
            Long atendidos = repository.contarAtendidos();

            EstadisticasAtencionDTO stats = EstadisticasAtencionDTO.builder()
                .total(total)
                .pendientes(pendientes)
                .atendidos(atendidos)
                .build();

            log.info("✅ Estadísticas: Total={}, Pendientes={}, Atendidos={}", total, pendientes, atendidos);

            return stats;

        } catch (Exception e) {
            log.error("❌ Error al obtener estadísticas: {}", e.getMessage(), e);
            throw new RuntimeException("Error al obtener estadísticas: " + e.getMessage());
        }
    }

    @Override
    public AtencionClinicaDTO obtenerDetalle(Long idSolicitud) {
        log.info("🔎 Obteniendo detalle de atención: {}", idSolicitud);

        try {
            AtencionClinica atencion = repository.findById(idSolicitud)
                .orElseThrow(() -> new RuntimeException("Atención no encontrada: " + idSolicitud));

            return toDTO(atencion);

        } catch (Exception e) {
            log.error("❌ Error al obtener detalle: {}", e.getMessage(), e);
            throw new RuntimeException("Error al obtener detalle de atención: " + e.getMessage());
        }
    }

    /**
     * Convierte AtencionClinica a AtencionClinicaDTO
     */
    private AtencionClinicaDTO toDTO(AtencionClinica atencion) {
        return AtencionClinicaDTO.builder()
            .idSolicitud(atencion.getIdSolicitud())
            .numeroSolicitud(atencion.getNumeroSolicitud())
            .idBolsa(atencion.getIdBolsa())
            .activo(atencion.getActivo())
            .pacienteId(atencion.getPacienteId())
            .pacienteNombre(atencion.getPacienteNombre())
            .pacienteDni(atencion.getPacienteDni())
            .tipoDocumento(atencion.getTipoDocumento())
            .pacienteSexo(atencion.getPacienteSexo())
            .fechaNacimiento(atencion.getFechaNacimiento())
            .pacienteEdad(atencion.getPacienteEdad())
            .pacienteTelefono(atencion.getPacienteTelefono())
            .codigoAdscripcion(atencion.getCodigoAdscripcion())
            .idIpress(atencion.getIdIpress())
            .derivacionInterna(atencion.getDerivacionInterna())
            .estado(atencion.getEstado())
            .fechaSolicitud(atencion.getFechaSolicitud())
            .fechaActualizacion(atencion.getFechaActualizacion())
            .responsableGestoraId(atencion.getResponsableGestoraId())
            .fechaAsignacion(atencion.getFechaAsignacion())
            .macrorregion(atencion.getMacrorregion())
            .red(atencion.getRed())
            .ipressNombre(atencion.getIpressNombre())
            .build();
    }
}
```

---

## 🎮 Paso 7: Crear CONTROLLER

**Archivo:** `backend/src/main/java/com/styp/cenate/api/atenciones_clinicas/AtencionClinicaPublicController.java`

```java
package com.styp.cenate.api.atenciones_clinicas;

import com.styp.cenate.dto.AtencionClinicaDTO;
import com.styp.cenate.dto.AtencionClinicaFiltroDTO;
import com.styp.cenate.dto.EstadisticasAtencionDTO;
import com.styp.cenate.service.atenciones_clinicas.AtencionClinicaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/atenciones-clinicas")
@CrossOrigin(origins = "*")
@Slf4j
@RequiredArgsConstructor
public class AtencionClinicaPublicController {

    private final AtencionClinicaService service;

    /**
     * GET /api/atenciones-clinicas/listar
     * Listar atenciones con filtros y paginación
     */
    @GetMapping("/listar")
    public ResponseEntity<Page<AtencionClinicaDTO>> listar(
        @RequestParam(value = "estado", required = false) String estado,
        @RequestParam(value = "tipoDocumento", required = false) String tipoDocumento,
        @RequestParam(value = "documento", required = false) String documento,
        @RequestParam(value = "fechaInicio", required = false) String fechaInicio,
        @RequestParam(value = "fechaFin", required = false) String fechaFin,
        @RequestParam(value = "macrorregion", required = false) String macrorregion,
        @RequestParam(value = "red", required = false) String red,
        @RequestParam(value = "ipress", required = false) String ipress,
        @RequestParam(value = "derivacion", required = false) String derivacion,
        @RequestParam(value = "search", required = false) String search,
        @RequestParam(value = "page", defaultValue = "0") Integer page,
        @RequestParam(value = "size", defaultValue = "25") Integer size
    ) {
        try {
            log.info("📋 Solicitado: Listar atenciones (página {}, tamaño {})", page, size);

            AtencionClinicaFiltroDTO filtro = AtencionClinicaFiltroDTO.builder()
                .estado(estado)
                .tipoDocumento(tipoDocumento)
                .documento(documento)
                .fechaSolicitudInicio(fechaInicio)
                .fechaSolicitudFin(fechaFin)
                .macrorregion(macrorregion)
                .red(red)
                .ipress(ipress)
                .derivacionInterna(derivacion)
                .searchTerm(search)
                .page(page)
                .size(size)
                .build();

            Page<AtencionClinicaDTO> resultado = service.listarConFiltros(filtro);

            return ResponseEntity.ok(resultado);

        } catch (Exception e) {
            log.error("❌ Error al listar atenciones: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * GET /api/atenciones-clinicas/estadisticas
     * Obtener estadísticas globales
     */
    @GetMapping("/estadisticas")
    public ResponseEntity<Map<String, Object>> estadisticas() {
        try {
            log.info("📊 Solicitado: Estadísticas de atenciones");

            EstadisticasAtencionDTO stats = service.obtenerEstadisticas();

            return ResponseEntity.ok(Map.of(
                "total", stats.getTotal(),
                "pendientes", stats.getPendientes(),
                "atendidos", stats.getAtendidos()
            ));

        } catch (Exception e) {
            log.error("❌ Error al obtener estadísticas: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * GET /api/atenciones-clinicas/{id}
     * Obtener detalle de una atención
     */
    @GetMapping("/{id}")
    public ResponseEntity<AtencionClinicaDTO> detalle(@PathVariable Long id) {
        try {
            log.info("🔎 Solicitado: Detalle de atención {}", id);

            AtencionClinicaDTO detalle = service.obtenerDetalle(id);

            return ResponseEntity.ok(detalle);

        } catch (Exception e) {
            log.error("❌ Error al obtener detalle: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}
```

---

## 🔗 Conexión Frontend-Backend

**Actualizar `frontend/src/services/atencionesClinicasService.js`:**

```javascript
// Nueva función para obtener atenciones del Módulo 107
export const listarAtencionesClinicas = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filtros.estado && filtros.estado !== 'todos') params.append('estado', filtros.estado);
    if (filtros.tipoDocumento && filtros.tipoDocumento !== 'todos') params.append('tipoDocumento', filtros.tipoDocumento);
    if (filtros.documento) params.append('documento', filtros.documento);
    if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
    if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
    if (filtros.macrorregion && filtros.macrorregion !== 'todas') params.append('macrorregion', filtros.macrorregion);
    if (filtros.red && filtros.red !== 'todas') params.append('red', filtros.red);
    if (filtros.ipress && filtros.ipress !== 'todas') params.append('ipress', filtros.ipress);
    if (filtros.derivacion && filtros.derivacion !== 'todas') params.append('derivacion', filtros.derivacion);
    if (filtros.search) params.append('search', filtros.search);
    if (filtros.page) params.append('page', filtros.page);
    if (filtros.size) params.append('size', filtros.size || 25);

    const response = await fetch(`http://localhost:8080/api/atenciones-clinicas/listar?${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth.token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error('Error al cargar atenciones');
    
    return await response.json();
  } catch (error) {
    console.error('Error en listarAtencionesClinicas:', error);
    throw error;
  }
};

export const obtenerEstadisticasAtenciones = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/atenciones-clinicas/estadisticas', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth.token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error('Error al cargar estadísticas');
    
    return await response.json();
  } catch (error) {
    console.error('Error en obtenerEstadisticasAtenciones:', error);
    throw error;
  }
};
```

---

## 📋 Resumen de Archivos a Crear

| Tipo | Archivo | Descripción |
|------|---------|-------------|
| **SQL** | `V999__create_vista_atenciones_clinicas.sql` | Vista materializada en BD |
| **Entity** | `AtencionClinica.java` | Mapeo JPA de la vista |
| **DTO** | `AtencionClinicaDTO.java` | Transfer Object para respuestas |
| **DTO** | `AtencionClinicaFiltroDTO.java` | Transfer Object para filtros |
| **DTO** | `EstadisticasAtencionDTO.java` | Transfer Object para estadísticas |
| **Repository** | `AtencionClinicaRepository.java` | Acceso a datos |
| **Specification** | `AtencionClinicaSpecification.java` | Filtros complejos |
| **Service** | `AtencionClinicaService.java` | Interface del servicio |
| **ServiceImpl** | `AtencionClinicaServiceImpl.java` | Implementación del servicio |
| **Controller** | `AtencionClinicaPublicController.java` | Endpoints REST |

---

## 🚀 Orden de Implementación

1. **Crear migration SQL** - Vista en BD
2. **Crear Entity** - Mapeo JPA
3. **Crear DTOs** - Objetos de transferencia
4. **Crear Repository** - Acceso a datos
5. **Crear Specification** - Filtros complejos
6. **Crear Service** - Lógica de negocio
7. **Crear Controller** - Endpoints REST
8. **Actualizar Frontend** - Llamadas a APIs

---

## ✅ Testing

**Postman/CURL ejemplos:**

```bash
# Listar todas
GET http://localhost:8080/api/atenciones-clinicas/listar?page=0&size=25

# Filtrar por estado
GET http://localhost:8080/api/atenciones-clinicas/listar?estado=PENDIENTE&page=0&size=25

# Búsqueda
GET http://localhost:8080/api/atenciones-clinicas/listar?search=Juan&page=0&size=25

# Rango de fechas
GET http://localhost:8080/api/atenciones-clinicas/listar?fechaInicio=2026-01-01&fechaFin=2026-01-31

# Estadísticas
GET http://localhost:8080/api/atenciones-clinicas/estadisticas

# Detalle
GET http://localhost:8080/api/atenciones-clinicas/1
```

---

**Creado por:** Asistente CENATE | **Versión:** 2.0.0 | **Fecha:** 30 Enero 2026
