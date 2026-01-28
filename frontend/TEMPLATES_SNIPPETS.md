# TEMPLATES Y SNIPPETS - Disponibilidad Médica

## 1. Backend - DTO Template

```java
// src/main/java/com/cenate/dto/SolicitudDisponibilidadDTO.java
package com.cenate.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SolicitudDisponibilidadDTO {
    
    private Long idSolicitudDisp;
    private Long idPersonal;
    private Long idPeriodoRegDisp;
    private String estado;  // BORRADOR, ENVIADO, OBSERVADO, APROBADO, RECHAZADO, ANULADO
    private String observacionMedico;
    private String observacionValidador;
    private Integer totalDias;
    private String periodoDescripcion;
    private String periodo;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
    
    private List<SolicitudDisponibilidadDetailDTO> detalles;
}
```

## 2. Backend - Detail DTO Template

```java
// src/main/java/com/cenate/dto/SolicitudDisponibilidadDetailDTO.java
package com.cenate.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SolicitudDisponibilidadDetailDTO {
    
    private Long idDet;
    private Long idSolicitudDisp;
    private LocalDate fecha;
    private Character turno;  // M, T, N
    private Long idHorario;
    private String estado;  // PROPUESTO, APROBADO, RECHAZADO
    private LocalDateTime createdAt;
}
```

## 3. Backend - Repository Template

```java
// src/main/java/com/cenate/repository/SolicitudDisponibilidadRepository.java
package com.cenate.repository;

import com.cenate.model.SolicitudDisponibilidadMedico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface SolicitudDisponibilidadRepository extends JpaRepository<SolicitudDisponibilidadMedico, Long> {
    
    // Listar por personal
    List<SolicitudDisponibilidadMedico> findByIdPersonal(Long idPersonal);
    
    // Obtener por personal y periodo
    Optional<SolicitudDisponibilidadMedico> findByIdPersonalAndIdPeriodoRegDisp(Long idPersonal, Long idPeriodo);
    
    // Verificar existencia
    boolean existsByIdPersonalAndIdPeriodoRegDisp(Long idPersonal, Long idPeriodo);
    
    // Filtrar por estado
    List<SolicitudDisponibilidadMedico> findByIdPersonalAndEstado(Long idPersonal, String estado);
    
    // Contar por estado
    long countByIdPersonalAndEstado(Long idPersonal, String estado);
}
```

## 4. Backend - Service Template (Excerpt)

```java
// src/main/java/com/cenate/service/SolicitudDisponibilidadService.java
package com.cenate.service;

import com.cenate.dto.SolicitudDisponibilidadDTO;
import com.cenate.model.SolicitudDisponibilidadMedico;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class SolicitudDisponibilidadService {
    
    // Validar transición de estado
    public boolean puedeTransicionar(String estadoActual, String estadoNuevo) {
        // BORRADOR -> ENVIADO
        // ENVIADO -> OBSERVADO / APROBADO / RECHAZADO
        // OBSERVADO -> ENVIADO (re-envío)
        // Cualquier estado -> ANULADO
        
        if ("ANULADO".equals(estadoNuevo)) return true; // Siempre puede cancelarse
        if ("BORRADOR".equals(estadoActual) && "ENVIADO".equals(estadoNuevo)) return true;
        if ("ENVIADO".equals(estadoActual) && 
            ("OBSERVADO".equals(estadoNuevo) || 
             "APROBADO".equals(estadoNuevo) || 
             "RECHAZADO".equals(estadoNuevo))) return true;
        if ("OBSERVADO".equals(estadoActual) && "ENVIADO".equals(estadoNuevo)) return true;
        
        return false;
    }
    
    // Validar que las fechas estén en el rango del periodo
    public boolean fechasEnRangoPeriodo(List<LocalDate> fechas, LocalDate fechaInicio, LocalDate fechaFin) {
        return fechas.stream().allMatch(f -> !f.isBefore(fechaInicio) && !f.isAfter(fechaFin));
    }
    
    // Validar turnos permitidos
    public boolean turnoValido(Character turno) {
        return "M".equals(turno) || "T".equals(turno) || "N".equals(turno);
    }
}
```

## 5. Backend - Controller Template (Excerpt)

```java
// src/main/java/com/cenate/controller/SolicitudDisponibilidadController.java
package com.cenate.controller;

import com.cenate.dto.SolicitudDisponibilidadDTO;
import com.cenate.service.SolicitudDisponibilidadService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/solicitudes-disponibilidad")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SolicitudDisponibilidadController {
    
    private final SolicitudDisponibilidadService service;
    
    @GetMapping("/mis-datos")
    public ResponseEntity<?> misDatos() {
        // 1. Obtener id_personal del token/sesión
        // 2. Retornar datos básicos del personal
        return ResponseEntity.ok("{}");
    }
    
    @GetMapping("/mis-solicitudes")
    public ResponseEntity<?> misSolicitudes() {
        // 1. Obtener id_personal del contexto
        // 2. Query: SELECT * FROM solicitud_disponibilidad_medico WHERE id_personal = ?
        return ResponseEntity.ok("[]");
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        // 1. Validar que el usuario sea propietario o admin
        // 2. Cargar solicitud con JOINs a detalles
        // 3. Retornar SolicitudDisponibilidadDTO
        return ResponseEntity.ok("{}");
    }
    
    @PostMapping("/borrador")
    public ResponseEntity<?> guardarBorrador(@RequestBody SolicitudDisponibilidadDTO dto) {
        // 1. Validar periodo existe y está en rango válido
        // 2. Si idSolicitud es null: INSERT con estado BORRADOR
        // 3. Si idSolicitud existe: UPDATE
        // 4. Auditoría: created_by = usuarioActual
        // 5. Retornar solicitud guardada con ID
        return ResponseEntity.ok("{}");
    }
    
    @PutMapping("/{id}/enviar")
    public ResponseEntity<?> enviar(@PathVariable Long id) {
        // 1. Validar que la solicitud esté en BORRADOR
        // 2. Validar que tenga al menos un detalle
        // 3. Cambiar estado a ENVIADO
        // 4. Auditoría: updated_by = usuarioActual
        // 5. Retornar solicitud actualizada
        return ResponseEntity.ok("{}");
    }
    
    @PostMapping("/{idSolicitud}/detalle")
    public ResponseEntity<?> guardarDetalle(
            @PathVariable Long idSolicitud,
            @RequestBody Map<String, Object> request) {
        // 1. Validar que la solicitud exista y pertenezca al usuario
        // 2. Validar que el turno sea válido (M, T, N)
        // 3. Validar que la fecha esté en el rango del periodo
        // 4. INSERT o UPDATE en solicitud_disponibilidad_medico_det
        // 5. Retornar detalle guardado
        return ResponseEntity.ok("{}");
    }
}
```

## 6. Frontend - FormularioDisponibilidad.jsx (Adaptación Mínima)

```jsx
// Lo mínimo a cambiar en FormularioDisponibilidad.jsx
// Reemplazar estas importaciones:

// ANTES:
// import { solicitudTurnoService } from "../../../../services/solicitudTurnoService";
// import periodoSolicitudService from "../../../../services/periodoSolicitudService";

// DESPUÉS:
import { solicitudDisponibilidadService } from "../../../../services/solicitudDisponibilidadService";
import periodoMedicoDisponibilidadService from "../../../../services/periodoMedicoDisponibilidadService";

// Cambiar llamadas:
// ANTES: await solicitudTurnoService.listarMisSolicitudes()
// DESPUÉS: await solicitudDisponibilidadService.listarMisSolicitudes()

// ANTES: await periodoSolicitudService.obtenerVigentes()
// DESPUÉS: await periodoMedicoDisponibilidadService.obtenerVigentes()

// ANTES: await solicitudTurnoService.obtenerMiIpress()
// DESPUÉS: await solicitudDisponibilidadService.obtenerMiDatos()

// Estado: Cambiar "especialidades" por "disponibilidades"
// Cambiar "turnos" por "días de disponibilidad"
```

## 7. Migraciones SQL

```sql
-- Asegurarse de que las tablas existan
-- Ejecutar en el orden correcto:

-- 1. Tabla de cabecera
CREATE TABLE IF NOT EXISTS public.solicitud_disponibilidad_medico (
  id_solicitud_disp bigserial PRIMARY KEY,
  id_personal bigint NOT NULL,
  id_periodo_reg_disp bigint NOT NULL,
  estado varchar(20) NOT NULL DEFAULT 'BORRADOR'
    CHECK (estado IN ('BORRADOR','ENVIADO','OBSERVADO','APROBADO','RECHAZADO','ANULADO')),
  observacion_medico text,
  observacion_validador text,
  created_by varchar(50),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_by varchar(50),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT fk_sdm_personal 
    FOREIGN KEY (id_personal) REFERENCES public.dim_personal_cnt(id_pers),
  CONSTRAINT fk_sdm_periodo 
    FOREIGN KEY (id_periodo_reg_disp) REFERENCES public.periodo_medico_disponibilidad(id_periodo_reg_disp),
  CONSTRAINT uq_sdm_personal_periodo 
    UNIQUE (id_personal, id_periodo_reg_disp)
);

-- 2. Tabla de detalle
CREATE TABLE IF NOT EXISTS public.solicitud_disponibilidad_medico_det (
  id_det bigserial PRIMARY KEY,
  id_solicitud_disp bigint NOT NULL,
  fecha date NOT NULL,
  turno bpchar(1) NOT NULL CHECK (turno IN ('M','T','N')),
  id_horario bigint,
  estado varchar(20) NOT NULL DEFAULT 'PROPUESTO'
    CHECK (estado IN ('PROPUESTO','APROBADO','RECHAZADO')),
  created_at timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT fk_sdm_det_cab 
    FOREIGN KEY (id_solicitud_disp) REFERENCES public.solicitud_disponibilidad_medico(id_solicitud_disp) ON DELETE CASCADE,
  CONSTRAINT fk_sdm_det_horario 
    FOREIGN KEY (id_horario) REFERENCES public.dim_horario(id_horario) ON DELETE RESTRICT
);

-- 3. Índices
CREATE INDEX idx_sdm_personal_estado 
  ON public.solicitud_disponibilidad_medico (id_personal, estado);

CREATE INDEX idx_sdm_periodo_estado 
  ON public.solicitud_disponibilidad_medico (id_periodo_reg_disp, estado);

CREATE INDEX idx_sdm_det_solicitud 
  ON public.solicitud_disponibilidad_medico_det (id_solicitud_disp);

CREATE INDEX idx_sdm_det_fecha 
  ON public.solicitud_disponibilidad_medico_det (fecha);
```

---

## Referencia Rápida: Cambios Principales

| Elemento | Solicitud-Turnos | Disponibilidad |
|----------|-----------------|----------------|
| Service | `solicitudTurnoService` | `solicitudDisponibilidadService` |
| Período Service | `periodoSolicitudService` | `periodoMedicoDisponibilidadService` |
| Tabla Cabecera | `solicitud_turno` | `solicitud_disponibilidad_medico` |
| Tabla Detalle | `solicitud_turno_det` | `solicitud_disponibilidad_medico_det` |
| FK Principal | `id_ipress` | `id_personal` |
| Estados | INICIADO, ENVIADO, REVISADO | BORRADOR, ENVIADO, OBSERVADO |
| Turnos | 2 (M/T) | 3 (M/T/N) |

---

**Estos templates están listos para usar. Solo copia, adapta nombres según tu proyecto, e implementa la lógica específica.**
